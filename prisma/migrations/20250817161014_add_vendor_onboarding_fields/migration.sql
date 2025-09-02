/*
  Warnings:

  - Added the required column `business_category` to the `vendor_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ContactType" AS ENUM ('email', 'phone');

-- CreateEnum
CREATE TYPE "public"."CyprusLocation" AS ENUM ('nicosia', 'limassol', 'larnaca', 'paphos', 'platres', 'paralimni_ayia_napa', 'whole_cyprus');

-- AlterEnum
ALTER TYPE "public"."UserType" ADD VALUE 'viewer';

-- AlterTable
ALTER TABLE "public"."vendor_profiles" ADD COLUMN     "business_category" "public"."VendorCategory" NOT NULL,
ADD COLUMN     "event_types" "public"."EventType"[] DEFAULT ARRAY[]::"public"."EventType"[];

-- CreateTable
CREATE TABLE "public"."vendor_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" UUID NOT NULL,
    "contact_type" "public"."ContactType" NOT NULL,
    "contact_value" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vendor_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" UUID NOT NULL,
    "location" "public"."CyprusLocation" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_locations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."vendor_contacts" ADD CONSTRAINT "vendor_contacts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendor_locations" ADD CONSTRAINT "vendor_locations_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
