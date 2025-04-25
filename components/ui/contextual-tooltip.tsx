'use client';

import React, { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Award, Lightbulb, Puzzle, Layers, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TooltipType =
  | 'gen_token'
  | 'sap_token'
  | 'scq_token'
  | 'psp_token'
  | 'bsp_token'
  | 'sms_token'
  | 'spd_token'
  | 'she_token'
  | 'ssa_token'
  | 'sbg_token'
  | 'experience_phases'
  | 'journey_map'
  | 'superpuzzles'
  | 'fractally';

interface ContextualTooltipProps {
  children: ReactNode;
  type?: TooltipType;
  content?: string | ReactNode;
  showIcon?: boolean;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function ContextualTooltip({
  children,
  type,
  content,
  showIcon = true,
  className,
  side = 'top',
  align = 'center',
}: ContextualTooltipProps) {
  // Predefined tooltip content
  const tooltipContent = {
    gen_token: {
      title: 'GEN Token',
      description:
        'The primary token in the Avolve ecosystem. Used for governance and access to advanced features across all pillars.',
      icon: <Coins className="h-5 w-5 text-zinc-400" />,
    },
    sap_token: {
      title: 'SAP Token',
      description:
        'Superachiever Playbook token. Unlocks personal development features to create your success puzzle.',
      icon: <Award className="h-5 w-5 text-stone-400" />,
    },
    scq_token: {
      title: 'SCQ Token',
      description:
        'Supercivilization Quests token. Unlocks collaborative features to co-create your superpuzzle.',
      icon: <Award className="h-5 w-5 text-slate-400" />,
    },
    psp_token: {
      title: 'PSP Token',
      description:
        'Personal Success Puzzle token. Unlocks features for health, wealth, and peace in life.',
      icon: <Award className="h-5 w-5 text-amber-400" />,
    },
    bsp_token: {
      title: 'BSP Token',
      description:
        'Business Success Puzzle token. Unlocks features for enhancing your network and advancing your net worth.',
      icon: <Award className="h-5 w-5 text-teal-400" />,
    },
    sms_token: {
      title: 'SMS Token',
      description:
        'Supermind Superpowers token. Unlocks features to improve your ability to solve conflicts, create plans, and implement actions.',
      icon: <Award className="h-5 w-5 text-fuchsia-400" />,
    },
    spd_token: {
      title: 'SPD Token',
      description:
        'Superpuzzle Developments token. Unlocks features to progress the grand superpuzzle for wealth, health, and peace.',
      icon: <Award className="h-5 w-5 text-blue-400" />,
    },
    she_token: {
      title: 'SHE Token',
      description:
        'Superhuman Enhancements token. Unlocks features for superhuman development across all age groups.',
      icon: <Award className="h-5 w-5 text-red-400" />,
    },
    ssa_token: {
      title: 'SSA Token',
      description:
        'Supersociety Advancements token. Unlocks features for building networks at company, community, and country levels.',
      icon: <Award className="h-5 w-5 text-green-400" />,
    },
    sbg_token: {
      title: 'SBG Token',
      description:
        'Supergenius Breakthroughs token. Unlocks features for solving superpuzzles through ventures, enterprises, and industries.',
      icon: <Award className="h-5 w-5 text-indigo-400" />,
    },
    experience_phases: {
      title: 'Experience Phases',
      description:
        'Your journey through Avolve progresses through four phases: Discovery (finding value), Onboarding (learning basics), Scaffolding (regular engagement), and Endgame (mastery and leadership).',
      icon: <Layers className="h-5 w-5 text-purple-400" />,
    },
    journey_map: {
      title: 'Journey Map',
      description:
        'Visualize your progress through the Avolve experience. See completed milestones and upcoming opportunities across all pillars.',
      icon: <Layers className="h-5 w-5 text-blue-400" />,
    },
    superpuzzles: {
      title: 'Superpuzzles',
      description:
        'Collaborative challenges that bring together the community to solve important problems and advance the Supercivilization.',
      icon: <Puzzle className="h-5 w-5 text-green-400" />,
    },
    fractally: {
      title: 'Fractally Governance',
      description:
        'A consent-based governance system inspired by Fractally DAO, allowing community members to participate in decision-making.',
      icon: <Lightbulb className="h-5 w-5 text-yellow-400" />,
    },
  };

  // If direct content is provided, use that instead of predefined content
  const renderContent = () => {
    if (content) {
      return typeof content === 'string' ? (
        <div className="max-w-xs">
          <p>{content}</p>
        </div>
      ) : (
        content
      );
    }

    if (!type || !tooltipContent[type]) {
      return <div className="max-w-xs">No information available</div>;
    }

    const { title, description } = tooltipContent[type];

    return (
      <div className="max-w-xs">
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    );
  };

  // Get the icon for the tooltip
  const getIcon = () => {
    if (!showIcon) return null;

    if (type && tooltipContent[type]?.icon) {
      return tooltipContent[type].icon;
    }

    return <Info className="h-4 w-4 text-gray-500" />;
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex items-center', className)}>
            {children}
            {showIcon && <span className="ml-1 inline-flex">{getIcon()}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="bg-white dark:bg-gray-900 p-3 shadow-lg border border-zinc-200 dark:border-zinc-800 rounded-md"
        >
          {renderContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
