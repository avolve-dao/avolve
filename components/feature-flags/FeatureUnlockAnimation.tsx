'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Star, Trophy } from 'lucide-react';

interface FeatureUnlockAnimationProps {
  feature: {
    key: string;
    description?: string;
  };
  isVisible: boolean;
  onClose: () => void;
}

export function FeatureUnlockAnimation({
  feature,
  isVisible,
  onClose,
}: FeatureUnlockAnimationProps) {
  const confettiRef = useRef<HTMLDivElement>(null);

  // Format feature name for display
  const formatFeatureName = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  // Trigger confetti animation when component becomes visible
  useEffect(() => {
    if (isVisible && confettiRef.current) {
      const rect = confettiRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      // First confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y: y - 0.1 },
      });

      // Second confetti burst with delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: x - 0.1, y: y - 0.1 },
        });

        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: x + 0.1, y: y - 0.1 },
        });
      }, 300);

      // Auto-close after animation
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <motion.div
            ref={confettiRef}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-full opacity-70" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-green-100 rounded-full opacity-70" />
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4 mx-auto"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Feature Unlocked!
                  <Star className="h-5 w-5 text-amber-500" />
                </h2>

                <h3 className="text-xl font-semibold text-blue-600 mb-4">
                  {formatFeatureName(feature.key)}
                </h3>

                <p className="text-gray-600 mb-6">
                  {feature.description || "You've unlocked a new feature!"}
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition-colors"
                >
                  Awesome!
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
