-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Site settings (single row)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL DEFAULT 'ALAMUL HUDA ENGLISH MEDIUM NURSERY SCHOOL',
  logo_url TEXT,
  tagline TEXT DEFAULT 'knowledge enlivens the soul',
  features_heading TEXT DEFAULT 'ALAMUL HUDA',
  admission_heading TEXT DEFAULT 'ADMISSION',
  admission_text TEXT DEFAULT 'to get more info and admission',
  admission_button_text TEXT DEFAULT 'CLICK HERE',
  analysis_heading TEXT DEFAULT 'ANALYSIS',
  programmes_heading TEXT DEFAULT 'PROGRAMMES',
  footer_copyright TEXT DEFAULT '© ALAMUL HUDA ENGLISH MEDIUM NURSERY SCHOOL, Vettupara',
  footer_managed_by TEXT DEFAULT 'managed by',
  footer_estd TEXT DEFAULT 'estd :2006',
  footer_reg TEXT DEFAULT 'Reg:2010APS137 and ph:8606791846',
  footer_under TEXT DEFAULT 'in under: Association of samastha minority institution(ASMI)',
  footer_run_by TEXT DEFAULT 'run by : ALAMUL HUDA MADRASA COMMITTEE, VETTUPARA',
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update site_settings" ON public.site_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert site_settings" ON public.site_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Features list
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read features" ON public.features FOR SELECT USING (true);
CREATE POLICY "Admins can manage features" ON public.features FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Slider images
CREATE TABLE public.slider_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  heading TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.slider_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read slider_images" ON public.slider_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage slider_images" ON public.slider_images FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Analysis data (year-wise)
CREATE TABLE public.analysis_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  category TEXT NOT NULL,
  value INT NOT NULL DEFAULT 0,
  icon TEXT,
  sort_order INT DEFAULT 0
);
ALTER TABLE public.analysis_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read analysis_data" ON public.analysis_data FOR SELECT USING (true);
CREATE POLICY "Admins can manage analysis_data" ON public.analysis_data FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Programmes / News
CREATE TABLE public.programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  see_more_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read programmes" ON public.programmes FOR SELECT USING (true);
CREATE POLICY "Admins can manage programmes" ON public.programmes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Footer logos (auto-scrolling)
CREATE TABLE public.footer_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0
);
ALTER TABLE public.footer_logos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read footer_logos" ON public.footer_logos FOR SELECT USING (true);
CREATE POLICY "Admins can manage footer_logos" ON public.footer_logos FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images', 'site-images', true);

CREATE POLICY "Anyone can view site images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
CREATE POLICY "Admins can upload site images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update site images" ON storage.objects FOR UPDATE USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete site images" ON storage.objects FOR DELETE USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

-- Insert default site settings row
INSERT INTO public.site_settings (school_name) VALUES ('ALAMUL HUDA ENGLISH MEDIUM NURSERY SCHOOL');

-- Insert sample features
INSERT INTO public.features (title, sort_order) VALUES
  ('Experienced and qualified teaching staff', 1),
  ('Modern classroom facilities', 2),
  ('Safe and nurturing environment', 3),
  ('Activity-based learning approach', 4),
  ('Transportation facility available', 5);

-- Insert sample analysis data
INSERT INTO public.analysis_data (year, category, value, icon, sort_order) VALUES
  ('2025-26', 'Students', 250, 'users', 1),
  ('2025-26', 'Teachers', 15, 'graduation-cap', 2),
  ('2025-26', 'Vehicles', 3, 'bus', 3),
  ('2025-26', 'Supporters', 50, 'heart-handshake', 4);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();