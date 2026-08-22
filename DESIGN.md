# AUDEXIFY — Design Specification (`DESIGN.md`)
**Aesthetic Theme**: Technical Infrastructure & Precision Accessibility Intelligence  
**Target Platform**: Next.js 16 (App Router), Tailwind CSS v4, Dark-First Native

---

## 1. Design Philosophy & Aesthetic Direction

AUDEXIFY embodies a **Developer Infrastructure & Intelligence Instrument** aesthetic. Moving away from generic SaaS softness or standard blue/cyan palettes, the interface is modeled after high-stakes terminal tools, observability suites, and precision measurement engines.

### Key Principles
- **Atmospheric Charcoal Canvas**: Deep near-black surfaces (`#08090B` / `#0D100E`) that eliminate eye strain during long audits and allow luminescent telemetry data to pop.
- **Luminescent Acid/Chartreuse Accent**: Acid/Chartreuse (`#C7F36B`) represents deterministic intelligence, active scanning, and confirmed passes.
- **Restrained Status Spectrum**: Amber (`#FFB86B`) for moderate warnings and Coral (`#FF6B6B`) for serious/critical violations.
- **Warm Editorial Typography**: High-contrast warm off-white headings paired with geometric interface text and monospace WCAG criteria.
- **Hairline Precision**: 1px subtle borders, bracketed corner crosshairs, dot-matrix technical backdrops, and telemetry nodes.

---

## 2. Color Tokens

### 2.1 Core Palette (Hex & OKLCH / CSS Variables)

```css
:root,
.dark {
  /* Surface & Canvas Hierarchy */
  --bg-canvas: #08090B;               /* Deepest background base */
  --bg-surface: #0D100E;              /* Primary container / panel background */
  --bg-surface-elevated: #121413;     /* Raised cards & interactive items */
  --bg-surface-overlay: #181B19;      /* Modals, dropdowns, hovered items */
  --bg-surface-muted: #1F2229;        /* Inactive tracks & subtle backgrounds */

  /* Hairline Borders */
  --border-subtle: #1F2229;          /* Default card & section dividers */
  --border-strong: #2E342D;          /* Focused / highlighted container borders */
  --border-crosshair: #444938;       /* Corner bracket annotations */

  /* Typography Colors */
  --text-primary: #F1F0EA;           /* Warm off-white - high contrast headers & primary text */
  --text-secondary: #C4C9B3;         /* Neutral body & subheadings */
  --text-muted: #8B8F98;             /* Monospace labels, timestamps, metadata */
  --text-dim: #54575E;               /* Inactive / disabled text */

  /* Intelligence & Accent (Acid / Chartreuse) */
  --accent-acid: #C7F36B;            /* Primary brand & deterministic ML accent */
  --accent-acid-dim: #ABD551;        /* Hover / active state variant */
  --accent-acid-bg: rgba(199, 243, 107, 0.12); /* Subtle glow & pill fills */
  --accent-acid-border: rgba(199, 243, 107, 0.4);

  /* Status & Severity Colors */
  --severity-critical: #FF6B6B;      /* Critical violations (Coral) */
  --severity-critical-bg: rgba(255, 107, 107, 0.15);
  --severity-serious: #FF8E72;       /* Serious violations */
  --severity-serious-bg: rgba(255, 142, 114, 0.15);
  --severity-moderate: #FFB86B;      /* Moderate issues (Amber) */
  --severity-moderate-bg: rgba(255, 184, 107, 0.15);
  --severity-minor: #8E937F;         /* Minor / Informational notices */
  --severity-minor-bg: rgba(142, 147, 127, 0.15);
  --status-success: #C7F36B;         /* Passes & verified checks */

  /* Provenance Engine Colors */
  --source-deterministic: #8E937F;   /* axe-core engine (neutral slate) */
  --source-ml: #C7F36B;              /* DistilBERT / EfficientNet ONNX models */
  --source-ai: #FFB86B;              /* LLM explanation & remediation */

  /* Glow Effects */
  --glow-acid: 0 0 24px -4px rgba(199, 243, 107, 0.25);
  --glow-coral: 0 0 24px -4px rgba(255, 107, 107, 0.25);
}
```

---

## 3. Typography System

The typography uses a tri-font system that cleanly separates editorial titles, interface controls, and technical verification data:

