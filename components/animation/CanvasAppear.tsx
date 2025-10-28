import React from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'framer-motion';

export interface CanvasAppearProps {
  children: React.ReactNode;
  /** Delay in seconds */
  delay?: number;
  /** Initial vertical offset in px (positive moves down) */
  y?: number;
  /** Initial scale (e.g., 0.98) */
  scale?: number;
  /** Duration in seconds */
  duration?: number;
  /** Animate only on first mount (default true) */
  once?: boolean;
  /** Optional className on the motion wrapper */
  className?: string;
}

export function CanvasAppear({
  children,
  delay = 0,
  y = 8,
  scale = 0.98,
  duration = 0.24,
  once = true,
  className = '',
}: CanvasAppearProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    // Respect reduced motion: no animation
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={`transform-gpu ${className}`}
        initial={{ opacity: 0, y, scale }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay, duration, ease: 'easeOut' }}
        layout={false}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

export interface CanvasStaggerProps {
  children: React.ReactNode;
  /** Stagger in seconds between children */
  stagger?: number;
  /** Optional className for the group */
  className?: string;
}

export function CanvasStagger({ children, stagger = 0.04, className = '' }: CanvasStaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        <motion.div
          className={className}
          variants={{
            show: { transition: { staggerChildren: stagger } },
          }}
          initial="show"
          animate="show"
          exit="show"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}


