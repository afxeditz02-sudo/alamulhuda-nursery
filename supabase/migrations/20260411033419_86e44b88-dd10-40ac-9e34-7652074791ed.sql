-- Drop the existing ALL policy that lacks WITH CHECK
DROP POLICY "Only admins can manage roles" ON public.user_roles;

-- Recreate with explicit WITH CHECK to block non-admin INSERTs
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));