-- Add policy to allow public (non-authenticated) users to create applications
CREATE POLICY "Public users can create applications" 
ON public.applicants 
FOR INSERT 
WITH CHECK (user_id IS NULL);