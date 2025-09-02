-- Add Categorized Gallery Images to Vendor Profiles
-- This script adds 5 themed gallery images for each vendor based on their category

INSERT INTO vendor_gallery (vendor_id, image_url, caption, display_order, is_featured, created_at, updated_at)
SELECT
  vp.id as vendor_id,
  CASE vp.business_category
    -- Photographer images
    WHEN 'photographer' THEN
      CASE img_num
        WHEN 1 THEN 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 2 THEN 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 3 THEN 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 4 THEN 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 5 THEN 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop&crop=center&q=80'
      END
    -- Cake images
    WHEN 'cake' THEN
      CASE img_num
        WHEN 1 THEN 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 2 THEN 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 3 THEN 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 4 THEN 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 5 THEN 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&h=600&fit=crop&crop=center&q=80'
      END
    -- Florist images
    WHEN 'florist' THEN
      CASE img_num
        WHEN 1 THEN 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 2 THEN 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 3 THEN 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 4 THEN 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 5 THEN 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop&crop=center&q=80'
      END
    -- Dress images
    WHEN 'dress' THEN
      CASE img_num
        WHEN 1 THEN 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 2 THEN 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 3 THEN 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 4 THEN 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 5 THEN 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&crop=center&q=80'
      END
    -- Venue images
    WHEN 'venue' THEN
      CASE img_num
        WHEN 1 THEN 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 2 THEN 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 3 THEN 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 4 THEN 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 5 THEN 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&crop=center&q=80'
      END
    -- Music images
    WHEN 'music' THEN
      CASE img_num
        WHEN 1 THEN 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 2 THEN 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 3 THEN 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 4 THEN 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 5 THEN 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center&q=80'
      END
    -- Videographer images
    WHEN 'videographer' THEN
      CASE img_num
        WHEN 1 THEN 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 2 THEN 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 3 THEN 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 4 THEN 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 5 THEN 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop&crop=center&q=80'
      END
    -- Jeweller images
    WHEN 'jeweller' THEN
      CASE img_num
        WHEN 1 THEN 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 2 THEN 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 3 THEN 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 4 THEN 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 5 THEN 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop&crop=center&q=80'
      END
    -- Transportation images
    WHEN 'transportation' THEN
      CASE img_num
        WHEN 1 THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 2 THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 3 THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 4 THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 5 THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center&q=80'
      END
    ELSE
      -- Default images for any other categories
      CASE img_num
        WHEN 1 THEN 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 2 THEN 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 3 THEN 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 4 THEN 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop&crop=center&q=80'
        WHEN 5 THEN 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop&crop=center&q=80'
      END
  END as image_url,
  -- Generate category-specific captions
  CASE vp.business_category
    WHEN 'photographer' THEN
      CASE img_num
        WHEN 1 THEN CONCAT(vp.business_name, ' - Wedding Photography Portfolio')
        WHEN 2 THEN 'Romantic couple portrait session'
        WHEN 3 THEN 'Stunning bridal portrait with natural lighting'
        WHEN 4 THEN 'Candid moments from reception celebration'
        WHEN 5 THEN 'Beautiful sunset engagement photos'
      END
    WHEN 'cake' THEN
      CASE img_num
        WHEN 1 THEN CONCAT('Signature wedding cake by ', vp.business_name)
        WHEN 2 THEN 'Multi-tiered masterpiece with intricate details'
        WHEN 3 THEN 'Custom cake design with edible flowers'
        WHEN 4 THEN 'Birthday cake celebration centerpiece'
        WHEN 5 THEN 'Elegant naked cake with fresh berries'
      END
    WHEN 'florist' THEN
      CASE img_num
        WHEN 1 THEN CONCAT('Floral artistry by ', vp.business_name)
        WHEN 2 THEN 'Bridal bouquet with seasonal flowers'
        WHEN 3 THEN 'Ceremony arch decoration'
        WHEN 4 THEN 'Table centerpieces and arrangements'
        WHEN 5 THEN 'Reception hall floral installations'
      END
    WHEN 'dress' THEN
      CASE img_num
        WHEN 1 THEN CONCAT('Bridal collection by ', vp.business_name)
        WHEN 2 THEN 'Elegant A-line wedding gown'
        WHEN 3 THEN 'Mermaid silhouette masterpiece'
        WHEN 4 THEN 'Vintage-inspired bridal dress'
        WHEN 5 THEN 'Bridal party dresses and accessories'
      END
    WHEN 'venue' THEN
      CASE img_num
        WHEN 1 THEN CONCAT(vp.business_name, ' - Event Venue Showcase')
        WHEN 2 THEN 'Grand ballroom with crystal chandeliers'
        WHEN 3 THEN 'Outdoor garden ceremony space'
        WHEN 4 THEN 'Elegant dining hall setup'
        WHEN 5 THEN 'Versatile event spaces for any occasion'
      END
    WHEN 'music' THEN
      CASE img_num
        WHEN 1 THEN CONCAT('Live entertainment by ', vp.business_name)
        WHEN 2 THEN 'Wedding ceremony string quartet'
        WHEN 3 THEN 'Full band performance at reception'
        WHEN 4 THEN 'DJ setup with professional lighting'
        WHEN 5 THEN 'First dance musical performance'
      END
    WHEN 'videographer' THEN
      CASE img_num
        WHEN 1 THEN CONCAT(vp.business_name, ' - Wedding Cinematography')
        WHEN 2 THEN 'Cinematic wedding ceremony footage'
        WHEN 3 THEN 'Highlight reel production'
        WHEN 4 THEN 'Documentary-style wedding video'
        WHEN 5 THEN 'Drone footage and creative angles'
      END
    WHEN 'jeweller' THEN
      CASE img_num
        WHEN 1 THEN CONCAT('Fine jewelry by ', vp.business_name)
        WHEN 2 THEN 'Diamond engagement ring collection'
        WHEN 3 THEN 'Custom wedding band design'
        WHEN 4 THEN 'Platinum and gold jewelry showcase'
        WHEN 5 THEN 'Bridal jewelry styling and accessories'
      END
    WHEN 'transportation' THEN
      CASE img_num
        WHEN 1 THEN CONCAT('Luxury transportation by ', vp.business_name)
        WHEN 2 THEN 'Classic Rolls-Royce wedding car'
        WHEN 3 THEN 'Limousine service for special events'
        WHEN 4 THEN 'Vintage car collection'
        WHEN 5 THEN 'Group transportation solutions'
      END
    ELSE
      CASE img_num
        WHEN 1 THEN CONCAT('Featured work by ', vp.business_name)
        WHEN 2 THEN 'Professional craftsmanship showcase'
        WHEN 3 THEN 'Client project highlights'
        WHEN 4 THEN 'Quality service delivery'
        WHEN 5 THEN 'Satisfied customer results'
      END
  END as caption,
  img_num - 1 as display_order,
  CASE WHEN img_num = 1 THEN true ELSE false END as is_featured,
  NOW() as created_at,
  NOW() as updated_at
FROM vendor_profiles vp
CROSS JOIN (
  SELECT 1 as img_num UNION ALL
  SELECT 2 as img_num UNION ALL
  SELECT 3 as img_num UNION ALL
  SELECT 4 as img_num UNION ALL
  SELECT 5 as img_num
) img_nums
ORDER BY vp.id, img_num;

-- Verification query
SELECT
  COUNT(*) as total_images_added,
  COUNT(DISTINCT vendor_id) as vendors_with_gallery,
  business_category,
  COUNT(*) as images_per_category
FROM vendor_profiles vp
JOIN vendor_gallery vg ON vp.id = vg.vendor_id
GROUP BY business_category
ORDER BY business_category;
