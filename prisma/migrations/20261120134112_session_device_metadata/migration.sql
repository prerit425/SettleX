-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "ip_address" VARCHAR(64),
ADD COLUMN     "user_agent" VARCHAR(300);
