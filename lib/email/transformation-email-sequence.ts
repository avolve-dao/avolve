/**
 * Transformation Email Sequence
 * Guides users through their Degen to Regen journey
 */

export const transformationEmailSequence = [
  {
    id: "welcome",
    subject: "Welcome to Your Transformation Journey",
    timing: "Immediately after signup",
    content: `
# Welcome to Your Transformation Journey

You've taken the first step toward joining the Supercivilization. 

## What Happens Next

1. **Complete the Supercivilization Agreement** - Understand and commit to the principles of value creation
2. **Create Your Genius ID** - Establish your unique identity as a value creator
3. **Earn GEN Tokens** - Gain the currency of the Supercivilization
4. **Access Genie AI** - Get personalized guidance on your journey

Your transformation from Degen to Regen begins now.

[Begin Your Transformation]({{dashboardUrl}})
    `,
  },
  {
    id: "genius-id-reminder",
    subject: "Create Your Genius ID - Establish Your Value Creator Identity",
    timing: "2 days after signup if Genius ID not created",
    content: `
# Establish Your Identity as a Value Creator

Your Genius ID is waiting to be created.

## Why This Matters

Your Genius ID defines who you are in the Supercivilization. It's your unique identity as a value creator and sets the foundation for your transformation from Degen to Regen.

## Benefits of Creating Your Genius ID

- Establish your unique identity in the Supercivilization
- Earn your first GEN tokens
- Begin tracking your transformation progress

[Create Your Genius ID Now]({{geniusIdUrl}})
    `,
  },
  {
    id: "gen-tokens-intro",
    subject: "Understanding GEN Tokens - The Currency of Value Creation",
    timing: "1 day after Genius ID creation",
    content: `
# GEN Tokens: The Currency of Value Creation

Congratulations on creating your Genius ID! Now it's time to understand GEN tokens.

## What Are GEN Tokens?

GEN tokens are the currency of value creation in the Supercivilization. They represent your capacity to create value for yourself and others.

## How to Earn More GEN Tokens

- Complete challenges
- Create value for yourself and others
- Contribute to the Supercivilization

[Learn More About GEN Tokens]({{genTokensUrl}})
    `,
  },
  {
    id: "genie-ai-intro",
    subject: "Meet Genie AI - Your Guide to the Supercivilization",
    timing: "2 days after earning first GEN tokens",
    content: `
# Meet Genie AI: Your Transformation Guide

Your journey from Degen to Regen is unique, and sometimes you need guidance.

## How Genie AI Helps You

- Provides personalized guidance on your transformation journey
- Answers questions about the Supercivilization
- Helps you overcome obstacles in your value creation journey

## Getting Started with Genie AI

Ask Genie AI about:
- Value creation strategies
- Overcoming zero-sum thinking
- Applying Regen principles in your life

[Chat with Genie AI Now]({{genieAiUrl}})
    `,
  },
  {
    id: "transformation-progress",
    subject: "Your Transformation Progress - From Degen to Regen",
    timing: "1 week after completing all onboarding steps",
    content: `
# Your Transformation Journey: Week 1

You've made incredible progress on your journey from Degen to Regen.

## Your Achievements So Far

- Created your Genius ID
- Earned your first GEN tokens
- Accessed Genie AI

## Next Steps in Your Transformation

- Apply Regen thinking to your daily decisions
- Create value in ways that benefit yourself and others
- Connect with other value creators in the Supercivilization

[View Your Transformation Dashboard]({{dashboardUrl}})
    `,
  },
]
