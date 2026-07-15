/**
 * Classifies a search query into a routing decision BEFORE any product
 * lookup happens. This is deliberately separate from actually resolving a
 * product (see resolveExactProduct in search-data.ts): classification only
 * answers "should this query skip clarification?", never "which product is
 * this?" — conflating the two was the original bug, where a generic term
 * like "dishwasher" happened to be a substring of the one seeded dishwasher's
 * name and got treated as an exact match.
 */

export type ProductClassification = "exact_product" | "product_family" | "category" | "unknown";

export type ClassificationResult = {
  classification: ProductClassification;
  confidence: number;
  reason: string;
};

// ---- Check-digit validation ----

/** UPC-A (12), EAN-8 (8), EAN-13 (13), and GTIN-14 (14) all use the same GS1 mod-10 weighted algorithm. */
export function isValidGtinCheckDigit(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  if (![8, 12, 13, 14].includes(digits.length)) return false;

  const nums = digits.split("").map(Number);
  const checkDigit = nums[nums.length - 1];
  const payload = nums.slice(0, -1).reverse();

  let sum = 0;
  for (let i = 0; i < payload.length; i++) {
    sum += payload[i] * (i % 2 === 0 ? 3 : 1);
  }
  const calculated = (10 - (sum % 10)) % 10;
  return calculated === checkDigit;
}

/** ISBN-10: weights 10..1 left to right, valid when the weighted sum is divisible by 11. 'X' represents 10. */
export function isValidIsbn10(code: string): boolean {
  const c = code.trim().toUpperCase();
  if (!/^\d{9}[\dX]$/.test(c)) return false;

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const value = c[i] === "X" ? 10 : Number(c[i]);
    sum += (10 - i) * value;
  }
  return sum % 11 === 0;
}

/** Any of UPC/EAN/GTIN (8/12/13/14 digit) or ISBN-10, with a valid check digit. */
export function isValidProductIdentifier(query: string): boolean {
  const trimmed = query.trim();
  if (/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(trimmed)) {
    return isValidGtinCheckDigit(trimmed);
  }
  if (/^\d{9}[\dXx]$/.test(trimmed)) {
    return isValidIsbn10(trimmed);
  }
  return false;
}

/** True for any 8/9/10/12/13/14-digit-shaped string, valid or not — used to distinguish "malformed identifier" from "not an identifier at all". */
function looksLikeIdentifierShape(query: string): boolean {
  const trimmed = query.trim();
  return /^\d{8}$|^\d{9}[\dXx]$|^\d{12}$|^\d{13}$|^\d{14}$/.test(trimmed);
}

// ---- ASIN ----

const ASIN_PATTERN = /^B0[A-Z0-9]{8}$/i;

export function isAsinPattern(query: string): boolean {
  return ASIN_PATTERN.test(query.trim());
}

// ---- Generic category terms ----
// Deliberately generic, catalog-independent terms — a category word must never
// be promoted to exact_product just because it happens to be a substring of
// some seeded product's name.
const CATEGORY_TERMS = [
  "dishwasher", "laptop", "refrigerator", "fridge", "television", "tv",
  "washing machine", "washer", "dryer", "phone", "smartphone", "mattress",
  "vacuum cleaner", "vacuum", "backpack", "bag", "jacket", "headphones",
  "earbuds", "monitor", "printer", "microwave", "oven", "blender", "toaster",
  "camera", "speaker", "tablet", "router", "keyboard", "mouse", "charger",
  "watch", "shoes", "sneakers", "helicopter", "car", "boat",
];

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findCategoryTerm(query: string): string | null {
  const q = normalize(query);
  for (const term of CATEGORY_TERMS) {
    const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, "i");
    if (re.test(q)) return term;
  }
  return null;
}

// A "model-number-like" token mixes letters and digits (e.g. "RF28T5001SR",
// "SHPM65Z55N", "AH-4200") — distinct from a plain category word, which is
// pure letters.
const MODEL_TOKEN_PATTERN = /\b(?=[a-z0-9-]*\d)(?=[a-z0-9-]*[a-z])[a-z0-9-]{4,}\b/gi;

function findModelToken(query: string): string | null {
  const matches = query.match(MODEL_TOKEN_PATTERN);
  if (!matches) return null;
  return [...matches].sort((a, b) => b.length - a.length)[0];
}

const NON_BRAND_LEAD_WORDS = new Set([
  "a", "an", "the", "i", "my", "some", "any", "new", "used", "open", "for", "please",
]);

/**
 * Generic brand-shaped-word detector, for brands not in our own catalog (we
 * carry 3 brands; the world has many more). Uses capitalization as the
 * signal for "this looks like a proper noun" since there's no real brand
 * dictionary to check against — a real brand name typed in lowercase that
 * we don't carry won't be caught by this path (catalog brands remain
 * case-insensitive via the Brand table lookup, which doesn't have this
 * limitation for the brands we actually carry).
 */
function findGenericBrandLikeToken(query: string): string | null {
  for (const word of query.split(/\s+/)) {
    if (/\d/.test(word)) continue; // a token with digits is model-shaped, not brand-shaped
    const clean = word.replace(/[^A-Za-z]/g, "");
    if (clean.length < 2) continue;
    if (!/^[A-Z]/.test(clean)) continue; // must start capitalized
    // Long ALL-CAPS strings read as acronym/model codes rather than brand
    // names, but keep short ones (LG, GE, GM) — real brand acronyms.
    if (clean === clean.toUpperCase() && clean.length > 4) continue;
    const lower = clean.toLowerCase();
    if (CATEGORY_TERMS.includes(lower) || NON_BRAND_LEAD_WORDS.has(lower)) continue;
    return clean;
  }
  return null;
}

