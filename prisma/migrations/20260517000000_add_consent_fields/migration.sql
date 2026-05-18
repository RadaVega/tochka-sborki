-- Add explicit personal-data processing consent flags to all form-backed tables.
ALTER TABLE "Contact" ADD COLUMN "consent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subscriber" ADD COLUMN "consent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProjectSubmission" ADD COLUMN "consent" BOOLEAN NOT NULL DEFAULT false;
