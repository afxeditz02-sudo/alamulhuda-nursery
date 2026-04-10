

## Alamul Huda School Website - Implementation Plan

### Overview
A public-facing school website with a separate admin panel for content management. Blue & white color theme. Google Sign-in for admin authentication.

### Backend Setup (Supabase / Lovable Cloud)
- **Google OAuth** for admin login
- **Database tables**: 
  - `site_settings` — logo, school name, tagline, footer info
  - `features` — point-wise features list (editable)
  - `slider_images` — admission slider images with heading/text
  - `analysis_categories` — student count, teachers, vehicles, etc.
  - `analysis_data` — year-wise statistics (2025-26, 2026-27, etc.)
  - `programmes` — year-wise news/events with image, heading, description
  - `footer_logos` — auto-scrolling partner/managed-by logos
  - `user_roles` — admin role management (secure)
- **Storage buckets** for images (logo, slider, programme images, footer logos)
- **RLS policies** — public read, admin-only write

### Pages

#### 1. Home Page (`/`)
- **Header**: School name "ALAMUL HUDA ENGLISH MEDIUM NURSERY SCHOOL" + placeholder logo (editable)
- **Features Section**: Heading "ALAMUL HUDA", subheading "knowledge enlivens the soul", bullet-point features
- **Admission Slider**: Auto-sliding image carousel with "ADMISSION" heading, "to get more info and admission" text, "CLICK HERE" button
- **Analysis Section**: "ANALYSIS" heading, year selector dropdown (2025-26, 2026-27…), animated stat counters for students/teachers/vehicles/supporters
- **Programmes Section**: "PROGRAMMES" heading, year selector, news cards (image + heading + optional description + optional "See More"), responsive grid with borders
- **Footer**: All credits centered — copyright, "managed by" with auto-scrolling logos, estd, registration, phone, ASMI, committee info

#### 2. Admin Panel (`/admin`)
- Protected by Google sign-in + admin role check
- **Dashboard** with sections to manage:
  - Site settings (name, logo, tagline)
  - Features list (add/edit/delete/reorder)
  - Slider images (upload/delete/reorder, edit text)
  - Analysis data (add/edit stats per year)
  - Programmes/News (CRUD per year, image upload)
  - Footer settings (logos, text fields)

#### 3. Auth Page (`/auth`)
- Google Sign-in button for admin access

### Design
- **Blue & white** color scheme (primary blue #2563EB, clean white backgrounds)
- Responsive mobile-first design
- Smooth animations on scroll for stats counters
- Auto-sliding carousel with dots/arrows
- Auto-scrolling logo marquee in footer

