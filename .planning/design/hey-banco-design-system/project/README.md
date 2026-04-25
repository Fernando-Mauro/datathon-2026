# hey banco — Design System

> _"hey,"_ is a Mexican neobank / fintech app from Banco Banregio. Its product centers on a friendly, conversational tone (the comma in the wordmark is intentional — it's a greeting), a pitch-black UI, and **HAVI**, the in-app AI assistant whose rainbow ring is the brand's most distinctive visual element.

This design system contains tokens, typography, iconography, and a UI kit for recreating hey-branded mobile interfaces.

---

## Sources

This system was reverse-engineered from two reference screenshots provided by the user:

- `uploads/fa053852-36d0-447e-ad61-0f18326e4699.jpeg` — Home/dashboard screen ("hey, Fernando") showing product list, profile validation banner, and HAVI bottom nav.
- `uploads/82d9ef7f-d023-41ea-bd5f-23ec86e0e266.jpeg` — HAVI chat screen with system message and composer.

No codebase, Figma, or first-party design tokens were provided. **Colors, spacing, and type scale are sampled from the screenshots, then extrapolated into a coherent system.** See the CAVEATS section at the bottom for what this means in practice.

---

## Index

| File / Folder | What it contains |
|---|---|
| `colors_and_type.css` | All CSS variables — colors, fonts, type scale, spacing, radii, shadows, semantic element styles |
| `assets/` | Logos (`wordmark.svg`, `wordmark-black.svg`, `havi-ring.svg`) + `assets/icons/` — full Lucide-style icon set |
| `preview/` | 19 design-system cards rendered in the Design System tab (Brand · Colors · Type · Spacing · Components) |
| `ui_kits/mobile_app/` | React/JSX recreation of the hey mobile app — primitives + 5 screens, click-thru in `index.html` |
| `SKILL.md` | Agent skill manifest (cross-compatible with Claude Code) |
| `uploads/` | Original reference screenshots |

---

## Brand snapshot

- **Name:** hey, (also "hey banco")
- **Parent:** Banco Banregio (Mexico)
- **Category:** Digital bank / fintech mobile app
- **Market:** Mexico — primary copy is in Spanish (Mexican)
- **Personality:** Casual, direct, friendly-but-grown-up. The lowercase wordmark and comma are doing a lot of work — the brand literally greets you.
- **Signature element:** **HAVI** — the AI assistant, represented by a rainbow gradient ring around a black core. It sits dead-center in the bottom navigation.

---

## CONTENT FUNDAMENTALS

### Voice
The voice is **warm, peer-to-peer, and informal** — but never cutesy. It uses the Spanish informal _tú_ form throughout (`tu perfil`, `tus dudas`, `tus amigos`), never _usted_. The brand addresses you by first name on the home screen ("hey, Fernando") which sets the tone for the entire product: this is a friend, not a bank.

### Casing
- Wordmark and section starters tend to be **lowercase** (`hey,`)
- Section headers in the product use **sentence case** with no terminal punctuation (`Mis productos contratados`, `Productos disponibles para ti`)
- Buttons / inline links: sentence case (`Ocultar saldos`, `Limpiar conversación`)
- HAVI is one of the only things that's ALL CAPS — it functions as a proper noun and a logo

### First / second person
- Always **second-person tú** to the user (`tus dudas`, `accede a más productos`)
- The product / brand voice is mostly third-person about itself, but HAVI speaks in first-person plural when referring to the bank's offerings (`nuestros productos`)

### Punctuation & expressiveness
- **Spanish double punctuation** is used for warmth: `¡Pregúntale a HAVI!`, `¡Obtén MSI, recompensas y más!`
- One exclamation point per phrase, max. Never spammy.
- Em-dashes and ellipses are rare. Sentences are short.

### Tone examples (verbatim from product)
| Use case | Copy |
|---|---|
| Greeting | `hey, Fernando` |
| Section header | `Mis productos contratados` |
| Empty/zero state | `Suma total de las cuentas` · `$0.00` |
| Promotional CTA | `Valida tu perfil y accede a más productos` |
| HAVI greeting | `¡Pregúntale a HAVI! Resuelve al instante tus dudas sobre promociones, uso de la app, requisitos y beneficios de nuestros productos.` |
| Product subtitle | `¡Obtén MSI, recompensas y más!` |
| Loan range | `Solicita desde $1,000 hasta $400,000` |
| Composer placeholder | `Escribe tu pregunta aquí` |
| Destructive link | `Limpiar conversación` |

### Emoji
**No emoji** appear in the product UI. The brand expresses warmth through wordmark, color, and typography — not glyphs. Don't add emoji.

### Numbers & money
- Mexican peso format with `$` prefix and **comma thousands** separator: `$1,000`, `$400,000`, `$0.00`
- Always show two decimals for currency
- Counts (e.g. referrals) are bare integers

---

## VISUAL FOUNDATIONS

### Color
The palette is built around **near-black neutrals + saturated electric blue** for primary action, with a small set of vivid accent hues used inside circular icon chips. There is **no gradient** in the chrome — the only gradient is HAVI's rainbow ring.

- **Background** — deep black (`#000000`) with a slightly lifted surface (`#1A1A1A`) for cards and chat bubbles
- **Surface elevations** are flat — no shadows. Cards separate via background-color shift only.
- **Primary (Electric Blue)** — `#3478F6` for the validation banner and links (`Ocultar saldos`, `Limpiar conversación`)
- **Accent neon palette** — used at low opacity behind icon glyphs (purple, amber, magenta, cyan, sky-blue)
- **Text** — pure white for primary, ~60% white for secondary
- **HAVI gradient** — full conic spectrum: red → orange → yellow → green → cyan → blue → magenta → red

### Typography
The product uses a **clean geometric/humanist sans-serif** at multiple weights (Regular, Medium, Bold). The reference screenshots most closely match **Inter** or **DM Sans** — we ship Inter as the substitute. See CAVEATS.

- Display / wordmark: 700 weight, tight tracking
- Section headers: 700 weight, ~17px
- Body: 400 weight, ~15px
- Secondary / metadata: 400 weight, ~13px, ~60% white
- Buttons / links: 500–700 weight
- Numerals: tabular figures for currency alignment

### Spacing
Built on a **4px grid**. Common steps: 4, 8, 12, 16, 20, 24, 32, 48. Vertical rhythm in lists is generous — list items are ~64–72px tall to support icon + 2-line label.

### Backgrounds
- **Solid pitch-black** is the default canvas
- **No imagery, no gradients, no textures** in the chrome
- The HAVI rainbow ring is the **only** decorative gradient in the system
- Imagery (when present in marketing) is bright, photographic, but is **never used as a UI background**

### Animation
- Inferred from product class (no motion specs provided): **subtle, functional**
- Tap states: 150ms ease-out fade to ~80% opacity
- Modal/sheet entry: 250ms ease-out, slide from bottom
- HAVI ring: continuous slow rotation (~8s/cycle) to feel "alive" — a signature touch
- No bounces, no parallax, no springy overshoot

### Hover / press states
- **Tap (mobile primary):** opacity drops to 0.6 for 150ms
- **List rows:** subtle lift to `#1F1F1F` on press
- **Buttons:** primary blue darkens ~10% on press
- **No hover** in mobile context — desktop derivatives should use a `#1F1F1F` row tint

### Borders
- Lists are separated by a **1px hairline** at `rgba(255,255,255,0.08)`
- Cards have **no border** — they live on a slightly lifted surface
- Form inputs have a 1px outline `rgba(255,255,255,0.16)` that brightens on focus

### Shadows / elevation
- **None** in the mobile chrome
- Modal sheets imply elevation through a scrim (`rgba(0,0,0,0.6)`) over the dimmed base layer
- This is a **flat dark UI** — depth comes from background-tint shifts, not shadows

### Transparency & blur
- Modal scrims use 60% black
- The chat composer footer is a near-opaque `#1A1A1A` — not blurred translucent like iOS chrome
- No "frosted glass" effect anywhere in the reference

### Corner radii
- **Pill / fully rounded** — input fields, buttons, the validation banner, the bottom-nav HAVI ring
- **12px** — chat bubbles
- **8px** — small buttons, badges
- **Circle (50%)** — every product-list icon container, the avatar, the HAVI core
- **Sharp 0px** — full-bleed sections like `Mis productos contratados`

### Cards
- No outer border, no shadow, no rounded corners on full-width sections
- Inside a section: rows are flat, separated by hairline dividers
- **Icon chips** within rows are: 40–48px circle, 16% opacity tinted fill, full-color glyph centered

### Layout rules
- Status bar (system) at top
- App header bar — 56px tall, contains wordmark or back arrow + screen title + 0–2 trailing icons
- Content area — full width, edge-to-edge cards, internal 16–20px horizontal padding
- Bottom nav — 5 items, 80px tall including safe area; HAVI center item is visually elevated and slightly larger

---

## ICONOGRAPHY

The hey product uses a **soft, slightly illustrative line-icon style** with rounded line caps and joins, ~2px stroke on a 24px grid. Icons are **stroke-only** (no fills), drawn in white, and almost always presented inside a **40–48px circular chip** with a tinted color fill at ~16% opacity. The chip color is what carries the visual interest — the icon glyph itself is intentionally simple.

Special cases:
- **Tab bar icons** are stroke-only on transparent background, ~24px, white at 100% when active and 60% when inactive. No chip.
- **HAVI** in the tab bar is the exception — it is the rainbow ring around a black core, not a glyph.
- **Header chrome icons** (filter sliders, profile) are stroke-only, no chip, ~24px.

### What we ship

We ship a hand-rolled SVG set in `assets/icons/`, matching the silhouette + color treatment of the original product. **These are placeholders** — please share the real icon set if available.

| File | Use |
|---|---|
| `assets/wordmark.svg` | "hey," wordmark, white-on-dark |
| `assets/wordmark-black.svg` | "hey," wordmark, black-on-light |
| `assets/havi-ring.svg` | HAVI signature gradient ring (also available as CSS `var(--hey-havi-grad)`) |
| `assets/icons/cuentas.svg` | Accounts — `--hey-accent-purple-bg` chip |
| `assets/icons/tarjeta.svg` | Credit card — `--hey-accent-amber-bg` chip |
| `assets/icons/credito-personal.svg` | Personal loan / money bag — `--hey-accent-magenta-bg` chip |
| `assets/icons/credito-auto.svg` | Auto loan / car — `--hey-accent-cyan-bg` chip |
| `assets/icons/cuenta-menores.svg` | Kids account / piggy bank — `--hey-accent-sky-bg` chip |
| `assets/icons/referidos.svg` | Referrals — `--hey-accent-amber-bg` chip |
| `assets/icons/tab-inicio.svg` | Tab bar: home |
| `assets/icons/tab-pagos.svg` | Tab bar: payments |
| `assets/icons/tab-transferir.svg` | Tab bar: transfer |
| `assets/icons/tab-buzon.svg` | Tab bar: inbox |
| `assets/icons/sliders.svg` | Header: filter |
| `assets/icons/user.svg` | Header: profile |
| `assets/icons/chevron-*.svg` | Disclosure chevrons |
| `assets/icons/mic.svg` | Voice input (HAVI composer) |

### When you need a glyph we don't ship
Use **Lucide** (https://lucide.dev) at 2px stroke, rounded caps. It's the closest visual match for stroke weight and corner treatment. Avoid Heroicons (too thin), Font Awesome (too geometric), and any filled icon set.

### What NOT to do
- ❌ No emoji in product UI
- ❌ No unicode glyph icons (▶, ★, ✓, etc.)
- ❌ No filled icons in chips (always stroke-only on a tinted background)
- ❌ No multi-color icons except the HAVI ring

### Logos
The "hey," wordmark is the primary brand mark — always lowercase, always with the comma. Don't pair it with a tagline.

---

## CAVEATS

This system was built from **two screenshots only** — no codebase, no Figma, no font files, no formal brand guide. Specifically:

1. **Fonts are substituted.** I'm shipping Inter as the closest Google Fonts match. The original product likely uses a custom or licensed sans (the wordmark in particular looks bespoke). **Please share the actual font files** if you have them — at minimum the wordmark font.
2. **Colors are sampled from JPEG screenshots,** so values are approximate. I've rounded them to a clean palette. If you have brand spec hex codes, please share.
3. **Iconography is substituted.** The product uses custom illustrative icon chips (credit card, money bag, car, piggy bank…). I've used emoji-free SVG placeholders matching the silhouette + color treatment. **Please share the real icon set** if available.
4. **HAVI ring colors** are eyeballed from the screenshot — the actual brand gradient may differ.
5. **Only one product surface** (mobile app) is represented; no marketing site, dashboard, or onboarding flows were provided.
