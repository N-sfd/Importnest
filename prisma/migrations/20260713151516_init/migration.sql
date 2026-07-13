-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "isAuthorized" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "attributeSchema" TEXT,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CanonicalProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelNumber" TEXT,
    "configuration" TEXT,
    CONSTRAINT "CanonicalProduct_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CanonicalProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductIdentifier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "canonicalProductId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "ProductIdentifier_canonicalProductId_fkey" FOREIGN KEY ("canonicalProductId") REFERENCES "CanonicalProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductAttribute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "canonicalProductId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    CONSTRAINT "ProductAttribute_canonicalProductId_fkey" FOREIGN KEY ("canonicalProductId") REFERENCES "CanonicalProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "licensingNotes" TEXT,
    "refreshCadenceMinutes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "canonicalProductId" TEXT,
    "condition" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "shipping" REAL NOT NULL DEFAULT 0,
    "fees" REAL NOT NULL DEFAULT 0,
    "deliveryLabel" TEXT,
    "freshnessCapturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Listing_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "shipping" REAL NOT NULL DEFAULT 0,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceHistory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "canonicalProductId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "ProductMatch_canonicalProductId_fkey" FOREIGN KEY ("canonicalProductId") REFERENCES "CanonicalProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductMatch_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productMatchId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "conflicts" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchReview_productMatchId_fkey" FOREIGN KEY ("productMatchId") REFERENCES "ProductMatch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatchReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "AppUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "authProvider" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SearchSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "categoryId" TEXT,
    "query" TEXT NOT NULL,
    "inputType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchSessionId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "canonicalProductId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    CONSTRAINT "Recommendation_searchSessionId_fkey" FOREIGN KEY ("searchSessionId") REFERENCES "SearchSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Recommendation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecommendationFactor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recommendationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "positive" BOOLEAN NOT NULL,
    CONSTRAINT "RecommendationFactor_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "canonicalProductId" TEXT NOT NULL,
    "listingId" TEXT,
    CONSTRAINT "SavedProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedProduct_canonicalProductId_fkey" FOREIGN KEY ("canonicalProductId") REFERENCES "CanonicalProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedProduct_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "canonicalProductId" TEXT NOT NULL,
    "listingId" TEXT,
    "type" TEXT NOT NULL,
    "threshold" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Alert_canonicalProductId_fkey" FOREIGN KEY ("canonicalProductId") REFERENCES "CanonicalProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Alert_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutboundReferral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchSessionId" TEXT,
    "listingId" TEXT NOT NULL,
    "referralToken" TEXT NOT NULL,
    "convertedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutboundReferral_searchSessionId_fkey" FOREIGN KEY ("searchSessionId") REFERENCES "SearchSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SponsoredCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "advertiser" TEXT NOT NULL,
    "sourceId" TEXT,
    "budget" REAL,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active'
);

-- CreateTable
CREATE TABLE "SponsoredPlacement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "listingId" TEXT,
    "slot" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Sponsored',
    CONSTRAINT "SponsoredPlacement_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "SponsoredCampaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SponsoredPlacement_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RankingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT,
    "version" INTEGER NOT NULL,
    "weights" TEXT NOT NULL,
    "freshnessThresholdMinutes" INTEGER NOT NULL,
    "matchThreshold" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductIdentifier_value_key" ON "ProductIdentifier"("value");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OutboundReferral_referralToken_key" ON "OutboundReferral"("referralToken");
