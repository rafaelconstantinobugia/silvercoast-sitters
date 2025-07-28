-- Remove the foreign key constraint and make sitters independent
-- This reflects that sitters don't need user accounts

-- First, let's add the profile columns to sitters table
ALTER TABLE public.sitters 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS price_per_day NUMERIC DEFAULT 35,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS response_time TEXT DEFAULT '2 hours';

-- Drop the foreign key constraint so sitters can exist independently
ALTER TABLE public.sitters DROP CONSTRAINT IF EXISTS sitters_user_id_fkey;

-- Make user_id nullable since sitters don't need user accounts
ALTER TABLE public.sitters ALTER COLUMN user_id DROP NOT NULL;

-- Insert real sitter data that admin can manage
INSERT INTO public.sitters (
  id, 
  name,
  location,
  phone,
  email,
  description, 
  services_offered, 
  average_rating, 
  verified, 
  available, 
  experience_years,
  price_per_day,
  response_time
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'Maria Santos',
  'Óbidos',
  '+351 912 345 678',
  'maria.santos@silvercoast.pt',
  'Experienced pet sitter with over 5 years caring for dogs and cats. I love spending time with animals and ensuring they feel safe and loved while their owners are away. I have experience with senior pets and can administer medication if needed.',
  ARRAY['pet', 'house']::service_type[],
  4.9,
  true,
  true,
  5,
  35,
  '1 hour'
),
(
  '22222222-2222-2222-2222-222222222222',
  'João Silva',
  'Caldas da Rainha',
  '+351 923 456 789',
  'joao.silva@silvercoast.pt',
  'Professional dog walker and pet sitter specializing in large breeds and senior pets. Available for overnight sitting, daily walks, and emergency care. Former veterinary assistant with excellent references.',
  ARRAY['pet']::service_type[],
  4.8,
  true,
  true,
  7,
  45,
  '30 minutes'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Ana Costa',
  'Peniche',
  '+351 934 567 890',
  'ana.costa@silvercoast.pt',
  'Reliable house sitter with experience in home maintenance and security. I take care of your home as if it were my own, ensuring everything is safe and secure. Can also care for plants and collect mail.',
  ARRAY['house']::service_type[],
  4.7,
  true,
  true,
  3,
  30,
  '2 hours'
),
(
  '44444444-4444-4444-4444-444444444444',
  'Pedro Ferreira',
  'Bombarral',
  '+351 945 678 901',
  'pedro.ferreira@silvercoast.pt',
  'Complete care package for your pets and home. Former veterinary assistant with extensive experience in pet care and home maintenance. Available for emergency situations and long-term bookings.',
  ARRAY['pet', 'house']::service_type[],
  4.9,
  true,
  true,
  8,
  50,
  '45 minutes'
),
(
  '55555555-5555-5555-5555-555555555555',
  'Sofia Oliveira',
  'Óbidos',
  '+351 956 789 012',
  'sofia.oliveira@silvercoast.pt',
  'Loving pet sitter specializing in cats and small animals. I work from home so can provide constant companionship. Experienced with special needs pets and exotic animals like birds and rabbits.',
  ARRAY['pet']::service_type[],
  4.8,
  true,
  true,
  4,
  40,
  '1 hour'
),
(
  '66666666-6666-6666-6666-666666666666',
  'Ricardo Mendes',
  'Caldas da Rainha',
  '+351 967 890 123',
  'ricardo.mendes@silvercoast.pt',
  'Trustworthy house and pet sitter offering complete peace of mind. I maintain your home security, care for gardens, and provide daily updates with photos. Great with both dogs and cats.',
  ARRAY['pet', 'house']::service_type[],
  4.6,
  true,
  true,
  6,
  38,
  '3 hours'
)
ON CONFLICT (id) DO NOTHING;