# TaskForge AI — Official Color System & Token Palette

This document standardizes all color tokens, semantic surface shades, status pills, and WCAG accessibility contrast ratios for TaskForge AI.

---

## 1. Palette Architecture Overview
TaskForge AI utilizes a curated slate-and-indigo palette designed specifically for low eye strain during long software engineering sessions.

---

## 2. Core Brand Palette

### Brand Primary (Electric Blue to Indigo)
Used for primary action buttons, focused state borders, active sidebar pills, and brand badges.
- `Primary 50`: `#EFF6FF` (Light tint)
- `Primary 500`: `#3B82F6` (Electric Blue)
- `Primary 600`: `#2563EB` (Core Accent Action)
- `Primary 700`: `#1D4ED8` (Hover State)
- `Primary 900`: `#1E3A8A` (Deep Tint)

### Brand Secondary (Deep Indigo & Violet)
Used for AI features, sprint insights, and secondary highlights.
- `Indigo 500`: `#6366F1`
- `Indigo 600`: `#4F46E5`
- `Violet 500`: `#8B5CF6`

---

## 3. Dark & Light Background Surfaces

| Token Name | Light Mode Hex | Dark Mode Hex | Purpose |
| :--- | :--- | :--- | :--- |
| `surface-app-bg` | `#F8FAFC` (Slate 50) | `#020617` (Slate 950) | Main viewport canvas background |
| `surface-card-bg` | `#FFFFFF` (White) | `#0F172A` (Slate 900) | Primary card & panel container fill |
| `surface-modal-bg` | `#FFFFFF` (White) | `#0F172A` (Slate 900) | Floating dialog modal container fill |
| `surface-sidebar-bg` | `#FFFFFF` / `#0F172A` | `#020617` / `#0F172A` | Navigation sidebar background |
| `border-subtle` | `#E2E8F0` (Slate 200) | `#1E293B` (Slate 800) | Card borders & divider separators |
| `border-glow` | `#3B82F6` (Blue 500) | `#3B82F6` (Blue 500/40) | Active hover & focus ring border glow |

---

## 4. Semantic Status & Priority Colors

### Task Status Tokens
- **`TODO` (Slate/Gray)**:
  - Fill: `bg-slate-100` / `dark:bg-slate-800/80`
  - Text: `text-slate-700` / `dark:text-slate-300`
  - Dot: `bg-slate-400`
- **`IN_PROGRESS` (Electric Blue)**:
  - Fill: `bg-blue-50` / `dark:bg-blue-950/50`
  - Text: `text-blue-700` / `dark:text-blue-300`
  - Dot: `bg-blue-500`
- **`IN_REVIEW` (Warm Amber)**:
  - Fill: `bg-amber-50` / `dark:bg-amber-950/50`
  - Text: `text-amber-700` / `dark:text-amber-300`
  - Dot: `bg-amber-500`
- **`DONE` (Vibrant Emerald)**:
  - Fill: `bg-emerald-50` / `dark:bg-emerald-950/50`
  - Text: `text-emerald-700` / `dark:text-emerald-300`
  - Dot: `bg-emerald-500`

### Task Priority Tokens
- **`LOW`**: Slate 500 (`#64748B`)
- **`MEDIUM`**: Blue 600 (`#2563EB`)
- **`HIGH`**: Orange 500 (`#F97316`)
- **`URGENT`**: Red 600 (`#DC2626`)

---

## 5. Gradient & Glassmorphism Rules
- **Header Mesh**: `bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900`
- **Glass Panel**: `backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80`
- **Focus Glow Ring**: `ring-2 ring-blue-500/20`
