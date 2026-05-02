## Admin Panel Redesign — Soft Card Grid Dashboard

Replace the current horizontal tabs UI with a clean, mobile-first dashboard of large rounded cards (one per section), matching the uploaded mockup.

### New layout

**Header** (kept, slightly refined to match mockup):
- Solid blue (`bg-primary`) bar with rounded bottom corners
- Left: user-cog icon + "Admin Panel" title in bold rounded font (Poppins)
- Right: "View Site" arrow icon (↗) · thin divider · "Sign Out" door icon
- Both header buttons become icon-only on mobile, icon + label on `sm:` and up
- Sign Out keeps the existing confirmation dialog

**Dashboard grid** (replaces the `TabsList`):
- Light blue-tinted background (`bg-slate-50` / `bg-blue-50/40`)
- 3-column grid on mobile (`grid-cols-3`), with comfortable gap
- Each card:
  - White background, large rounded corners (`rounded-3xl`)
  - Soft neumorphic shadow (`shadow-[0_4px_20px_-6px_rgba(37,99,235,0.15)]`)
  - Square aspect, centered blue Lucide icon (size ~40), bold blue label below
  - Hover/tap: subtle lift + shadow increase
- Cards (in order):
  1. Settings — `Settings` icon
  2. Users — `ShieldUser` icon
  3. Features — `ListChecks` icon
  4. Admission & Calculation — `School` icon (opens combined Slider + Analysis section)
  5. News — `Newspaper` icon (Programmes)
  6. Banner — `GalleryHorizontalEnd` icon
  7. Live — `Radio` icon
  8. Tabs — `AppWindow` icon (Tabs/Pages)
  9. Footer — `PanelBottom` icon

### Navigation behavior

- Clicking a card opens that section's editor as a **full-screen view** (replaces the grid):
  - Top of section: back chevron + section title (sticky, blue text)
  - Below: the existing tab component (`SiteSettingsTab`, `FeaturesTab`, `BannersTab`, etc.) rendered as-is — no changes to their internal logic
- Back button returns to the dashboard grid
- State managed locally with `useState<string | null>(activeSection)`
- "Admission & Calculation" card renders both `SliderTab` and `AnalysisTab` stacked in one view (since the mockup combines them)

### Files to change

- **`src/pages/Admin.tsx`** — replace the `<Tabs>` block (lines ~129–155) with:
  - `activeSection` state
  - When `null`: render the card grid
  - When set: render back button + the corresponding section component(s)
  - Refine header buttons to icon-forward style with divider
- No changes to any `*Tab` component internals, hooks, or DB logic
- No changes to routing — still single `/admin` route

### Visual details

```text
┌─────────────────────────────────────┐
│ 👤⚙ Admin Panel        ↗ │ 🚪      │  ← blue header
└─────────────────────────────────────┘
   ┌────┐  ┌────┐  ┌────┐
   │ ⚙  │  │ 🛡 │  │ ☆☰ │
   │Set.│  │User│  │Feat│
   └────┘  └────┘  └────┘
   ┌────┐  ┌────┐  ┌────┐
   │ 🏫 │  │ 📰 │  │ 🖼 │
   │Adm.│  │News│  │Ban.│
   └────┘  └────┘  └────┘
   ┌────┐  ┌────┐  ┌────┐
   │📡  │  │ ▭  │  │ ▤  │
   │Live│  │Tabs│  │Foot│
   └────┘  └────┘  └────┘
```

- Card label: `text-primary font-bold text-sm sm:text-base`
- Icon: `text-primary` filled style where available (Lucide outline is fine — matches mockup feel)
- Background: `bg-gradient-to-b from-blue-50/60 to-white`

### Acceptance

- Admin landing shows the 3-column card grid identical in feel to the mockup
- All existing admin functionality remains accessible via the cards
- Sign-out confirmation still works
- Looks clean on the current 393px mobile viewport and scales up on desktop (cards grow, grid stays 3 columns up to `md`, then `4` on `lg`)
