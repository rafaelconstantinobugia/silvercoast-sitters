-- Create missing enum types (skip if they exist)
DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert sample services if they don't exist
INSERT INTO public.services (name, description, service_type, base_price, duration_hours) 
SELECT * FROM (VALUES
    ('Pet Sitting - Daily Visit', 'Daily visit to feed and care for your pets', 'pet_sitting', 25.00, 1),
    ('Pet Sitting - Overnight', 'Overnight pet sitting in your home', 'pet_sitting', 45.00, 12),
    ('House Sitting - Daily Check', 'Daily house check and basic maintenance', 'house_sitting', 30.00, 1),
    ('House Sitting - Extended Stay', 'Full house sitting with overnight stays', 'house_sitting', 60.00, 24),
    ('Complete Care Package', 'Combined pet and house sitting services', 'both', 75.00, 24)
) AS v(name, description, service_type, base_price, duration_hours)
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE active = true LIMIT 1);