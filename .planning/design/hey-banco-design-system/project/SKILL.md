---
name: hey-banco-design
description: Use this skill to generate well-branded interfaces and assets for hey banco (a Mexican fintech / neobank), either for production or throwaway prototypes / mocks. Contains essential design guidelines, colors, typography, fonts, assets, and a UI kit of reusable React components for prototyping mobile-app surfaces.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of `assets/` and `ui_kits/` and create static HTML files for the user to view. Always import `colors_and_type.css` for tokens. Always include the wordmark as `assets/wordmark.svg` and use `var(--hey-havi-grad)` (or `assets/havi-ring.svg`) for HAVI.

If working on production code, you can copy assets and read the rules in README.md to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design — clarify whether it's a mobile screen (default), a marketing surface, or a slide. Ask whether they want to follow the existing visuals strictly or explore variations. Then act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key rules to internalize before designing:

1. **Pitch-black canvas, no gradients except the HAVI ring.** The HAVI conic gradient is the only gradient in the system.
2. **Spanish (Mexican) tú-form copy.** Never _usted_. Friendly, peer-to-peer, but not cutesy.
3. **No emoji.** Warmth comes from the wordmark, color, and microcopy.
4. **Wordmark is lowercase with the comma.** `hey,` — never `Hey` or `hey`.
5. **Icon chips:** 40–48px circle, 16% opacity tint, colored stroke glyph centered. Stroke-only icons, 2px, rounded caps.
6. **Pill buttons** for primary actions; full-bleed sections (sharp 0px corners) for content groups; 12px rounding for chat bubbles.
7. **Flat dark UI** — no shadows. Depth comes from background-tint shifts.
8. **Tab bar always has HAVI in the center**, slightly elevated, with the rainbow ring.
