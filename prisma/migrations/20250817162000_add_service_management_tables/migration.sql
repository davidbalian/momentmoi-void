-- CreateEnum
CREATE TYPE "public"."PricingModel" AS ENUM ('fixed', 'hourly', 'package', 'custom');

-- CreateEnum
CREATE TYPE "public"."PricingType" AS ENUM ('basic', 'standard', 'premium', 'custom');

-- CreateEnum
CREATE TYPE "public"."AnalyticsEventType" AS ENUM ('view', 'inquiry', 'contact', 'favorite');

-- AlterTable
ALTER TABLE "public"."vendor_services" ADD COLUMN "pricing_model" "public"."PricingModel" NOT NULL DEFAULT 'fixed',
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "public"."service_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt_text" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

    CONSTRAINT "service_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_pricing" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" UUID NOT NULL,
    "pricing_type" "public"."PricingType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "duration" TEXT,
    "includes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

    CONSTRAINT "service_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_analytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" UUID NOT NULL,
    "event_type" "public"."AnalyticsEventType" NOT NULL,
    "event_data" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

    CONSTRAINT "service_analytics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."service_images" ADD CONSTRAINT "service_images_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."vendor_services"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."service_pricing" ADD CONSTRAINT "service_pricing_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."vendor_services"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."service_analytics" ADD CONSTRAINT "service_analytics_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."vendor_services"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
