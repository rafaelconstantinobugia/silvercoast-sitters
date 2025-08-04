-- Drop existing policies
DROP POLICY IF EXISTS "Sitters can insert their own services" ON public.sitter_services;
DROP POLICY IF EXISTS "Sitters can update their own services" ON public.sitter_services;

-- Create admin-friendly policies
CREATE POLICY "Admins can manage all sitter services" 
ON public.sitter_services 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

CREATE POLICY "Sitters can manage their own services" 
ON public.sitter_services 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.sitters 
    WHERE id = sitter_id AND user_id = auth.uid()
  )
);