-- Create applicants table for sitter applications
CREATE TABLE public.applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  experience_years TEXT,
  description TEXT,
  services_offered TEXT[],
  price_per_day NUMERIC,
  emergency_contact TEXT,
  has_insurance BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on applicants table
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own applications
CREATE POLICY "Users can create applications" ON public.applicants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own applications
CREATE POLICY "Users can view own applications" ON public.applicants
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to view all applications
CREATE POLICY "Admins can view all applications" ON public.applicants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'admin'
    )
  );

-- Allow admins to update applications
CREATE POLICY "Admins can update applications" ON public.applicants
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_applicants_updated_at
  BEFORE UPDATE ON public.applicants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Set your email as admin
INSERT INTO public.users (id, name, email, user_type) 
VALUES (
  'admin-user-001',
  'Admin User',
  'r3al4f@gmail.com',
  'admin'
) ON CONFLICT (email) DO UPDATE SET user_type = 'admin';