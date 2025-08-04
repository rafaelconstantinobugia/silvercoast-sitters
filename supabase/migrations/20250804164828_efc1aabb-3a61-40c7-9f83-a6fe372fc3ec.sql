-- Add admin delete policy for sitters
CREATE POLICY "Admins can delete sitters" 
ON public.sitters 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Also ensure admins can update sitters (if not already exists)
DROP POLICY IF EXISTS "Admins can update sitters" ON public.sitters;
CREATE POLICY "Admins can update sitters" 
ON public.sitters 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);