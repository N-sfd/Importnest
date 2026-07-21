/** Map catalog color/finish labels to swatch CSS — only for known tokens; unknown → neutral. */
export function colorSwatchStyle(label: string): { background: string; border?: string } {
  const key = label.toLowerCase();
  if (/black|graphite|charcoal/.test(key)) return { background: "#1a1a1a" };
  if (/white|ivory|cream/.test(key)) return { background: "#f5f5f5", border: "1px solid #cfd8e3" };
  if (/silver|grey|gray|steel/.test(key)) return { background: "#9aa3ad" };
  if (/blue|navy|azure/.test(key)) return { background: "#2f6fed" };
  if (/red|crimson|burgundy/.test(key)) return { background: "#c0455a" };
  if (/green|olive|sage/.test(key)) return { background: "#3d8b5f" };
  if (/gold|brass|bronze/.test(key)) return { background: "#c9a227" };
  if (/brown|walnut|oak|wood/.test(key)) return { background: "#8b5e3c" };
  if (/beige|tan|sand/.test(key)) return { background: "#d2b48c" };
  if (/pink|rose/.test(key)) return { background: "#e8a0b0" };
  if (/purple|violet/.test(key)) return { background: "#7a5ca9" };
  if (/yellow|mustard/.test(key)) return { background: "#e6c200" };
  if (/orange|copper/.test(key)) return { background: "#d97706" };
  if (/matte/.test(key)) return { background: "#2a2a2a" };
  return { background: "#dbe3ec", border: "1px solid #b7c4d1" };
}