function looksLikeGibberish(query: string): boolean {
  const q = query.trim();
  if (/\s/.test(q)) return false; // multi-word strings aren't judged as gibberish here
  if (q.length < 8) return false;
  const letters = q.replace(/[^a-z]/gi, "");
  if (letters.length < 6) return false;
  const vowels = (letters.match(/[aeiou]/gi) ?? []).length;
  return vowels / letters.length < 0.15;
}

export type ClassifierContext = {
  /** Known brand names, e.g. from the Brand table. */
  brandNames: string[];
  /** Known canonical product names, for exact whole-string matching. */
  catalogModelNames?: string[];
};

/**
 * Classifies a query for routing purposes only. `confidence`/`reason` are
 * internal diagnostics — never render them in customer-facing UI.
 */
export function classifyQuery(rawQuery: string, context: ClassifierContext): ClassificationResult {
  const query = rawQuery.trim();
  if (!query) {
    return { classification: "unknown", confidence: 0, reason: "empty_query" };
  }

  // 1. Numeric product identifiers (UPC/EAN/GTIN/ISBN-10) — check digit first,
  //    so a malformed identifier is never silently treated as a real product.
  if (looksLikeIdentifierShape(query)) {
    if (isValidProductIdentifier(query)) {
      return { classification: "exact_product", confidence: 0.99, reason: "valid_identifier_checkdigit" };
    }
    return { classification: "unknown", confidence: 0.05, reason: "invalid_identifier_checkdigit" };
  }

  // 2. ASIN
  if (isAsinPattern(query)) {
    return { classification: "exact_product", confidence: 0.9, reason: "asin_pattern" };
  }

  // 3. Product URL
  if (/^https?:\/\//i.test(query)) {
    return { classification: "exact_product", confidence: 0.85, reason: "product_url" };
  }

  // 4. Exact catalog name match (whole-string, case-insensitive)
  if (context.catalogModelNames?.some((name) => normalize(name) === normalize(query))) {
    return { classification: "exact_product", confidence: 0.95, reason: "catalog_exact_name_match" };
  }

  // 5. Brand + model together is specific enough to skip clarification even
  //    if a generic category word is also present ("Samsung refrigerator
  //    RF28T5001SR" is still exact_product). "Model" here is either a
  //    classic alphanumeric code (regex token) or a known catalog product
  //    name appearing as a substring ("Apple iPhone 6" — "6" alone is too
  //    short to look like a model-number token, but "iPhone 6" is a real,
  //    recognized product name).
  const matchedBrand = context.brandNames.find((b) => new RegExp(`\\b${escapeRegExp(b)}\\b`, "i").test(query));
  const modelToken = findModelToken(query);
  const matchedCatalogName = context.catalogModelNames?.some((name) =>
    normalize(query).includes(normalize(name)),
  );
  if (matchedBrand && (modelToken || matchedCatalogName)) {
    return {
      classification: "exact_product",
      confidence: 0.9,
      reason: matchedCatalogName ? "brand_catalog_name_match" : "brand_model_match",
    };
  }

  // Brand not in our own (small) catalog, but the query still has the shape
  // of "Brand ModelNumber" (e.g. "Samsung RF28T5001SR") — specific enough to
  // skip clarification even though we may not carry it; resolveExactProduct
  // will honestly find nothing and this ends in a real no-match state.
  const genericBrand = findGenericBrandLikeToken(query);
  if (genericBrand && modelToken && genericBrand.toLowerCase() !== modelToken.toLowerCase()) {
    return { classification: "exact_product", confidence: 0.75, reason: "generic_brand_model_pattern" };
  }

  // 6. Bare/dominant generic category term, with no brand+model to rescue it.
  const categoryTerm = findCategoryTerm(query);
  if (categoryTerm) {
    return { classification: "category", confidence: 0.85, reason: "generic_category_term" };
  }

  // 7. Brand mentioned with no model number — a product family, not one item.
  //    Applies to both our own catalog brands and the generic shape-based
  //    detector (e.g. "Bosch appliances", "Sony electronics").
  if (matchedBrand || genericBrand) {
    return { classification: "product_family", confidence: matchedBrand ? 0.6 : 0.45, reason: "brand_only" };
  }

  // 8. A model-number-like token with no identifiable brand is ambiguous —
  //    could be several products across brands.
  if (modelToken) {
    return { classification: "product_family", confidence: 0.5, reason: "model_token_without_brand" };
  }

  // 9. A partial/prefix match against a known catalog name ("iPhone" against
  //    "iPhone 6") — recognizably related to something we carry, but not
  //    specific enough on its own to be the exact configuration.
  if (
    context.catalogModelNames?.some(
      (name) => normalize(query).length >= 3 && normalize(name).startsWith(normalize(query)),
    )
  ) {
    return { classification: "product_family", confidence: 0.55, reason: "catalog_name_prefix_match" };
  }

  // 10. Single-token strings that don't look like real words.
  if (looksLikeGibberish(query)) {
    return { classification: "unknown", confidence: 0.2, reason: "unparseable_gibberish" };
  }

  // 11. Default: descriptive natural-language text, treated as needing
  //     clarification like any other category-level request.
  return { classification: "category", confidence: 0.4, reason: "descriptive_query_default" };
}
