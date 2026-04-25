"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Direction the page enters from. */
  from?: "right" | "bottom";
};

const variants = {
  right: {
    initial: { x: "100%", opacity: 0.4 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0.4 },
  },
  bottom: {
    initial: { y: "100%", opacity: 0.4 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0.4 },
  },
};

export function PageTransition({ children, from = "right" }: Props) {
  const reduce = useReducedMotion();
  const v = variants[from];
  return (
    <motion.div
      initial={reduce ? false : v.initial}
      animate={reduce ? false : v.animate}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      className="min-h-screen bg-hey-bg"
    >
      {children}
    </motion.div>
  );
}
