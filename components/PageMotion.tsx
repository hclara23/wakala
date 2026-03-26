'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

type RevealProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  once?: boolean;
};

export function Reveal({
  children,
  className,
  delay = 0,
  distance = 32,
  duration = 0.75,
  once = true,
  ...props
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : { opacity: 0, y: distance }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ amount: 0.2, once }}
      transition={{ delay, duration, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  delayChildren?: number;
  staggerChildren?: number;
};

export function Stagger({
  children,
  className,
  delayChildren = 0.08,
  staggerChildren = 0.1,
  ...props
}: StaggerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ amount: 0.15, once: true }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren,
            staggerChildren,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  distance?: number;
};

export function StaggerItem({
  children,
  className,
  distance = 26,
  ...props
}: StaggerItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: { opacity: 0, y: distance },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              },
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

type AmbientOrbsProps = {
  className?: string;
};

export function AmbientOrbs({ className }: AmbientOrbsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <motion.span
        className="absolute left-[8%] top-20 h-64 w-64 rounded-full bg-amber-300/12 blur-3xl"
        animate={reduceMotion ? undefined : { y: [0, -22, 0], x: [0, 16, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="absolute right-[10%] top-[22%] h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl"
        animate={reduceMotion ? undefined : { y: [0, 18, 0], x: [0, -14, 0], scale: [1.02, 0.96, 1.02] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="absolute bottom-[-4rem] left-1/3 h-56 w-56 rounded-full bg-white/7 blur-3xl"
        animate={reduceMotion ? undefined : { y: [0, -18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
