# TaskForge AI — Typography Architecture & Type System

This document specifies the font families, scale hierarchy, line-height proportions, and font weight rules for TaskForge AI.

---

## 1. Primary Font Stack

### Body & Display Interface: Inter
TaskForge AI uses **Inter** as its primary system typeface across all interface screens, marketing pages, and dashboard views.
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

### Monospace Metadata & Code Keys: JetBrains Mono
Used for issue keys (e.g., `TF-104`), API paths, date timestamps, git branch names, and code metrics.
```css
font-family: ui-monospace, SFMono-Regular, Meni, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
```

---

## 2. Type Hierarchy Scale

| Level | Size (rem / px) | Line Height | Weight | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 1** | `3.75rem / 60px` | `1.1` | Extrabold (800) | `text-4xl sm:text-6xl font-extrabold` | Landing Hero Headline |
| **Heading 1** | `1.50rem / 24px` | `1.25` | Extrabold (800) | `text-2xl font-bold` | Page Titles (Dashboard, Projects) |
| **Heading 2** | `1.25rem / 20px` | `1.3` | Bold (700) | `text-xl font-bold` | Card Group Headers & Section Titles |
| **Heading 3** | `1.00rem / 16px` | `1.4` | Bold (700) | `text-base font-bold` | Task Titles, Modal Headers |
| **Body Bold** | `0.875rem / 14px` | `1.4` | Semibold (600) | `text-sm font-semibold` | Form Labels, Table Headers |
| **Body Standard**| `0.875rem / 14px` | `1.5` | Regular (400) | `text-sm text-slate-600` | Form Input Text, Descriptions |
| **Caption Small**| `0.75rem / 12px` | `1.4` | Medium (500) | `text-xs text-slate-500` | Subtitles, Filter Options, Metadata |
| **Micro Code** | `0.625rem / 10px` | `1.2` | Bold (700) | `text-[10px] font-mono` | Issue Keys, Status Dot Pills, Badges |

---

## 3. Letter Spacing & Line Height Rules
- **Display Headings**: Tight tracking (`tracking-tight` or `-0.025em`) to emphasize velocity and weight.
- **Micro Badges**: Wide uppercase tracking (`tracking-widest` or `0.05em`) to ensure legibility on small pill chips.
- **Body Paragraphs**: Comfortable line height (`leading-relaxed` or `1.6`) for rapid scanning.
