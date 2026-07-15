# TaskForge AI — Standardized Design Tokens & Spatial Metrics

This document codifies all numerical layout tokens, spatial grids, component dimensions, animation timing parameters, and responsive breakpoint scales in TaskForge AI.

---

## 1. Spatial Grid & Spacing Scale
TaskForge AI strictly enforces an **8px grid scale** (with 4px increments for micro-padding).

| Token Name | Value | Rem Equivalent | Tailwind Class | Primary Application |
| :--- | :--- | :--- | :--- | :--- |
| `space-0.5` | `2px` | `0.125rem` | `p-0.5 / gap-0.5` | Micro badge internal spacing |
| `space-1` | `4px` | `0.25rem` | `p-1 / gap-1` | Icon-to-text gap |
| `space-1.5` | `6px` | `0.375rem` | `p-1.5 / gap-1.5` | Small button internal padding |
| `space-2` | `8px` | `0.5rem` | `p-2 / gap-2` | Standard card internal gaps |
| `space-3` | `12px` | `0.75rem` | `p-3 / gap-3` | Input field padding, list items |
| `space-4` | `16px` | `1.0rem` | `p-4 / gap-4` | Card padding, sidebar header gap |
| `space-6` | `24px` | `1.5rem` | `p-6 / gap-6` | Section padding, container gaps |
| `space-8` | `32px` | `2.0rem` | `p-8 / gap-8` | Page layout padding |

---

## 2. Component Radii (Border Radius Scale)
- **`rounded-lg` (`8px`)**: Form inputs, standard status pills, drop-down menu items.
- **`rounded-xl` (`12px`)**: Navigation bar buttons, primary action buttons, tooltips.
- **`rounded-2xl` (`16px`)**: Standard dashboard cards, Kanban column containers.
- **`rounded-3xl` (`24px`)**: Hero banners, split auth containers, modal overlays.
- **`rounded-full` (`9999px`)**: User avatars, status dot indicators, badge chips.

---

## 3. Shadows & Depth Scale
- **`shadow-xs`**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` (Subtle surface elevation)
- **`shadow-sm`**: `0 1px 3px 0 rgba(0, 0, 0, 0.1)` (Card container rest state)
- **`shadow-md`**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)` (Card hover & dropdown active)
- **`shadow-xl`**: `0 20px 25px -5px rgba(0, 0, 0, 0.3)` (Floating modals & preview mockups)
- **`glow-blue`**: `0 0 20px -3px rgba(59, 130, 246, 0.3)` (Active glow state)

---

## 4. Breakpoints Scale
```
  Mobile           Tablet           Laptop           Desktop          Wide Desktop
  < 640px          640px-768px      768px-1024px     1024px-1280px    >= 1280px
  (sm)             (md)             (lg)             (xl)             (2xl)
```

---

## 5. Animation Duration Tokens
- **`duration-instant` (`100ms`)**: Button click feedback, active states.
- **`duration-fast` (`180ms`)**: Hover transitions, tab changes, tooltips.
- **`duration-standard` (`300ms`)**: Sidebar expand/collapse, drawer slide-outs.
- **`duration-slow` (`500ms`)**: Page route transitions, heavy modal scale-ins.
