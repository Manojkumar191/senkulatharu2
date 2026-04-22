# Senkulatharu UI Design Spec

## 1. Scope
This document describes the current, implemented frontend UI system and page-by-page structure in the Vite + React application.

Primary implementation sources:
- src/App.tsx
- src/index.css
- tailwind.config.js
- src/components/Header.tsx
- src/components/Footer.tsx
- src/components/ProductCard.tsx
- src/pages/Home.tsx
- src/pages/Products.tsx
- src/pages/About.tsx
- src/pages/Blog.tsx
- src/pages/Contact.tsx
- src/pages/Admin.tsx

## 2. Global Design System

### 2.1 Typography
- Headline font: Bree Serif
- Body font: Nunito Sans
- Font setup:
  - Loaded via Google Fonts import in index.css
  - Mapped in Tailwind as `font-headline` and `font-body`

### 2.2 Color Tokens (Tailwind)
- brown: #5f3b24
- sand: #d8be8a
- forest: #1f4f35
- clay: #a45a3f
- cream: #f6efde
- moss: #6a8249
- sun: #e8b34a

### 2.3 Background and Atmosphere
- Root defaults:
  - text color: brown (#5f3b24)
  - base background: cream (#f6efde)
- Global page backdrop (body): layered warm-earth gradients
  - radial sun glow (sun tone)
  - radial forest glow (forest tone)
  - diagonal cream to sand blend
- App overlay pattern:
  - subtle fixed horizontal line texture via `.bg-app::before`

### 2.4 Surface Language
- Primary card treatment:
  - rounded corners (`rounded-2xl`/`rounded-3xl`)
  - soft white translucent backgrounds (`bg-white/70`, `bg-white/80`, `bg-white/85`)
  - light borders (`border-white/50`, `border-white/60`)
  - consistent soft shadow (`shadow-glass`)
- Strong section blocks:
  - gradient hero banners using forest, moss, clay, brown, sand, cream

### 2.5 Motion System
- Defined keyframes:
  - `floatIn` (rise + fade in)
  - `slideLeft` (continuous marquee translate)
- Applied motion patterns:
  - hero intro animation (`animate-floatIn`)
  - continuous product marquee (`animate-slideLeft`)
  - hover scale/lift on buttons and image cards
- Accessibility:
  - `prefers-reduced-motion: reduce` disables animation/transitions globally

## 3. App Shell and Navigation

### 3.1 Routing Architecture
- Single-page state router in `App.tsx` using `activePage` state and `renderPage(...)` switch.
- Shared shell order:
  1. Header
  2. Page content (`main` container)
  3. Footer

### 3.2 Header
- Sticky top navigation with blur and translucent cream background.
- Left:
  - Brand title: Senkulatharu
  - Tamil subtitle/tagline
- Center (desktop): pill navigation buttons (Home, About, Products, Blog, Contact)
- Right actions:
  - WhatsApp CTA (moss green)
  - Call CTA (sun yellow)
  - Quick Login button (outlined forest)
- Mobile:
  - horizontal scrollable nav pills below top row

### 3.3 Footer
- Full-width forest background, cream text.
- 3-column content:
  - About summary
  - Quick links
  - Contact details
- Bottom copyright bar with thin top border.

## 4. Page-by-Page UI Structure and Colors

## 4.1 Home
Section order:
1. Hero banner
2. Farm Carousel (image slider)
3. Stats cards
4. Moving Produce Gallery (marquee)
5. Category highlight cards
6. Customer feedback cards

Visual notes:
- Hero: forest to moss gradient, white text, sun/cream blurred background circles.
- Primary CTA: sun button with brown text.
- Secondary CTA: outlined white button.
- Carousel frame: glass-style white translucent container.
- Stats: white translucent cards; labels in clay, values in forest.
- Marquee: white translucent track; touch/hover interaction supports pause/direction.
- Category cards: cream to sand gradient cards with forest heading.
- Feedback: white translucent container with soft forest-tinted quote cards.

## 4.2 Products
Section order:
1. Page hero/title block
2. Search and filters card
3. Async states (loading, error, empty/no match)
4. Product grid

Visual notes:
- Hero: forest to moss gradient with cream text.
- Search panel: white translucent card, sand borders on input.
- Category pills:
  - active: forest background + white text
  - inactive: forest-tinted background + forest text
- State messages:
  - loading/empty/no-match on white translucent blocks
  - errors on clay-tinted block

Product card styling (`ProductCard.tsx`):
- Card: white translucent with blur, rounded corners.
- Media area: cream fallback background, zoom-on-hover image.
- Meta chips:
  - category: forest tint
  - stock: clay tint
- Price: forest, bold.
- Order CTA: moss green pill button.

## 4.3 About
Section order:
1. Intro banner
2. Two-column explanation cards
3. Natural practices and mission list

Visual notes:
- Intro banner: clay to brown gradient with cream text.
- Content cards: white translucent surfaces, forest headings, brown body text.
- Practices list uses simple bullet format for readability.

## 4.4 Blog
Section order:
1. Intro banner
2. Story cards grid
3. Newsletter form card

Visual notes:
- Intro banner: moss to forest gradient.
- Story cards: white translucent cards with clay date labels, forest titles, brown copy.
- Newsletter card: white translucent block with sand-bordered email input and forest subscribe button.

## 4.5 Contact
Section order:
1. Intro banner
2. Four contact summary cards
3. Two-column communication section:
   - left: contact form
   - right: map embed + FAQ card

Visual notes:
- Intro banner: sand to cream gradient with brown text.
- Contact summary cards: white translucent surfaces with clay micro-labels and forest values.
- Form inputs: white fields with sand borders.
- Action buttons:
  - Send Message: forest
  - WhatsApp: moss
- Map: rounded embedded iframe with soft border/shadow.
- FAQ card: white translucent surface, brown body copy.

## 4.6 Admin
State split:
1. Unauthenticated login view
2. Authenticated admin panel

Unauthenticated visual notes:
- Centered compact white translucent login card.
- Forest heading, brown helper text, clay error text.
- Forest full-width login button.

Authenticated section order:
1. Admin hero/banner with logout
2. Section switch chips (Add, Edit, Categories, Carousel)
3. Notice banner
4. Active management panel content

Authenticated visual notes:
- Top banner: forest to moss gradient, white text.
- Active tab chip: forest + white text.
- Inactive tab chips: white translucent + forest text.
- Management panels: white translucent cards with sand borders.
- Action colors:
  - primary/save/add: forest
  - destructive/delete/reset/remove: clay

## 5. Responsive Behavior
- Shared content container max width: 7xl.
- Core breakpoints:
  - `md`: desktop nav appears, many grids switch to 2/3 columns.
  - `xl`: contact info row uses 4 cards; products scale to 3 columns.
- Mobile strategy:
  - stacked cards/forms
  - scrollable mobile nav pills
  - touch-aware marquee direction on Home page

## 6. UX Interaction Notes
- Product search prefill is passed via session storage when navigating from Home marquee interactions to Products.
- WhatsApp ordering/contact is a first-class CTA pattern across Header, Product cards, and Contact page.
- Admin operations expose clear notices for success/failure and keep destructive actions explicit.

## 7. Summary
The implemented design language is warm-earth, agriculture-focused, and glass-surface based. It combines:
- earthy gradients for section hierarchy,
- translucent card surfaces for readability,
- strong green/brown token consistency,
- lightweight motion for liveliness without visual overload.
