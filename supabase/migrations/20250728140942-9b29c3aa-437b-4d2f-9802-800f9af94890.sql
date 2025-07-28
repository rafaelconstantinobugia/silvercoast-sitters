-- Create enum types for the pet sitting marketplace
CREATE TYPE public.service_type AS ENUM ('pet_sitting', 'house_sitting', 'both');
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'completed', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE public.user_type AS ENUM ('owner', 'sitter', 'both');

-- Create users table for additional profile information
CREATE TABLE public.users (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  photo_url TEXT,
  user_type user_type NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create sitters table for service providers
CREATE TABLE public.sitters (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  description TEXT,
  services_offered service_type[],
  experience_years INTEGER,
  average_rating DECIMAL DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id)
);

-- Create services table for available services and pricing
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  service_type service_type NOT NULL,
  base_price DECIMAL NOT NULL,
  duration_hours INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create bookings table for service requests
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sitter_id UUID NOT NULL REFERENCES public.sitters(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_price DECIMAL NOT NULL,
  status booking_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_intent_id TEXT,
  pet_details JSONB,
  house_details JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create reviews table for feedback
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (booking_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for sitters
CREATE POLICY "Anyone can view verified sitters" ON public.sitters FOR SELECT USING (verified = true OR auth.uid() = user_id);
CREATE POLICY "Sitters can update their own profile" ON public.sitters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Sitters can insert their own profile" ON public.sitters FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for services
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (active = true);

-- Create RLS policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (
  auth.uid() = owner_id OR 
  auth.uid() = (SELECT user_id FROM public.sitters WHERE id = sitter_id)
);
CREATE POLICY "Owners can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (
  auth.uid() = owner_id OR 
  auth.uid() = (SELECT user_id FROM public.sitters WHERE id = sitter_id)
);
CREATE POLICY "Anyone can view recent bookings function" ON public.bookings FOR SELECT USING (status = 'completed');

-- Create RLS policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Booking owner can create review" ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = (SELECT owner_id FROM public.bookings WHERE id = booking_id)
);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, user_type)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        'owner'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sitters_updated_at BEFORE UPDATE ON public.sitters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate booking price
CREATE OR REPLACE FUNCTION public.calculate_booking_price(
  service_id UUID,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS DECIMAL AS $$
DECLARE
    base_price DECIMAL;
    duration_hours INTEGER;
    total_hours INTEGER;
BEGIN
    SELECT s.base_price, s.duration_hours 
    INTO base_price, duration_hours
    FROM public.services s 
    WHERE s.id = service_id;
    
    total_hours := EXTRACT(EPOCH FROM (end_date - start_date)) / 3600;
    
    RETURN base_price * (total_hours::DECIMAL / duration_hours::DECIMAL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create function to update sitter rating
CREATE OR REPLACE FUNCTION public.update_sitter_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.sitters 
    SET average_rating = (
        SELECT ROUND(AVG(r.rating), 1)
        FROM public.reviews r
        JOIN public.bookings b ON r.booking_id = b.id
        WHERE b.sitter_id = (
            SELECT sitter_id FROM public.bookings WHERE id = NEW.booking_id
        )
    )
    WHERE id = (
        SELECT sitter_id FROM public.bookings WHERE id = NEW.booking_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger to update sitter rating when review is added
CREATE TRIGGER update_sitter_rating_trigger
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_sitter_rating();

-- Create function to get recent bookings for homepage
CREATE OR REPLACE FUNCTION public.get_recent_bookings()
RETURNS TABLE(
  id UUID,
  service_name TEXT,
  service_type service_type,
  sitter_name TEXT,
  total_price DECIMAL,
  average_rating DECIMAL,
  verified BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    s.name as service_name,
    s.service_type,
    LEFT(u.name, 1) || '***' as sitter_name, -- Anonymize sitter name
    b.total_price,
    st.average_rating,
    st.verified,
    b.created_at
  FROM public.bookings b
  JOIN public.services s ON b.service_id = s.id
  JOIN public.sitters st ON b.sitter_id = st.id
  JOIN public.users u ON st.user_id = u.id
  WHERE b.status = 'completed' 
    AND st.verified = true
  ORDER BY b.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Insert sample services
INSERT INTO public.services (name, description, service_type, base_price, duration_hours) VALUES
('Pet Sitting - Daily Visit', 'Daily visit to feed and care for your pets', 'pet_sitting', 25.00, 1),
('Pet Sitting - Overnight', 'Overnight pet sitting in your home', 'pet_sitting', 45.00, 12),
('House Sitting - Daily Check', 'Daily house check and basic maintenance', 'house_sitting', 30.00, 1),
('House Sitting - Extended Stay', 'Full house sitting with overnight stays', 'house_sitting', 60.00, 24),
('Complete Care Package', 'Combined pet and house sitting services', 'both', 75.00, 24);