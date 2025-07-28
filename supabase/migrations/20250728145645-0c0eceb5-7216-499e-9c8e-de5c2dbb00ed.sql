-- Insert sample verified sitters for testing
-- First, let's add some sample users for the sitters
INSERT INTO public.users (id, name, email, location, phone, user_type) VALUES 
('11111111-1111-1111-1111-111111111111', 'Maria Santos', 'maria.santos@silvercoast.pt', 'Óbidos', '+351 912 345 678', 'sitter'),
('22222222-2222-2222-2222-222222222222', 'João Silva', 'joao.silva@silvercoast.pt', 'Caldas da Rainha', '+351 923 456 789', 'sitter'),
('33333333-3333-3333-3333-333333333333', 'Ana Costa', 'ana.costa@silvercoast.pt', 'Peniche', '+351 934 567 890', 'sitter'),
('44444444-4444-4444-4444-444444444444', 'Pedro Ferreira', 'pedro.ferreira@silvercoast.pt', 'Bombarral', '+351 945 678 901', 'sitter'),
('55555555-5555-5555-5555-555555555555', 'Sofia Oliveira', 'sofia.oliveira@silvercoast.pt', 'Óbidos', '+351 956 789 012', 'sitter'),
('66666666-6666-6666-6666-666666666666', 'Ricardo Mendes', 'ricardo.mendes@silvercoast.pt', 'Caldas da Rainha', '+351 967 890 123', 'sitter')
ON CONFLICT (id) DO NOTHING;

-- Insert sample sitters with realistic data
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
  'Trustworthy house and pet sitter offering complete peace of mind. I maintain your home''s security, care for gardens, and provide daily updates with photos. Great with both dogs and cats.',
  ARRAY['pet_sitting', 'house_sitting'],
  4.6,
  true,
  true,
  6
)
ON CONFLICT (id) DO NOTHING;

-- Add sample services for the sitters (daily rates)
INSERT INTO public.services (id, name, description, service_type, base_price, duration_hours, active) VALUES 
('11111111-1111-1111-1111-111111111001', 'Pet & House Sitting - Maria', 'Complete pet and house sitting service in Óbidos area', 'both', 35.00, 24, true),
('22222222-2222-2222-2222-222222222001', 'Professional Pet Sitting - João', 'Expert pet care with veterinary background', 'pet_sitting', 45.00, 24, true),
('33333333-3333-3333-3333-333333333001', 'House Sitting Service - Ana', 'Reliable home security and maintenance', 'house_sitting', 30.00, 24, true),
('44444444-4444-4444-4444-444444444001', 'Premium Pet & House Care - Pedro', 'Top-tier complete care service', 'both', 50.00, 24, true),
('55555555-5555-5555-5555-555555555001', 'Specialized Pet Care - Sofia', 'Expert care for cats and small animals', 'pet_sitting', 40.00, 24, true),
('66666666-6666-6666-6666-666666666001', 'Complete Home Care - Ricardo', 'House and pet sitting with garden care', 'both', 38.00, 24, true)
ON CONFLICT (id) DO NOTHING;

-- Add some sample reviews to make the platform feel established
INSERT INTO public.reviews (id, booking_id, rating, comment) VALUES 
('r1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 5, 'Maria was absolutely wonderful with our two cats. She sent daily photos and our home was spotless when we returned. Highly recommend!'),
('r2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 5, 'João took excellent care of our senior dog Max. His veterinary experience really showed, and Max seemed very comfortable with him.'),
('r3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000003', 4, 'Ana kept our house secure and watered all the plants perfectly. Great communication throughout our trip.'),
('r4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000004', 5, 'Pedro provided exceptional service. Our pets were happy and relaxed, and he even did some minor garden maintenance. Will definitely book again!'),
('r5555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000005', 5, 'Sofia has a special way with cats. Our shy rescue cat Luna actually warmed up to her by day 2. Amazing!')
ON CONFLICT (id) DO NOTHING;

-- Create some sample completed bookings to support the reviews
INSERT INTO public.bookings (id, owner_id, sitter_id, service_id, start_date, end_date, total_price, status, payment_status, created_at) VALUES 
('00000000-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111001', '2024-11-01', '2024-11-05', 140.00, 'completed', 'paid', '2024-10-25 10:00:00+00'),
('00000000-0000-0000-0000-000000000002', '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222001', '2024-11-10', '2024-11-13', 135.00, 'completed', 'paid', '2024-11-02 14:30:00+00'),
('00000000-0000-0000-0000-000000000003', '99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333001', '2024-11-15', '2024-11-20', 150.00, 'completed', 'paid', '2024-11-08 09:15:00+00'),
('00000000-0000-0000-0000-000000000004', '77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444001', '2024-12-01', '2024-12-03', 100.00, 'completed', 'paid', '2024-11-20 16:45:00+00'),
('00000000-0000-0000-0000-000000000005', '88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555001', '2024-12-05', '2024-12-08', 120.00, 'completed', 'paid', '2024-11-28 11:20:00+00')
ON CONFLICT (id) DO NOTHING;

-- Add some sample customer users for the completed bookings
INSERT INTO public.users (id, name, email, location, user_type) VALUES 
('77777777-7777-7777-7777-777777777777', 'Carlos Silva', 'carlos@example.com', 'Óbidos', 'owner'),
('88888888-8888-8888-8888-888888888888', 'Elena Rodriguez', 'elena@example.com', 'Caldas da Rainha', 'owner'),
('99999999-9999-9999-9999-999999999999', 'Miguel Santos', 'miguel@example.com', 'Peniche', 'owner')
ON CONFLICT (id) DO NOTHING;