# TaskForge AI — Reusable Component Guidelines & Specifications

This document defines usage standards, variants, state behavior, and rules for every core reusable UI component in TaskForge AI.

---

## 1. Button Primitive (`Button.jsx`)
### Purpose
Primary call-to-action trigger for executing operations, submitting forms, or navigating views.

### Variants
- **`Primary`**: Gradient `from-blue-600 to-indigo-600` with white text. High emphasis.
- **`Secondary`**: White/Slate-900 surface with 1px border. Medium emphasis.
- **`Ghost`**: Transparent background with text hover state. Low emphasis.
- **`Danger`**: Crimson red fill or text for destructive actions (e.g., Delete Task).

### Behavior & Feedback
- Must include a loading spinner when performing async API requests.
- Must disable interaction (`disabled:opacity-50`) during submission.
- Must incorporate Framer Motion micro-spring feedback (`whileHover`, `whileTap`).

### Do's & Don'ts
- ✅ **DO**: Use primary variant for the single most important action per viewport.
- ❌ **DON'T**: Stack multiple primary buttons next to each other.

---

## 2. Card Container (`Card.jsx`)
### Purpose
Surface container for grouping logical workspace data (tasks, metrics, project info).

### Specifications
- **Base Style**: `glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90`.
- **Hover Motion**: When `onClick` is provided, translate `-2px` vertically with shadow growth.

---

## 3. Status & Priority Badges (`Badge.jsx`)
### Purpose
Provide immediate visual categorization for task status, priority level, or role.

### Specifications
- Enclose label with a 1.5px dot indicator matching status intent.
- Use HSL-harmonized pastel text and background pairs with matching border hues.

---

## 4. Modal Dialog Overlay (`Modal.jsx`)
### Purpose
Focus user attention on an isolated flow (e.g., Create Task, Edit Project).

### Specifications
- **Backdrop**: Fixed overlay with `bg-slate-950/60 backdrop-blur-sm`.
- **Keyboard Listener**: Listen for `Escape` key press to dismiss modal cleanly.
- **Body Lock**: Prevent background scrolling when open (`document.body.style.overflow = 'hidden'`).

---

## 5. Shimmering Skeleton Loader (`SkeletonCard.jsx`)
### Purpose
Occupies screen layout space while API data promises are loading to avoid visual layout shifts.

### Specifications
- Incorporate CSS `animate-pulse` on rounded slate block shapes (`bg-slate-200 dark:bg-slate-800`).
