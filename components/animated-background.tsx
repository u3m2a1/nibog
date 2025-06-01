'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { pageBackgrounds, floatingAnimation, PageBackground } from '@/lib/background-styles';

interface AnimatedBackgroundProps {
  children: ReactNode;
  variant: PageBackground;
  className?: string;
}

export function AnimatedBackground({ 
  children, 
  variant, 
  className = '' 
}: AnimatedBackgroundProps) {
  const { gradient, elements } = pageBackgrounds[variant];

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${gradient} ${className}`}>
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {elements.map((el, i) => (
          <motion.div
            key={`${variant}-${i}`}
            className={`absolute ${el.position} ${el.size} opacity-30`}
            custom={i}
            variants={floatingAnimation}
            initial="initial"
            animate="animate"
            aria-hidden="true"
          >
            {el.icon}
          </motion.div>
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
