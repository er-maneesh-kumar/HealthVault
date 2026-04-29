import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Loader from './Loader';

/* ─── Animation variants ────────────────────────────────────────────────────
   Slide up + fade in on enter, fade out on exit.
   Feel free to swap `variants` for other presets below.
────────────────────────────────────────────────────────────────────────────── */
const variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -16 },
};

const transition = {
  duration: 0.32,
  ease: [0.4, 0, 0.2, 1], // Material-style ease
};

/**
 * Wrap every <Route> element with this to get smooth page transitions.
 * Usage (in App.js):
 *   <PageTransition>
 *     <YourPageComponent />
 *   </PageTransition>
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loader on every route change
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // 0.5 second loading animation
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <motion.div
      key={location.pathname}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      style={{ width: '100%', minHeight: '100%' }}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Loader size={80} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
