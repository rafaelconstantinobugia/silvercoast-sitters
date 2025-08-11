-- Update services to hourly pricing (except full day services)
UPDATE public.services 
SET 
  base_price = CASE 
    WHEN name LIKE '%24h%' OR name LIKE '%dia completo%' OR name LIKE '%full day%' OR service_type = 'house' THEN base_price
    ELSE ROUND(base_price / 8, 2) -- Convert daily to hourly (assuming 8-hour day)
  END,
  duration_hours = CASE 
    WHEN name LIKE '%24h%' OR name LIKE '%dia completo%' OR name LIKE '%full day%' OR service_type = 'house' THEN 24
    ELSE 1 -- Default to 1 hour for hourly services
  END;

-- Add new hourly services to complement existing ones
INSERT INTO public.services (name, service_type, base_price, duration_hours, description, active) VALUES 
('Dog Walking', 'pet', 15.00, 1, 'Professional dog walking service for exercise and companionship', true),
('Pet Visit & Check', 'pet', 12.00, 1, 'Quick visit to feed, water, and check on your pets', true),
('Pet Feeding & Care', 'pet', 10.00, 1, 'Basic feeding and care visit for your pets', true),
('Extended Pet Care', 'pet', 18.00, 2, '2-hour extended care session with play time and attention', true),
('Pet Overnight Stay', 'pet', 150.00, 24, 'Full overnight pet sitting service at your home', true),
('House Check & Security', 'house', 20.00, 1, 'Security check of your property with mail collection', true),
('House & Garden Care', 'house', 25.00, 2, 'House monitoring with plant watering and garden care', true),
('Full House Sitting', 'house', 180.00, 24, 'Complete house sitting service with overnight stay', true),
('Combined Pet & House Care', 'combined', 22.00, 2, 'Comprehensive care for both pets and property', true),
('Premium Overnight Service', 'combined', 200.00, 24, 'Premium overnight service for pets and house sitting', true)
ON CONFLICT DO NOTHING;