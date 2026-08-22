import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SpatialStage: Orchestrates high-end cinematic 3D page-to-page navigation.
 * Creates the physical sensation of the camera travelling through a multiplane 3D world.
 */
const spatialVariants = {
  initial: {
    opacity: 0,
    z: 140,
    rotateY: 5,
    rotateX: -2,
    scale: 1.035,
    filter: 'blur(8px)'
  },
  animate: {
    opacity: 1,
    z: 0,
    rotateY: 0,
    rotateX: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1], // Cinema weighted curve
      staggerChildren: 0.08
    }
  },
  exit: {
    opacity: 0,
    z: -160,
    rotateY: -5,
    rotateX: 3,
    scale: 0.94,
    filter: 'blur(8px)',
    transition: {
      duration: 0.55,
      ease: [0.7, 0, 0.84, 0]
    }
  }
};

export default function SpatialStage({ children }) {
  const location = useLocation();

  return (
    <div
      className="spatial-stage-viewport"
      style={{
        perspective: '1400px',
        perspectiveOrigin: '50% 35%',
        transformStyle: 'preserve-3d',
        width: '100%',
        minHeight: '100%',
        position: 'relative'
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={spatialVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            width: '100%',
            transformStyle: 'preserve-3d',
            willChange: 'transform, opacity, filter'
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
