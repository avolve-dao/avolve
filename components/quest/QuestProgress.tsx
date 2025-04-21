import React from 'react';

interface QuestProgressProps {
  title: string;
  category: string;
  status: string;
  progress: number;
}

export const QuestProgress: React.FC<QuestProgressProps> = ({ title, category, status, progress }) => {
  // Convert status to a more readable format
  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  
  return (
    <div className="py-2 border-b border-zinc-200 last:border-b-0">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-foreground">{title}</span>
        <span className="text-sm text-muted-foreground">{formattedStatus}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-1">Category: {category}</div>
      <div className="w-full bg-secondary rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-right text-xs text-muted-foreground mt-1">{progress}% Complete</div>
    </div>
  );
};
