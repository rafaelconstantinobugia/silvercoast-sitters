-- Create a junction table for sitter services with custom pricing
CREATE TABLE public.sitter_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id UUID NOT NULL REFERENCES public.sitters(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2) NOT NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(sitter_id, service_id)
);

-- Enable RLS
ALTER TABLE public.sitter_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view sitter services" 
ON public.sitter_services 
FOR SELECT 
USING (true);

CREATE POLICY "Sitters can insert their own services" 
ON public.sitter_services 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sitters 
    WHERE id = sitter_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Sitters can update their own services" 
ON public.sitter_services 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.sitters 
    WHERE id = sitter_id AND user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_sitter_services_updated_at
BEFORE UPDATE ON public.sitter_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();