| Role | Font Family | Size | Weight | Tracking / Line Height | Usage |
|---|---|---|---|---|---|
| **Display Title** | `Chivo` / `Hanken Grotesk` | `48px` - `64px` | `800` Bold | `-0.03em` / `1.1` | Hero headlines, Score numbers |
| **Section Headline** | `Chivo` / `Hanken Grotesk` | `24px` - `32px` | `700` Bold | `-0.01em` / `1.2` | Major card titles, Page headers |
| **Interface Body** | `Geist` / `Inter` | `15px` - `16px` | `400` Regular | `0em` / `1.6` | Narrative descriptions, recommendations |
| **Interface Medium** | `Geist` / `Inter` | `14px` - `15px` | `500` Medium | `0em` / `1.5` | Form labels, Navigation items |
| **Technical Label** | `JetBrains Mono` | `11px` - `12px` | `600` SemiBold | `+0.08em` / `1.0` (Caps) | Telemetry status, Badges, Stage tags |
| **Code & Data** | `JetBrains Mono` | `13px` - `14px` | `400` Regular | `0em` / `1.5` | CSS Selectors, HTML snippets, WCAG tags |

---

## 4. Layout & Grid Architecture

- **Max Container Width**: `1280px` (standard desktop view) / `1440px` (wide studio layout).
- **Horizontal Desktop Margins**: Generous `40px` to `64px` to create an uncluttered, premium feel.
- **Column Grid**: 12-column responsive fluid layout (`gap-6` / `24px` gutters).
- **Two-Column Intelligence Split**:
  - **Left Rail (5 cols)**: Audit overview, summary breakdown, and scrollable finding items list.
  - **Right Inspector (7 cols)**: Detailed issue intelligence inspector panel with live relationship graph, DOM snapshot, and AI remediation patch.
- **Section Spacing**: `64px` to `80px` between major page segments.

---

## 5. Navigation & Telemetry Header

- **Layout**: Fixed / Sticky top header with frosted glass backdrop blur (`backdrop-blur-md bg-[#08090B]/85`).
- **Border**: Thin hairline bottom border (`border-b border-[#1F2229]`).
- **Brand Identifier**: High-contrast monogram icon with acid border and bold tracking logo: `AUDEXIFY`.
- **Center Nav Links**: Monospace caps (`12px`, uppercase), subtle hover state transition to `--accent-acid`, active link indicated by a solid 1px bottom accent line.
- **Right Telemetry Action**:
  - Direct route switcher (`SITE AUDIT` / `SCREENSHOT ANALYSIS`).
  - Active pulse indicator (`● SYSTEM OPERATIONAL`).

---

## 6. Buttons & Interactive Controls

1. **Primary Action Button (Acid Pill/Cut)**:
   - Background: Solid Acid Chartreuse `#C7F36B`.
   - Text: Near-black `#08090B`, `JetBrains Mono`, `12px`, Bold, Uppercase.
   - Border radius: `4px` (`rounded-sm`).
   - Hover: Slight luminance shift `#ABD551` and subtle `--glow-acid` shadow.
2. **Secondary / Ghost Button (Hairline Tech)**:
   - Background: Transparent or `#0D100E`.
   - Border: `1px solid #1F2229`.
   - Text: `--text-primary` / `--text-secondary`, `JetBrains Mono`, `12px`, Uppercase.
   - Hover: Border switches to `--accent-acid` and text illuminates to `#F1F0EA`.
3. **Pill Switchers & Filter Tabs**:
   - Monospace tags with active fill `--accent-acid-bg` and 1px border.

---

## 7. Cards, Panels & Corner Annotations

- **Surface Treatment**: Background `#0D100E` with 1px border `#1F2229`.
- **Corner Crosshairs (Signature Technical Pattern)**:
  - Small 2px $\times$ 2px or 8px hairline corner L-brackets on key cards using `::before` and `::after` pseudo-elements (`border-t border-l border-[#444938]`).
- **Hover Micro-lift**: Subtle -2px translateY lift, border color transition to `#2E342D`, and faint acid corner glow.
- **Selected Finding Card**:
  - Solid left border strip: `w-1 bg-[#C7F36B]`.
  - Background illuminates from `#0D100E` to `#121413`.

---

## 8. Form Inputs & Audit Command Bar

- **Command Center URL Input**:
  - Framed within a dark precision enclosure `#0D100E` with 1px hairline border `#1F2229`.
  - Type: `JetBrains Mono`, text color `#F1F0EA`, placeholder `#54575E`.
  - Embedded Action: Inline `ANALYZE →` button pinned to the right edge.
  - Active Focus: 1px glowing focus boundary (`focus:border-[#C7F36B]`) with subtle pulse.
- **Screenshot Dropzone**:
  - Dashed technical bounding box (`border-dashed border-[#2E342D]`).
  - Inner grid crosshairs and drag-active state lighting up with acid tint.

---

## 9. Badges & Provenance Indicators

