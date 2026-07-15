-- CreateTable
CREATE TABLE "SearchClarification" (
    "id" TEXT NOT NULL,
    "searchSessionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "resolvedAttribute" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchClarification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SearchClarification" ADD CONSTRAINT "SearchClarification_searchSessionId_fkey" FOREIGN KEY ("searchSessionId") REFERENCES "SearchSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
