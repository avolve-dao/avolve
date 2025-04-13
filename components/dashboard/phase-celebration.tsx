'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pillar, ExperiencePhase, phaseNames, pillarNames } from '@/hooks/use-experience-phases';

interface PhaseCelebrationProps {
  pillar: Pillar;
  phase: ExperiencePhase;
  onDismiss: () => void;
}

export function PhaseCelebration({ pillar, phase, onDismiss }: PhaseCelebrationProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 500); // Wait for exit animation
  };

  // Different celebration styles based on phase
  const getCelebrationStyle = () => {
    switch (phase) {
      case 'discover':
        return 'bg-gradient-to-br from-blue-500 to-purple-500';
      case 'onboard':
        return 'bg-gradient-to-br from-green-500 to-teal-500';
      case 'scaffold':
        return 'bg-gradient-to-br from-yellow-500 to-orange-500';
      case 'endgame':
        return 'bg-gradient-to-br from-red-500 to-pink-500';
      default:
        return 'bg-gradient-to-br from-blue-500 to-purple-500';
    }
  };

  // Different messages based on phase
  const getCelebrationMessage = () => {
    switch (phase) {
      case 'discover':
        return "You've begun your journey of discovery!";
      case 'onboard':
        return "You're now ready to dive deeper into your journey!";
      case 'scaffold':
        return "You've reached a significant milestone in your transformation!";
      case 'endgame':
        return "You've mastered this pillar and unlocked its full potential!";
      default:
        return "Congratulations on your progress!";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative rounded-lg p-8 shadow-xl max-w-md w-full text-white ${getCelebrationStyle()}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={handleDismiss}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-2">Phase Advancement!</h2>
              <p className="text-lg mb-4">
                You've advanced to the <span className="font-bold">{phaseNames[phase]}</span> phase
                in your <span className="font-bold">{pillarNames[pillar]}</span> journey!
              </p>
              <p className="mb-6">{getCelebrationMessage()}</p>
              
              <div className="flex justify-center">
                <motion.div
                  className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 15, -15, 0]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 2
                  }}
                >
                  <span className="text-3xl">🎉</span>
                </motion.div>
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white"
                  onClick={handleDismiss}
                >
                  Continue Your Journey
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
