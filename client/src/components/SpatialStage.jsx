import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SpatialStage: High-performance, butter-smooth page-to-page transition.
 * Renders instantly without long blocking wait states or jarring blurs.
 */
const spatialVariants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.995
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.12,
      ease: 'easeOut'
    }
  }
};

export default function SpatialStage({ children }) {
  const location = useLocation();

  return (
    <div
      className="spatial-stage-viewport"
      style={{
        width: '100%',
        minHeight: '100%',
        position: 'relative'
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={location.pathname}
          variants={spatialVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            width: '100%'
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
