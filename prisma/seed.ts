import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.recommendationFactor.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.matchReview.deleteMany();
  await prisma.productMatch.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.outboundReferral.deleteMany();
  await prisma.sponsoredPlacement.deleteMany();
  await prisma.sponsoredCampaign.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.savedProduct.deleteMany();
  await prisma.searchSession.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productIdentifier.deleteMany();
  await prisma.canonicalProduct.deleteMany();
  await prisma.source.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.appUser.deleteMany();
  await prisma.rankingConfig.deleteMany();
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000);
}

async function main() {
  await clearDatabase();

  const brand = await prisma.brand.create({
    data: {
      id: "brand-apex",
      name: "Apex Home",
      slug: "apex-home",
      isAuthorized: true,
    },
  });

  const category = await prisma.category.create({
    data: {
      id: "cat-appliances",
      name: "Appliances",
      slug: "appliances",
    },
  });

  const extraCategories = [
    { id: "cat-electronics", name: "Electronics", slug: "electronics" },
    { id: "cat-footwear", name: "Footwear", slug: "footwear" },
    { id: "cat-home", name: "Home", slug: "home" },
    { id: "cat-beauty-devices", name: "Beauty Devices", slug: "beauty-devices" },
    { id: "cat-accessories", name: "Accessories", slug: "accessories" },
  ];
  for (const c of extraCategories) {
    await prisma.category.create({ data: c });
  }

  const categoryBySlug: Record<string, string> = {
    appliances: category.id,
    electronics: "cat-electronics",
    footwear: "cat-footwear",
    home: "cat-home",
    "beauty-devices": "cat-beauty-devices",
    accessories: "cat-accessories",
  };

  const product = await prisma.canonicalProduct.create({
    data: {
      id: "cp-apex-ah4200",
      brandId: brand.id,
      categoryId: category.id,
      modelName: "Apex Home Quiet Dishwasher",
      modelNumber: "AH-4200",
      configuration: "Standard, Matte Black",
      identifiers: {
        create: [
          { type: "UPC", value: "012345678905" },
          { type: "MPN", value: "AH-4200" },
        ],
      },
      attributes: {
        create: [
          { key: "Noise level", value: "42", unit: "dB" },
          { key: "Capacity", value: "14", unit: "place settings" },
          { key: "Color", value: "Matte black" },
        ],
      },
    },
  });

  // Stub products referenced by Saved / Alerts screens in mock data.
  const stubProducts = [
    { id: "cp-air-purifier", modelName: "Air purifier for large room", categorySlug: "home" },
    { id: "cp-running-shoe", modelName: "Running shoe, size 9", categorySlug: "footwear" },
    { id: "cp-cordless-vacuum", modelName: "Cordless vacuum", categorySlug: "appliances" },
  ];
  for (const stub of stubProducts) {
    await prisma.canonicalProduct.create({
      data: {
        id: stub.id,
        brandId: brand.id,
        categoryId: categoryBySlug[stub.categorySlug] ?? category.id,
        modelName: stub.modelName,
      },
    });
  }

  const sources = [
    { id: "src-official", name: "Official Brand Store", sourceType: "manufacturer-feed" },
    { id: "src-retailer-direct", name: "Retailer Direct", sourceType: "affiliate-feed" },
    { id: "src-local-electronics", name: "Local Electronics", sourceType: "partner-feed" },
    { id: "src-authorized-outlet", name: "Authorized Outlet", sourceType: "licensed-provider" },
    { id: "src-discount-home", name: "Discount Home Supply", sourceType: "web-extraction" },
  ];
  for (const source of sources) {
    await prisma.source.create({ data: { ...source, isActive: true } });
  }

  const listingDefs = [
    {
      id: "listing-official",
      sourceId: "src-official",
      condition: "new",
      price: 899.0,
      shipping: 0,
      fees: 0,
      deliveryLabel: "Thu, free",
      freshnessMinutesAgo: 4,
      matchConfidence: 0.98,
      matchType: "exact",
    },
    {
      id: "listing-retailer-direct",
      sourceId: "src-retailer-direct",
      condition: "new",
      price: 879.99,
      shipping: 0,
      fees: 0,
      deliveryLabel: "Tomorrow",
      freshnessMinutesAgo: 4,
      matchConfidence: 0.97,
      matchType: "exact",
    },
    {
      id: "listing-local-electronics",
      sourceId: "src-local-electronics",
      condition: "open-box",
      price: 842.0,
      shipping: 0,
      fees: 0,
      deliveryLabel: "Pickup today",
      freshnessMinutesAgo: 4,
      matchConfidence: 0.95,
      matchType: "exact",
    },
    {
      id: "listing-authorized-outlet",
      sourceId: "src-authorized-outlet",
      condition: "certified-refurbished",
      price: 799.0,
      shipping: 0,
      fees: 0,
      deliveryLabel: "3-5 days",
      freshnessMinutesAgo: 22,
      matchConfidence: 0.93,
      matchType: "exact",
    },
    {
      id: "listing-discount-home",
      sourceId: "src-discount-home",
      condition: "new",
      price: 769.0,
      shipping: 29.0,
      fees: 0,
      deliveryLabel: "5-7 days",
      freshnessMinutesAgo: 35,
      matchConfidence: 0.62,
      matchType: "exact",
      matchStatus: "pending",
    },
  ] as const;

  for (const def of listingDefs) {
    await prisma.listing.create({
      data: {
        id: def.id,
        sourceId: def.sourceId,
        canonicalProductId: product.id,
        condition: def.condition,
        price: def.price,
        shipping: def.shipping,
        fees: def.fees,
        deliveryLabel: def.deliveryLabel,
        freshnessCapturedAt: minutesAgo(def.freshnessMinutesAgo),
      },
    });

    await prisma.productMatch.create({
      data: {
        id: `match-${def.id}`,
        canonicalProductId: product.id,
        listingId: def.id,
        type: def.matchType,
        confidence: def.matchConfidence,
        status: "matchStatus" in def ? def.matchStatus : "approved",
      },
    });
  }

  const demoUser = await prisma.appUser.create({
    data: {
      id: "user-demo",
      email: "demo@importnest.local",
      authProvider: "local",
      isAdmin: true,
    },
  });

  const session = await prisma.searchSession.create({
    data: {
      id: "session-demo",
      userId: demoUser.id,
      categoryId: category.id,
      query: "Apex Home AH-4200 dishwasher",
      inputType: "model-number",
      status: "open",
    },
  });

  const recommendationDefs = [
    {
      listingId: "listing-official",
      rank: 1,
      label: "Best overall",
      rationale:
        "This option fits your priorities best: new condition from the official brand store, delivery before your requested date, and the strongest warranty and return coverage.",
      factors: [
        {
          label: "New condition from the official brand store",
          detail: "Sold and fulfilled by Apex Home directly.",
          positive: true,
        },
        {
          label: "Delivery before your requested date",
          detail: "Arrives Thursday, free shipping.",
          positive: true,
        },
        {
          label: "Full two-year manufacturer warranty",
          detail: "Longest warranty among compared offers.",
          positive: true,
        },
        {
          label: "Thirty-day return window",
          detail: "Matches your risk tolerance.",
          positive: true,
        },
      ],
    },
    {
      listingId: "listing-retailer-direct",
      rank: 2,
      label: "Lowest cost",
      rationale: "Lowest total known cost among new-condition listings, with next-day delivery.",
      factors: [
        {
          label: "Lowest new-condition price",
          detail: "$19.01 less than Official Brand Store.",
          positive: true,
        },
        {
          label: "Shorter warranty",
          detail: "1-year vs 2-year at Official Brand Store.",
          positive: false,
        },
      ],
    },
    {
      listingId: "listing-local-electronics",
      rank: 3,
      label: "Fastest",
      rationale: "Available for pickup today; fastest way to receive the product.",
      factors: [
        { label: "Pickup today", detail: "Ready for same-day collection.", positive: true },
        {
          label: "Open-box condition",
          detail: "Not new; inspect before purchase.",
          positive: false,
        },
      ],
    },
    {
      listingId: "listing-authorized-outlet",
      rank: 4,
      label: "Best value (refurbished)",
      rationale:
        "Lowest total cost overall via a certified refurbished unit with a full year of warranty coverage.",
      factors: [
        { label: "Lowest total cost", detail: "$100 less than the official store.", positive: true },
        {
          label: "Certified refurbished",
          detail: "Inspected and certified by an authorized outlet.",
          positive: false,
        },
      ],
    },
  ];

  for (const rec of recommendationDefs) {
    await prisma.recommendation.create({
      data: {
        searchSessionId: session.id,
        listingId: rec.listingId,
        canonicalProductId: product.id,
        rank: rec.rank,
        label: rec.label,
        rationale: rec.rationale,
        factors: { create: rec.factors },
      },
    });
  }

  const savedDefs = [
    {
      productId: "cp-air-purifier",
      alertType: "price-drop",
      threshold: "≤ $250",
      isActive: true,
    },
    {
      productId: "cp-running-shoe",
      alertType: "back-in-stock",
      threshold: "Back in stock",
      isActive: true,
    },
    {
      productId: "cp-cordless-vacuum",
      alertType: "any-change",
      threshold: "Any price drop",
      isActive: true,
    },
  ];

  for (const saved of savedDefs) {
    await prisma.savedProduct.create({
      data: {
        userId: demoUser.id,
        canonicalProductId: saved.productId,
      },
    });
    await prisma.alert.create({
      data: {
        userId: demoUser.id,
        canonicalProductId: saved.productId,
        type: saved.alertType,
        threshold: saved.threshold,
        isActive: saved.isActive,
      },
    });
  }

  await prisma.matchReview.create({
    data: {
      id: "review-1",
      productMatchId: "match-listing-discount-home",
      reviewerId: demoUser.id,
      decision: "mark-comparable",
      conflicts: JSON.stringify([
        {
          attribute: "Brand",
          canonicalValue: "Apex Home",
          candidateValue: "Apex Home",
          result: "match",
        },
        {
          attribute: "Model number",
          canonicalValue: "AH-4200",
          candidateValue: "AH4200-B",
          result: "review",
        },
        {
          attribute: "UPC / GTIN",
          canonicalValue: "012345678905",
          candidateValue: "Not provided",
          result: "missing",
        },
        {
          attribute: "Colour",
          canonicalValue: "Matte black",
          candidateValue: "Graphite",
          result: "conflict",
        },
        {
          attribute: "Configuration",
          canonicalValue: "Standard",
          candidateValue: "Standard",
          result: "match",
        },
      ]),
      notes: "Candidate from Discount Home Supply below match threshold (0.62 < 0.9).",
    },
  });

  await prisma.rankingConfig.create({
    data: {
      categoryId: category.id,
      version: 1,
      weights: JSON.stringify({
        price: 0.35,
        delivery: 0.25,
        warranty: 0.2,
        returns: 0.2,
      }),
      freshnessThresholdMinutes: 60,
      matchThreshold: 0.9,
    },
  });

  console.log("Seed complete:");
  console.log(`  Brand / category / product: ${product.modelName}`);
  console.log(`  Listings: ${listingDefs.length}`);
  console.log(`  Recommendations: ${recommendationDefs.length}`);
  console.log(`  Saved products / alerts: ${savedDefs.length}`);
  console.log("  Match review cases: 1");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
