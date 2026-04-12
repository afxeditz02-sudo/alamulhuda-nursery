
CREATE TABLE public.nav_menu_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.nav_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read nav_menu_items"
ON public.nav_menu_items FOR SELECT
USING (true);

CREATE POLICY "Admins can manage nav_menu_items"
ON public.nav_menu_items FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
