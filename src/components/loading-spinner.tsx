'use client';

import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    >
      <Loader2 className="w-8 h-8 text-accent" />
    </motion.div>
  );
}
