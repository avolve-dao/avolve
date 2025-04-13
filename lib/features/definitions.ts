/**
 * Feature Definitions
 * 
 * @module features/definitions
 * Copyright 2025 Avolve DAO and the Joshua Seymour Family. All rights reserved. Proprietary and confidential.
 */

import type { Feature } from '@/types/features';

export const featureDefinitions: Record<string, Feature> = {
  // Discovery Phase Features
  'personal_dashboard': {
    name: 'Personal Dashboard',
    description: 'Your personalized dashboard with progress tracking and recommendations',
    phase: 'discovery',
    icon: 'dashboard.svg',
    requirements: {
      tokens: [
        { tokenId: 'GEN', amount: 5 }
      ],
      milestones: [
        'discovery_1'
      ]
    }
  },
  'basic_profile': {
    name: 'Basic Profile',
    description: 'Create and customize your basic profile with personal information',
    phase: 'discovery',
    icon: 'profile.svg',
    requirements: {
      tokens: [
        { tokenId: 'GEN', amount: 10 }
      ],
      milestones: [
        'discovery_2'
      ]
    }
  },
  'token_wallet': {
    name: 'Token Wallet',
    description: 'View and manage your token balances and transaction history',
    phase: 'discovery',
    icon: 'wallet.svg',
    requirements: {
      tokens: [
        { tokenId: 'GEN', amount: 15 }
      ],
      milestones: [
        'discovery_3'
      ]
    }
  },
  
  // Onboarding Phase Features
  'superachiever_modules': {
    name: 'Superachiever Modules',
    description: 'Access to core Superachiever training modules and assessments',
    phase: 'onboarding',
    icon: 'modules.svg',
    requirements: {
      tokens: [
        { tokenId: 'GEN', amount: 25 },
        { tokenId: 'SAP', amount: 10 }
      ],
      milestones: [
        'discovery_5',
        'onboarding_1'
      ]
    }
  },
  'achievement_tracker': {
    name: 'Achievement Tracker',
    description: 'Track and visualize your progress through achievements and milestones',
    phase: 'onboarding',
    icon: 'achievements.svg',
    requirements: {
      tokens: [
        { tokenId: 'GEN', amount: 30 },
        { tokenId: 'SAP', amount: 15 }
      ],
      milestones: [
        'onboarding_2'
      ]
    }
  },
  'goal_setting': {
    name: 'Goal Setting Tools',
    description: 'Advanced tools for setting, tracking, and achieving personal and business goals',
    phase: 'onboarding',
    icon: 'goals.svg',
    requirements: {
      tokens: [
        { tokenId: 'GEN', amount: 40 },
        { tokenId: 'PSP', amount: 10 }
      ],
      milestones: [
        'onboarding_3'
      ]
    }
  },
  
  // Scaffolding Phase Features
  'community_forums': {
    name: 'Community Forums',
    description: 'Connect with other users, share experiences, and participate in discussions',
    phase: 'scaffolding',
    icon: 'community.svg',
    requirements: {
      tokens: [
        { tokenId: 'GEN', amount: 75 },
        { tokenId: 'SAP', amount: 25 },
        { tokenId: 'SSA', amount: 10 }
      ],
      milestones: [
        'onboarding_5',
        'scaffolding_1'
      ]
    }
  },
  'business_tools': {
    name: 'Business Success Tools',
    description: 'Advanced tools for business planning, strategy, and execution',
    phase: 'scaffolding',
    icon: 'business.svg',
    requirements: {
      tokens: [
        { tokenId: 'GEN', amount: 100 },
        { tokenId: 'BSP', amount: 30 }
      ],
      milestones: [
        'scaffolding_2'
      ]
    }
  },
  'mentorship': {
    name: 'Mentorship Program',
    description: 'Connect with mentors and receive personalized guidance for your journey',
    phase: 'scaffolding',
    icon: 'mentorship.svg',
    requirements: {
      tokens: [
        { tokenId: 'GEN', amount: 150 },
        { tokenId: 'SAP', amount: 50 },
        { tokenId: 'PSP', amount: 30 }
      ],
      milestones: [
        'scaffolding_3',
        'scaffolding_4'
      ]
    }
  },
  
  // Endgame Phase Features
  'advanced_analytics': {
    name: 'Advanced Analytics',
    description: 'Deep insights into your progress, patterns, and opportunities for growth',
    phase: 'endgame',
    icon: 'analytics.svg',
    requirements: {
      tokens: [
        { tokenId: 'GEN', amount: 250 },
        { tokenId: 'SAP', amount: 75 },
        { tokenId: 'SCQ', amount: 40 }
      ],
      milestones: [
        'scaffolding_5',
        'endgame_1'
      ]
    }
  },
  'content_creation': {
    name: 'Content Creation Tools',
    description: 'Create and share your own content, courses, and resources with the community',
    phase: 'endgame',
    icon: 'content.svg',
    requirements: {
      tokens: [
        { tokenId: 'GEN', amount: 300 },
        { tokenId: 'SPD', amount: 50 },
        { tokenId: 'SHE', amount: 30 }
      ],
      milestones: [
        'endgame_2'
      ]
    }
  },
  'governance': {
    name: 'Governance Participation',
    description: 'Participate in platform governance, voting, and decision-making processes',
    phase: 'endgame',
    icon: 'governance.svg',
    requirements: {
      tokens: [
        { tokenId: 'GEN', amount: 500 },
        { tokenId: 'SGB', amount: 100 }
      ],
      milestones: [
        'endgame_3',
        'endgame_4',
        'endgame_5'
      ]
    }
  }
};
