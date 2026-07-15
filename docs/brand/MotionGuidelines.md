# TaskForge AI — Framer Motion & Animation Architecture

This document defines the animation curves, physics parameters, gesture feedbacks, and transition principles for TaskForge AI.

---

## 1. Animation Philosophy
Animations in TaskForge AI must serve utility—providing spatial context, system feedback, and navigational continuity. Animations must **never** slow down developer workflows or feel sluggish.

---

## 2. Easing & Physics Parameters

### Standard Surface Transition
```javascript
export const transitionStandard = {
  duration: 0.18,
  ease: 'easeOut',
};
```

### Spring Bounce (Modals & Popovers)
```javascript
export const transitionSpring = {
  type: 'spring',
  stiffness: 350,
  damping: 25,
};
```

---

## 3. Standard Motion Directives

### A. Page Route Transitions
- **Initial**: `{ opacity: 0, y: 6 }`
- **Animate**: `{ opacity: 1, y: 0 }`
- **Exit**: `{ opacity: 0, y: -6 }`
- **Duration**: `0.18s`

### B. Dialog Backdrop Fade & Modal Scale
- **Backdrop**: `{ opacity: 0 }` → `{ opacity: 1 }`
- **Modal Box**: `{ opacity: 0, scale: 0.95, y: 10 }` → `{ opacity: 1, scale: 1, y: 0 }`

### C. Micro Gesture Feedback (Buttons & Cards)
- **Hover**: `whileHover={{ y: -2, scale: 1.01 }}`
- **Tap**: `whileTap={{ scale: 0.98 }}`
