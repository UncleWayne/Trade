-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "broker" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CLOSED',
    "instrumentType" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "entryPrice" REAL NOT NULL,
    "exitPrice" REAL,
    "entryDate" DATETIME NOT NULL,
    "exitDate" DATETIME,
    "fees" REAL NOT NULL DEFAULT 0,
    "contractMultiplier" REAL,
    "lotSize" REAL,
    "strike" REAL,
    "expiry" DATETIME,
    "optionType" TEXT,
    "pnl" REAL,
    "notes" TEXT,
    CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TradeTag" (
    "tradeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("tradeId", "tagId"),
    CONSTRAINT "TradeTag_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TradeTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tradeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "Attachment_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Trade_userId_idx" ON "Trade"("userId");

-- CreateIndex
CREATE INDEX "Trade_accountId_idx" ON "Trade"("accountId");

-- CreateIndex
CREATE INDEX "Trade_entryDate_idx" ON "Trade"("entryDate");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- CreateIndex
CREATE INDEX "Attachment_tradeId_idx" ON "Attachment"("tradeId");
