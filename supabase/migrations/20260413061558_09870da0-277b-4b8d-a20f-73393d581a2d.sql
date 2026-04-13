
-- Fix 1: Restrict profiles SELECT to own profile only (was public)
DROP POLICY "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Tighten user_roles - drop the overly broad permissive ALL policy, replace with admin-only scoped policies
DROP POLICY "Only admins can manage roles" ON public.user_roles;

-- Keep existing restrictive policies, add a proper permissive SELECT for admins
CREATE POLICY "Admins can select all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Permissive INSERT for admins
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Permissive UPDATE for admins
CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Permissive DELETE for admins
CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
