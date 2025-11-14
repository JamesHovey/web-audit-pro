-- CreateTable
CREATE TABLE "AuditShare" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "sharedWithUserId" TEXT NOT NULL,
    "sharedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditShare_sharedWithUserId_idx" ON "AuditShare"("sharedWithUserId");

-- CreateIndex
CREATE INDEX "AuditShare_auditId_idx" ON "AuditShare"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditShare_auditId_sharedWithUserId_key" ON "AuditShare"("auditId", "sharedWithUserId");

-- AddForeignKey
ALTER TABLE "AuditShare" ADD CONSTRAINT "AuditShare_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditShare" ADD CONSTRAINT "AuditShare_sharedWithUserId_fkey" FOREIGN KEY ("sharedWithUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditShare" ADD CONSTRAINT "AuditShare_sharedByUserId_fkey" FOREIGN KEY ("sharedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
