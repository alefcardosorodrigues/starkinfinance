# The Design System: Tactical Specification

## 1. Overview & Creative North Star
**The Creative North Star: "Precision Luminescence"**

This design system is engineered to feel less like a mobile app and more like a high-end physical artifact—a slab of polished obsidian reflecting a digital data layer. We are moving away from the "flat" web by embracing **Tonal Depth** and **Bespoke Asymmetry**. 

The goal is to provide a focused financial environment that feels authoritative yet fluid. We achieve this by breaking the rigid, boxed-in grid of standard fintech. Expect overlapping elements, large editorial-style typography, and a "light-from-within" glow that guides the user’s eye toward growth and action.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the "Deepest Charcoal" spectrum, moving away from pure blacks to avoid visual "crushing."

### The Palette (Material Design Tokens)
- **Background:** `#0d141f` (The base canvas)
- **Primary (Action):** `#adc6ff` (Electric Blue base)
- **Secondary (Growth):** `#4edea3` (Vibrant Emerald)
- **Tertiary (Expenses):** `#ffb3b6` (Soft Ruby)
- **Surface Scale:** From `surface_container_lowest` (`#080e1a`) to `surface_bright` (`#333946`).

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined solely through:
1.  **Background Color Shifts:** Placing a `surface_container_low` card on a `surface` background.
2.  **Shadow Depth:** Using ambient, diffused shadows to imply separation.
3.  **Negative Space:** Using the spacing scale to group related information.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent materials. 
- **The Base:** Always `surface_dim` or `background`.
- **The Navigation/Context:** `surface_container_low`.
- **The Active Work Surface:** `surface_container_high`.
- **Nesting:** When placing a card within a section, the inner card should always be one "tier" lighter or darker than its parent to create organic contrast without lines.

### The "Glass & Gradient" Rule
To elevate beyond "out-of-the-box" UI, use **Glassmorphism** for all floating elements (Modals, Navigation Bars, Tooltips). 
- **Effect:** Apply `surface_container` at 60% opacity with a `20px` backdrop blur.
- **Soulful Gradients:** For Hero Sections or "Growth" cards, use a linear gradient from `secondary` to `secondary_container` at a 135-degree angle. This provides a tactile "glow" that flat colors cannot replicate.

---

## 3. Typography: The Editorial Voice
We use **Manrope** for its geometric clarity and modern tech-aesthetic. 

- **Display (Display-LG/MD):** Used for account balances and major milestones. These should be tracked tightly (-2%) to feel like a premium watch face.
- **Headlines (Headline-SM/MD):** Use these for section headers. Don't be afraid of intentional asymmetry—left-align headers while right-aligning data points to create a sophisticated, non-template look.
- **Labels (Label-MD/SM):** All-caps with increased letter spacing (+5%) for secondary metadata (e.g., "TRANSACTION DATE"). This creates an "architectural" feel.

---

## 4. Elevation & Depth
In this design system, light is the primary indicator of importance.

### The Layering Principle
Depth is achieved by "stacking" surface tiers.
- **Level 0:** `surface_container_lowest` (Recessed areas, like background scrolls).
- **Level 1:** `surface` (The primary page level).
- **Level 2:** `surface_container_high` (Standard cards/interactive elements).

### Ambient Shadows & Neon Glows
Standard "Drop Shadows" are forbidden. Use **Ambient Shadows**:
- **Formula:** Blur 32px, Y-Offset 12px, Color: `on_surface` at 6% opacity.
- **Neon States:** For active toggles or high-growth indicators, use a "Glow Shadow." Use the `secondary` or `primary` color at 20% opacity with a 15px spread to mimic a neon tube's light bleed.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., input fields), use a **Ghost Border**: 
- Token: `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Signature Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`). Border radius: `12px` (md). No border. High-contrast `on_primary` text.
- **Secondary:** Glass effect. `surface_container_high` at 40% opacity + backdrop blur.
- **State Change:** On hover/active, apply the "Neon Glow" shadow (Primary color).

### Cards & Financial Lists
- **Rule:** Forbid divider lines between list items. 
- **Execution:** Use vertical white space (16px–24px) or a subtle shift from `surface_container_low` to `surface_container_lowest` on alternating items.
- **The "Obsidian Card":** Use a 12px corner radius. Apply a subtle 45-degree "sheen" gradient using a white-to-transparent overlay at 5% opacity to mimic light hitting a glass edge.

### Interaction Chips
- Use `full` (9999px) roundness for chips. 
- **Inactive:** `surface_container_highest` with `on_surface_variant` text.
- **Active:** `primary` background with a subtle glow.

---

## 6. Do’s and Don’ts

### Do:
- **Embrace Negative Space:** Allow data to breathe. Premium experiences feel "expensive" because they aren't crowded.
- **Use Intentional Asymmetry:** Align text to the left and figures to the right, but perhaps offset the container slightly to create a bespoke, custom-coded feel.
- **Prioritize Legibility:** Ensure `on_surface` (White/Silver) text maintains high contrast against the deep charcoal backgrounds.

### Don't:
- **Never use 1px solid dividers.** Use tonal shifts or space.
- **Avoid "Pure Black" (#000000).** It kills the depth of the glassmorphism effects.
- **No Sharp Corners.** Everything interactive must adhere to the `12px` (md) or `full` roundness scale to maintain the "friendly yet structured" promise.
- **Don't Over-Glow.** Limit neon effects to one primary focal point per screen (e.g., the "Transfer" button or the "Total Balance").

---

## 7. Roundedness Scale Reference
- **None:** 0px (Prohibited for UI containers).
- **Sm:** 4px (Selection indicators).
- **Default/Md:** 12px (Standard Cards, Buttons, Inputs).
- **Lg/Xl:** 16px–24px (Main Modal containers, Bottom Sheets).
- **Full:** 9999px (Pills, Chips, Avatars).