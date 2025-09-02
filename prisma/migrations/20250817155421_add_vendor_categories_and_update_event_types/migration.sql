/*
  Warnings:

  - The `event_types` column on the `service_categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `event_types` column on the `vendor_services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `category` to the `service_categories` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."VendorCategory" AS ENUM ('cake', 'dress', 'florist', 'jeweller', 'music', 'photographer', 'transportation', 'venue', 'videographer');

-- AlterTable
ALTER TABLE "public"."service_categories" ADD COLUMN     "category" "public"."VendorCategory" NOT NULL,
DROP COLUMN "event_types",
ADD COLUMN     "event_types" "public"."EventType"[] DEFAULT ARRAY[]::"public"."EventType"[];

-- AlterTable
ALTER TABLE "public"."vendor_services" DROP COLUMN "event_types",
ADD COLUMN     "event_types" "public"."EventType"[] DEFAULT ARRAY[]::"public"."EventType"[];
