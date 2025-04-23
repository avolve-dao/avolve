import { useEffect, useState } from 'react';

interface AdminCelebrationToastProps {
  show: boolean;
  userName?: string;
  onClose: () => void;
}

export function AdminCelebrationToast({ show, userName, onClose }: AdminCelebrationToastProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-8 right-8 z-50 bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center animate-bounce-in">
      <span className="text-2xl mr-3">🎉</span>
      <div>
        <div className="font-bold">Success!</div>
        <div>
          {userName
            ? `You just helped ${userName} complete onboarding!`
            : 'You just helped a user complete onboarding!'}
        </div>
      </div>
    </div>
  );
}
