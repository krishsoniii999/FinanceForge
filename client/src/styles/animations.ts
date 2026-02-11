// ─── Page transition: scale up + fade with blur feel ────
export const pageVariants = {
  initial: { opacity: 0, scale: 0.96, y: 12, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -8,
    filter: 'blur(2px)',
    transition: { duration: 0.2 },
  },
}

// ─── Card entrance: spring physics stagger ──────────────
export const cardVariants = {
  initial: { opacity: 0, y: 24, scale: 0.95 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
      mass: 0.8,
    },
  }),
}

// ─── Fade in ────────────────────────────────────────────
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

// ─── Slide up with spring ───────────────────────────────
export const slideUp = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 28 },
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
}

// ─── Scale in: zoom entrance ────────────────────────────
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

// ─── Stagger container ──────────────────────────────────
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

// ─── Slide right: chat panel ────────────────────────────
export const slideRight = {
  initial: { opacity: 0, x: 420, scale: 0.98 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    x: 420,
    scale: 0.98,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// ─── Hero section: big dramatic entrance ────────────────
export const heroVariants = {
  initial: { opacity: 0, y: 40, scale: 0.92 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
      mass: 1,
    },
  },
}

// ─── List item: staggered slide ─────────────────────────
export const listItemVariants = {
  initial: { opacity: 0, x: -16 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 400, damping: 28 },
  },
}

// ─── Hover scale (for buttons/interactive) ──────────────
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
}
