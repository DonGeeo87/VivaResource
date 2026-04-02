# Design System Specification: Editorial Empathy

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Human Ledger."** 

Too many non-profit digital experiences feel like cold, sterile repositories of data or generic templates. This system rejects that. Instead, it treats every page as a high-end editorial spread—a "ledger" that balances professional corporate stability (Blue) with organic, hopeful vitality (Green). 

We move beyond the "standard" UI by breaking the rigid grid. We use intentional asymmetry, overlapping image-to-text elements, and high-contrast typography scales to create a sense of movement. The goal is to make the user feel like they are reading a premium physical journal rather than navigating a website. By using depth-based layering and glassmorphism, we ensure the experience feels modern and accessible, yet deeply rooted in trust.

---

## 2. Colors: Tonal Architecture
The palette is built on Material Design 3 logic but executed with an editorial eye. We use sophisticated tonal shifts rather than structural lines to define space.

### The Color Tokens
- **Primary (Trust):** `#025689` (The anchor) | `on_primary`: `#ffffff`
- **Secondary (Hope/Action):** `#416900` | `secondary_container`: `#b7f569`
- **Surface Strategy:** 
    - `surface`: `#f9f9f9` (The canvas)
    - `surface_container_low`: `#f3f3f3`
    - `surface_container_high`: `#e8e8e8`

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Boundaries must be defined solely through background color shifts. For example, a donation module should be a `surface_container_low` card sitting on a `surface` background. If you need a "line," use a 4px vertical color block of `primary` to the left of a heading—never a full-width divider.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
- **The Base:** Use `surface`.
- **The Content Block:** Use `surface_container_low` for large sections.
- **The Interactive Card:** Use `surface_container_lowest` (#ffffff) to make it "pop" forward naturally.

### The "Glass & Gradient" Rule
To add visual "soul," use a subtle linear gradient for Hero sections: `primary` (#025689) to `primary_container` (#2e6fa3) at a 135-degree angle. For floating navigation or bilingual toggles, apply **Glassmorphism**: Use `surface` at 80% opacity with a `20px` backdrop-blur.

---

## 3. Typography: Editorial Authority
The typography uses a scale that prioritizes clarity and "breathing room."

- **Display (Plus Jakarta Sans):** Used for big, bold impact. Large tracking (-0.02em) to feel sophisticated.
    - `display-lg`: 3.5rem (56px) / SemiBold.
- **Headlines (Plus Jakarta Sans):** The "Voice" of the foundation.
    - `headline-md`: 1.75rem (28px) / Bold.
- **Body (Public Sans):** Chosen for its exceptional legibility in bilingual (Spanish/English) contexts.
    - `body-lg`: 1rem (16px) / Regular. Line height: 1.6 (25.6px) for maximum readability.
- **Labels (Public Sans):** 
    - `label-md`: 0.75rem (12px) / Medium. Used for tags, micro-copy, and form headers.

The hierarchy conveys authority through size contrast. A `display-lg` heading should often be followed by a `body-lg` paragraph with significant top-padding (token `10` or `12`) to allow the message to "land."

---

## 4. Elevation & Depth: Tonal Layering
We reject "standard" drop shadows. We create depth through light and atmospheric perspective.

### The Layering Principle
Depth is achieved by "stacking" surface tiers. Place a `surface_container_lowest` card on a `surface_container_low` section to create a soft, natural lift.

### Ambient Shadows
If a floating effect is required (e.g., a "Donate" FAB), use an **Ambient Shadow**:
- **Color:** `#1a1c1c` at 6% opacity.
- **Blur:** 32px.
- **Offset:** Y: 8px.
This mimics natural light rather than a digital "glow."

### The "Ghost Border" Fallback
If a border is legally or functionally required for accessibility, it must be a **Ghost Border**: Use `outline_variant` at 20% opacity. 100% opaque, high-contrast borders are strictly forbidden.

---

## 5. Components: Organic Functionalism

### Buttons
- **Primary:** `primary` background, `on_primary` text. Roundedness: `full` (pill shape).
- **Secondary:** `secondary_container` background, `on_secondary_container` text. This is your "Action/Hope" button.
- **Tertiary:** No background. Bold `primary` text. Used for "Read More" or "Learn More."

### Input Fields & Forms
- **Style:** Use `surface_container_highest` as the background. No border. 
- **Focus State:** A 2px `primary` border only appears on focus. 
- **Bilingual Support:** Labels should always accommodate both languages (e.g., "Full Name / Nombre Completo") using `label-md`.

### Cards & Lists
- **The Forbid Rule:** No horizontal dividers between list items. Use vertical white space (token `6` or `8`) to separate items.
- **Image Treatment:** Use `rounded-xl` (1.5rem) for all imagery. Photos should overlap the edge of their container cards by 24px to break the "boxed-in" feel.

### Resource Chips
- **Interaction:** Pill-shaped, using `surface_container_high`. Upon selection, transition to `primary` with `on_primary` text. No harsh borders.

---

## 6. Do’s and Don’ts

### Do:
- **Use "White Space" as a Tool:** Use the `24` (6rem) spacing token between major sections to let the brand "breathe."
- **Embrace Asymmetry:** Place a heading on the left and a paragraph on the right with an offset of 1 column.
- **Optimize for Bilingualism:** Always design for the Spanish translation, which is typically 20-30% longer than English.

### Don't:
- **Don't use 100% Black:** Always use `on_surface` (#1a1c1c) for text to maintain a premium, softer feel.
- **Don't use Default Shadows:** Never use the standard `0px 2px 4px rgba(0,0,0,0.5)` shadow. It looks cheap.
- **Don't use Square Corners:** Every element must have at least a `sm` (0.25rem) radius to maintain the "Warm/Organic" persona.

### Accessibility Note:
Ensure all `secondary` green text combinations meet WCAG AA contrast ratios (4.5:1) against `surface` colors. If the green is too light for text, use the `on_secondary_container` (#457000) token for typography.