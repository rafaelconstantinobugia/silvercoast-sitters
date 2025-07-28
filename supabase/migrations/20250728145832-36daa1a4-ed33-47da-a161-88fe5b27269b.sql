-- Insert sample services with proper UUIDs
INSERT INTO public.services (id, name, description, service_type, base_price, duration_hours, active) VALUES 
('00000000-0000-0000-0000-000000000001', 'Pet & House Sitting', 'Complete pet and house sitting service', 'both', 35.00, 24, true),
('00000000-0000-0000-0000-000000000002', 'Professional Pet Sitting', 'Expert pet care with veterinary background', 'pet_sitting', 45.00, 24, true),
('00000000-0000-0000-0000-000000000003', 'House Sitting Service', 'Reliable home security and maintenance', 'house_sitting', 30.00, 24, true),
('00000000-0000-0000-0000-000000000004', 'Premium Pet & House Care', 'Top-tier complete care service', 'both', 50.00, 24, true),
('00000000-0000-0000-0000-000000000005', 'Specialized Pet Care', 'Expert care for cats and small animals', 'pet_sitting', 40.00, 24, true),
('00000000-0000-0000-0000-000000000006', 'Complete Home Care', 'House and pet sitting with garden care', 'both', 38.00, 24, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample sitters with proper UUIDs (using placeholder user_ids for now)
INSERT INTO public.sitters (id, user_id, description, services_offered, average_rating, verified, available, experience_years) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Experienced pet sitter with over 5 years caring for dogs and cats. I love spending time with animals and ensuring they feel safe and loved while their owners are away. I have experience with senior pets and can administer medication if needed.',
  ARRAY['pet_sitting', 'house_sitting'],
  4.9,
  true,
  true,
  5
),
(
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'Professional dog walker and pet sitter specializing in large breeds and senior pets. Available for overnight sitting, daily walks, and emergency care. Former veterinary assistant with excellent references.',
  ARRAY['pet_sitting'],
  4.8,
  true,
  true,
  7
),
(
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  'Reliable house sitter with experience in home maintenance and security. I take care of your home as if it were my own, ensuring everything is safe and secure. Can also care for plants and collect mail.',
  ARRAY['house_sitting'],
  4.7,
  true,
  true,
  3
),
(
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  'Complete care package for your pets and home. Former veterinary assistant with extensive experience in pet care and home maintenance. Available for emergency situations and long-term bookings.',
  ARRAY['pet_sitting', 'house_sitting'],
  4.9,
  true,
  true,
  8
),
(
  '55555555-5555-5555-5555-555555555555',
  '55555555-5555-5555-5555-555555555555',
  'Loving pet sitter specializing in cats and small animals. I work from home so can provide constant companionship. Experienced with special needs pets and exotic animals like birds and rabbits.',
  ARRAY['pet_sitting'],
  4.8,
  true,
  true,
  4
),
(
  '66666666-6666-6666-6666-666666666666',
  '66666666-6666-6666-6666-666666666666',
  'Trustworthy house and pet sitter offering complete peace of mind. I maintain your home security, care for gardens, and provide daily updates with photos. Great with both dogs and cats.',
  ARRAY['pet_sitting', 'house_sitting'],
  4.6,
  true,
  true,
  6
)
ON CONFLICT (id) DO NOTHING;