
-- Add is_removed column to profiles
ALTER TABLE public.profiles ADD COLUMN is_removed boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN removed_at timestamp with time zone;

-- Allow admins to update any profile (for removing users)
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
