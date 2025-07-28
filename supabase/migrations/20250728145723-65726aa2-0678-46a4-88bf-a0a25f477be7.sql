-- Insert sample sitters data that works with existing schema
-- We'll use existing user approach or create without foreign key constraints

-- First, add sample services that sitters can offer
INSERT INTO public.services (id, name, description, service_type, base_price, duration_hours, active) VALUES 
('service-001', 'Pet & House Sitting', 'Complete pet and house sitting service', 'both', 35.00, 24, true),
('service-002', 'Professional Pet Sitting', 'Expert pet care with veterinary background', 'pet_sitting', 45.00, 24, true),
('service-003', 'House Sitting Service', 'Reliable home security and maintenance', 'house_sitting', 30.00, 24, true),
('service-004', 'Premium Pet & House Care', 'Top-tier complete care service', 'both', 50.00, 24, true),
('service-005', 'Specialized Pet Care', 'Expert care for cats and small animals', 'pet_sitting', 40.00, 24, true),
('service-006', 'Complete Home Care', 'House and pet sitting with garden care', 'both', 38.00, 24, true)
ON CONFLICT (id) DO NOTHING;

-- Create a function to get a valid user_id or create sample ones for sitters
-- For now, we'll create sitters without linking to auth.users 
-- This approach allows us to test the platform with sample data

-- Insert sample sitters directly (they can be managed by admin)
-- We'll use placeholder user_ids that will be handled in the app logic
INSERT INTO public.sitters (id, user_id, description, services_offered, average_rating, verified, available, experience_years) VALUES 
(
  'sitter-maria-001',
  'user-maria-001',
  'Experienced pet sitter with over 5 years caring for dogs and cats. I love spending time with animals and ensuring they feel safe and loved while their owners are away. I have experience with senior pets and can administer medication if needed.',
  ARRAY['pet_sitting', 'house_sitting'],
  4.9,
  true,
  true,
  5
),
(
  'sitter-joao-002',
  'user-joao-002',
  'Professional dog walker and pet sitter specializing in large breeds and senior pets. Available for overnight sitting, daily walks, and emergency care. Former veterinary assistant with excellent references.',
  ARRAY['pet_sitting'],
  4.8,
  true,
  true,
  7
),
(
  'sitter-ana-003',
  'user-ana-003',
  'Reliable house sitter with experience in home maintenance and security. I take care of your home as if it were my own, ensuring everything is safe and secure. Can also care for plants and collect mail.',
  ARRAY['house_sitting'],
  4.7,
  true,
  true,
  3
),
(
  'sitter-pedro-004',
  'user-pedro-004',
  'Complete care package for your pets and home. Former veterinary assistant with extensive experience in pet care and home maintenance. Available for emergency situations and long-term bookings.',
  ARRAY['pet_sitting', 'house_sitting'],
  4.9,
  true,
  true,
  8
),
(
  'sitter-sofia-005',
  'user-sofia-005',
  'Loving pet sitter specializing in cats and small animals. I work from home so can provide constant companionship. Experienced with special needs pets and exotic animals like birds and rabbits.',
  ARRAY['pet_sitting'],
  4.8,
  true,
  true,
  4
),
(
  'sitter-ricardo-006',
  'user-ricardo-006',
  'Trustworthy house and pet sitter offering complete peace of mind. I maintain your home security, care for gardens, and provide daily updates with photos. Great with both dogs and cats.',
  ARRAY['pet_sitting', 'house_sitting'],
  4.6,
  true,
  true,
  6
)
ON CONFLICT (id) DO NOTHING;