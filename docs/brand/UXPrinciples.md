# TaskForge AI — User Experience (UX) Architecture Principles

This document sets forth the core user experience philosophy governing all UI components, page layouts, interactive behaviors, and design systems in TaskForge AI.

---

## 1. Speed as a Foundational Feature
**Philosophy**: Latency breaks human flow state. Every interaction in TaskForge AI must respond within <50ms.

- **Implementation**:
  - Perform client-side optimistic UI updates immediately before network requests resolve.
  - Pre-fetch route chunks using Vite code splitting.
  - Never display blank white loading screens; use shimmering Skeleton loaders.

---

## 2. Linear & Intentional Subtraction
**Philosophy**: Elegance is achieved not when there is nothing more to add, but when there is nothing left to take away.

- **Implementation**:
  - Avoid deep nested menus or multi-tiered settings modals.
  - Maximize vertical and horizontal screen real estate for task content.
  - Keep form inputs focused, essential, and keyboard-navigable.

---

## 3. Keyboard-First Workspace Navigation
**Philosophy**: Engineers work with keyboards. Reaching for a mouse should be optional.

- **Implementation**:
  - Universal Quick Command Palette accessible via `⌘K` or `Ctrl + K`.
  - Accessible tab indexes and focus rings on all interactive elements.
  - Single-key shortcuts for quick actions (e.g., `Esc` to dismiss modal overlays).

---

## 4. AI-Native Assistance Without Intrusion
**Philosophy**: AI should be a quiet partner that amplifies human capability, not an annoying pop-up assistant.

- **Implementation**:
  - Ambient AI indicators (`Sparkles` icon, subtle glowing borders).
  - Explicit user invocation for heavy AI actions (e.g., "Generate Sprint Backlog" button).
  - Never overwrite user inputs automatically; present AI suggestions clearly for confirmation.

---

## 5. Dark-Mode Native & Eye-Strain Mitigation
**Philosophy**: Software engineers spend 8-12 hours daily facing code screens. Visual comfort is non-negotiable.

- **Implementation**:
  - Rich slate-950 and navy background surfaces instead of harsh pitch-black `#000000`.
  - HSL-tailored border contrast ratios (1px `border-slate-800/80` in dark mode).
  - High-contrast typography hierarchy ensuring WCAG AAA accessibility compliance.

---

## 6. Clear Visual Hierarchy & Information Architecture
**Philosophy**: A user should understand page intent within 3 seconds of navigation.

- **Implementation**:
  - Consistent header structure across all views: Title + Subtitle + Primary Action on top right.
  - Color-coded status and priority pills with dot indicators.
  - Consistent container radiuses (`rounded-2xl` for cards, `rounded-xl` for inputs/buttons).

---

## 7. Informative & Graceful Feedback Systems
**Philosophy**: The application must never leave the user guessing about system state.

- **Implementation**:
  - Standardized non-intrusive toast notifications (`react-hot-toast`) with success/error feedback.
  - Inline validation error messages beneath form fields.
  - Friendly, actionable Empty States with custom illustrations and primary action buttons.
