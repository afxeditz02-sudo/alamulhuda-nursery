-- Allow users to delete their own profile on sign-out
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);
