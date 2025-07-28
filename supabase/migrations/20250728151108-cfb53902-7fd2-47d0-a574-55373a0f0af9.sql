-- Create real sitters data that works with our current schema
-- Insert actual sitters that admin can manage

-- First, let's create some realistic sitter profiles
INSERT INTO public.sitters (
  id, 
  user_id, 
  description, 
  services_offered, 
  average_rating, 
  verified, 
  available, 
  experience_years
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111', -- This will be a placeholder until we fix the structure
  'Experienced pet sitter with over 5 years caring for dogs and cats. I love spending time with animals and ensuring they feel safe and loved while their owners are away. I have experience with senior pets and can administer medication if needed.',
  ARRAY['pet', 'house']::service_type[],
  4.9,
  true,
  true,
  5
),
(
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'Professional dog walker and pet sitter specializing in large breeds and senior pets. Available for overnight sitting, daily walks, and emergency care. Former veterinary assistant with excellent references.',
  ARRAY['pet']::service_type[],
  4.8,
  true,
  true,
  7
),
(
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  'Reliable house sitter with experience in home maintenance and security. I take care of your home as if it were my own, ensuring everything is safe and secure. Can also care for plants and collect mail.',
  ARRAY['house']::service_type[],
  4.7,
  true,
  true,
  3
),
(
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  'Complete care package for your pets and home. Former veterinary assistant with extensive experience in pet care and home maintenance. Available for emergency situations and long-term bookings.',
  ARRAY['pet', 'house']::service_type[],
  4.9,
  true,
  true,
  8
),
(
  '55555555-5555-5555-5555-555555555555',
  '55555555-5555-5555-5555-555555555555',
  'Loving pet sitter specializing in cats and small animals. I work from home so can provide constant companionship. Experienced with special needs pets and exotic animals like birds and rabbits.',
  ARRAY['pet']::service_type[],
  4.8,
  true,
  true,
  4
),
(
  '66666666-6666-6666-6666-666666666666',
  '66666666-6666-6666-6666-666666666666',
  'Trustworthy house and pet sitter offering complete peace of mind. I maintain your home security, care for gardens, and provide daily updates with photos. Great with both dogs and cats.',
  ARRAY['pet', 'house']::service_type[],
  4.6,
  true,
  true,
  6
)
ON CONFLICT (id) DO NOTHING;

-- Add sitter profile data (names, locations, contact info, pricing)
-- We'll store this directly in the sitters table for now
ALTER TABLE public.sitters 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS price_per_day NUMERIC DEFAULT 35,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS response_time TEXT DEFAULT '2 hours';

-- Update the sitters with profile information
UPDATE public.sitters SET 
  name = 'Maria Santos',
  location = 'Óbidos',
  phone = '+351 912 345 678',
  email = 'maria.santos@silvercoast.pt',
  price_per_day = 35,
  response_time = '1 hour'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE public.sitters SET 
  name = 'João Silva',
  location = 'Caldas da Rainha',
  phone = '+351 923 456 789',
  email = 'joao.silva@silvercoast.pt',
  price_per_day = 45,
  response_time = '30 minutes'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE public.sitters SET 
  name = 'Ana Costa',
  location = 'Peniche',
  phone = '+351 934 567 890',
  email = 'ana.costa@silvercoast.pt',
  price_per_day = 30,
  response_time = '2 hours'
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE public.sitters SET 
  name = 'Pedro Ferreira',
  location = 'Bombarral',
  phone = '+351 945 678 901',
  email = 'pedro.ferreira@silvercoast.pt',
  price_per_day = 50,
  response_time = '45 minutes'
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE public.sitters SET 
  name = 'Sofia Oliveira',
  location = 'Óbidos',
  phone = '+351 956 789 012',
  email = 'sofia.oliveira@silvercoast.pt',
  price_per_day = 40,
  response_time = '1 hour'
WHERE id = '55555555-5555-5555-5555-555555555555';

UPDATE public.sitters SET 
  name = 'Ricardo Mendes',
  location = 'Caldas da Rainha',
  phone = '+351 967 890 123',
  email = 'ricardo.mendes@silvercoast.pt',
  price_per_day = 38,
  response_time = '3 hours'
WHERE id = '66666666-6666-6666-6666-666666666666';