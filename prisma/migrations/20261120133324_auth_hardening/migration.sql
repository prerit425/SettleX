-- CreateTable
CREATE TABLE "auth_attempts" (
    "id" UUID NOT NULL,
    "email_hash" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_attempts_email_hash_created_at_idx" ON "auth_attempts"("email_hash", "created_at");
