-- CreateTable
CREATE TABLE "intake_form_documents" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intake_form_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "intake_form_documents" ADD CONSTRAINT "intake_form_documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
