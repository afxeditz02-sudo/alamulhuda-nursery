# Fix slow image/content loading on first visit

## What the user sees
On first open, banners, slider images, logo, programme media, and footer logos all pop in slowly one by one. The page feels empty, then jumps as each image loads.

## Root causes
1. **Every image uses default lazy/eager behavior with no width hints.** Browser downloads full-resolution originals (often 2–5 MB phone photos uploaded by admin).
2. **No image transforms** — Supabase Storage can resize/compress on the fly via the `render/image` endpoint, but the app uses raw `/object/public/...` URLs.
3. **Above-the-fold images use `loading="lazy"`** (logo, first banner, live thumbnail) which delays them until layout settles.
4. **No width/height attributes** → layout shift while images arrive.
5. **No skeleton placeholders** → user sees blank space and thinks nothing is loading.
6. **Footer marquee duplicates logos** (`[...logos, ...logos]`) doubling the image requests.

## Changes

### 1. Image helper (`src/lib/image.ts` — new)
Small utility that rewrites Supabase Storage URLs to the transform endpoint with width + quality:
```
/storage/v1/object/public/site-images/x.jpg
  → /storage/v1/render/image/public/site-images/x.jpg?width=800&quality=70
```
Falls back to original URL for non-Supabase images (YouTube thumbs, etc.). Exposes `imgUrl(url, width)`.

### 2. Update image consumers to use `imgUrl()` + proper attrs
Files: `Header.tsx`, `BannerSlider.tsx`, `AdmissionSlider.tsx`, `LiveStreamBanner.tsx`, `ProgrammesSection.tsx`, `Footer.tsx`.

For each `<img>`:
- Use `imgUrl(src, targetWidth)` based on render size (logo 120, banner 1200, slider 1000, programme card 600, footer logo 80).
- Add `width` / `height` (or `aspect-ratio` class) to reserve space.
- `loading="eager"` + `fetchPriority="high"` for above-the-fold (header logo, first banner, live thumbnail).
- `loading="lazy"` + `decoding="async"` for everything below the fold.

### 3. Skeletons while data is loading
Show `Skeleton` blocks (already in `ui/skeleton.tsx`) in `BannerSlider`, `AdmissionSlider`, `LiveStreamBanner`, `FeaturesSection`, `ProgrammesSection` so the page renders structure immediately instead of empty space.

### 4. Footer marquee fix
Keep the duplicated array for the visual loop, but add `loading="lazy"` and small `width=80` transform so it costs almost nothing.

### 5. Prefetch hint
Add `<link rel="preconnect" href="https://bppddfcpsddvevfsvxpz.supabase.co">` to `index.html` so the storage connection is warm before the first image request.

## Expected result
- Hero/banner appears in well under a second on a phone instead of several seconds.
- Total image bytes drop ~5–10× because admin's 3 MB photos render as ~150 KB resized JPEGs.
- No more blank page during initial load — skeletons appear instantly.
- No layout shift as images arrive.

## Out of scope
No DB or admin-panel changes. Existing uploaded files keep working as-is; the transform endpoint reads the same originals.
