
-- Fix 1: Restrict "Users can view own roles" to authenticated only
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix 2: Restrict public programme reads to published only
DROP POLICY IF EXISTS "Anyone can read programmes" ON public.programmes;
CREATE POLICY "Public can read published programmes"
  ON public.programmes
  FOR SELECT
  TO public
  USING (is_published = true);

-- Admins can already read all via "Admins can manage programmes" ALL policy
