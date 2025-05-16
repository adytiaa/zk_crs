-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATIENT', 'DOCTOR', 'RESEARCHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccessRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "recordPda" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "encryptedDataHash" TEXT NOT NULL,
    "ownerEncryptedSymmetricKey" TEXT NOT NULL,
    "offChainCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onChainCreatedAt" TIMESTAMP(3),
    "isOffChainActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" TEXT NOT NULL,
    "medicalRecordId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "granterId" TEXT NOT NULL,
    "status" "AccessRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestMessage" TEXT,
    "rejectionReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastStatusUpdate" TIMESTAMP(3) NOT NULL,
    "accessGrantId" TEXT,

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessGrant" (
    "id" TEXT NOT NULL,
    "grantPda" TEXT NOT NULL,
    "medicalRecordId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "reEncryptedSymmetricKey" TEXT NOT NULL,
    "offChainCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onChainGrantedAt" TIMESTAMP(3),
    "isOffChainActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AccessGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_recordPda_key" ON "MedicalRecord"("recordPda");

-- CreateIndex
CREATE INDEX "MedicalRecord_ownerId_idx" ON "MedicalRecord"("ownerId");

-- CreateIndex
CREATE INDEX "MedicalRecord_cid_idx" ON "MedicalRecord"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "AccessRequest_accessGrantId_key" ON "AccessRequest"("accessGrantId");

-- CreateIndex
CREATE INDEX "AccessRequest_medicalRecordId_idx" ON "AccessRequest"("medicalRecordId");

-- CreateIndex
CREATE INDEX "AccessRequest_requesterId_idx" ON "AccessRequest"("requesterId");

-- CreateIndex
CREATE INDEX "AccessRequest_granterId_idx" ON "AccessRequest"("granterId");

-- CreateIndex
CREATE INDEX "AccessRequest_status_idx" ON "AccessRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AccessGrant_grantPda_key" ON "AccessGrant"("grantPda");

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_granterId_fkey" FOREIGN KEY ("granterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_accessGrantId_fkey" FOREIGN KEY ("accessGrantId") REFERENCES "AccessGrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessGrant" ADD CONSTRAINT "AccessGrant_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessGrant" ADD CONSTRAINT "AccessGrant_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
