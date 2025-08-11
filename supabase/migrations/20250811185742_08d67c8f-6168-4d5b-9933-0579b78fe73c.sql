-- Create storage bucket for sitter photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sitter-photos', 
  'sitter-photos', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create RLS policies for sitter photos
CREATE POLICY "Anyone can view sitter photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'sitter-photos');

CREATE POLICY "Authenticated users can upload sitter photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'sitter-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own sitter photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'sitter-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can manage all sitter photos" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'sitter-photos' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);