### Severity Badges
- **Critical / Serious**: Rectangular badge with Coral border (`border-[#FF6B6B]/40`), background `rgba(255, 107, 107, 0.15)`, text `#FF6B6B`.
- **Moderate**: Rectangular badge with Amber border (`border-[#FFB86B]/40`), background `rgba(255, 184, 107, 0.15)`, text `#FFB86B`.
- **Minor**: Rectangular badge with Olive Gray border (`border-[#8E937F]/40`), background `rgba(142, 147, 127, 0.15)`, text `#C4C9B3`.

### Provenance (Source) Badges
- **Deterministic**: Slate badge with `Cpu` icon (`border-[#1F2229]`, text `#8E937F`).
- **Custom ML**: Chartreuse badge with `FlaskConical` icon (`border-[#C7F36B]/40`, text `#C7F36B`).
- **AI-Generated**: Amber badge with `Sparkles` icon (`border-[#FFB86B]/40`, text `#FFB86B`).

---

## 10. Score Gauge & Data Visualizations

1. **Radial Score Ring**:
   - Thin 8px–10px circular SVG path.
   - Background track: Dark charcoal `#1F2229`.
   - Progress fill: Dynamic gradient stroke mapped to score (Acid Chartreuse $\ge 75$, Amber $\ge 50$, Coral $< 50$).
   - Center Display: Large `48px` bold Chivo numerals with small uppercase label `ACCESSIBILITY SCORE`.
2. **Breakdown Metric Indicators**:
   - Crisp technical status blocks showing exact counts for Critical, Serious, Moderate, and Minor issues.
3. **Telemetry Relationship Graph**:
   - Node-and-edge visualization connecting `WCAG Rule` $\rightarrow$ `DOM Selector` $\rightarrow$ `Remediation Target`.

---

## 11. Technical Background & Atmospheric Lighting

1. **Dot-Matrix Background Grid**:
   - CSS Radial dot pattern: `radial-gradient(circle at center, rgba(31, 34, 41, 0.6) 1px, transparent 1px)` with `24px 24px` grid sizing.
   - Zero network overhead, completely GPU-accelerated.
2. **Ambient Atmospheric Spotlight**:
   - Subtle radial glow on page header / hero right (`radial-gradient(circle at 70% 30%, rgba(199, 243, 107, 0.04) 0%, transparent 60%)`).
3. **Subtle Scanline Texture**:
   - Optional 4px repeating micro-scanline gradient (`rgba(255, 255, 255, 0.015)`).

---

## 12. Loading & Pipeline Execution States

- **Stepped Pipeline Progress Tracker**:
  - Replaces generic spinners with a 5-step horizontal/vertical telemetry progression:
    1. `VALIDATE TARGET` (URL & SSRF guards)
    2. `BROWSER INSTANTIATION` (Headless Chromium)
    3. `AXE-CORE WCAG 2.2` (Deterministic audit)
    4. `DISTILBERT ML CLASSIFIER` (Severity inference)
    5. `LLM REMEDIATION SYNTHESIS` (Structured explanations)
  - Active step features pulsing chartreuse beacon and elapsed second timer.
- **Screenshot Vision Scanner**:
  - Animated horizontal scanning laser beam (`animate-[scan_3s_ease-in-out_infinite]`) over the uploaded image canvas.

---

## 13. Error & Fallback States

- **Technical Diagnostic Error Panel**:
  - Enclosed in a Coral-bordered panel (`border-[#FF6B6B]/40 bg-[#121413]`).
  - Terminal-inspired error output with error code (e.g. `DNS_FAILURE`, `TIMEOUT_EXCEEDED`, `ML_MODEL_UNAVAILABLE`).
  - Actionable recovery buttons (`RETRY AUDIT`, `CHECK TARGET URL`).
- **Graceful Degradation Banner**:
  - Highlighting when ML models or LLM fallbacks are in use with complete transparency.

---

## 14. Responsive Layout Behavior

- **Desktop ($\ge 1024px$)**: Full 12-column inspector layout with simultaneous findings rail and detailed remediation drawer.
- **Tablet ($768px - 1023px$)**: 2-column layout transitioning to stacked view with sticky section headers.
- **Mobile ($< 768px$)**:
  - Single-column flow with full-width action buttons.
  - Dropdown/accordion inspector for individual findings.
  - Mobile header with sliding drawer menu.

---

## 15. Animation & Micro-Interaction Guidelines

- **Hardware Accelerated**: All transitions restricted to `opacity`, `transform`, and `box-shadow`.
- **Easing Curves**: Crisp engineering easing (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Reduced Motion Support**: Strict `@media (prefers-reduced-motion: reduce)` fallbacks disabling scans, pulses, and lifts.
