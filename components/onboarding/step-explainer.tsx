"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface StepExplainerProps {
  step: 1 | 2 | 3 | 4 | 5
}

export function StepExplainer({ step }: StepExplainerProps) {
  const stepContent = {
    1: {
      title: "Commit to the Supercivilization",
      description: "Understand and commit to the principles of value creation",
      details: [
        {
          question: "What is the Supercivilization?",
          answer:
            "The Supercivilization is a system based on value creation and production, where Regens (self-leaders and integrated thinkers) create positive-sum value that benefits themselves, others, society, and the environment.",
        },
        {
          question: "What is the difference between Degen and Regen?",
          answer:
            "Degens are trapped in follower mentality and zero-sum thinking, enabling the Anticivilization. Regens are self-leaders and integrated thinkers who create value in the Supercivilization.",
        },
        {
          question: "Why does this commitment matter?",
          answer:
            "This commitment is the foundation of your transformation. It aligns you with the principles of value creation and sets the stage for your journey from Degen to Regen.",
        },
      ],
    },
    2: {
      title: "Create Your Genius ID",
      description: "Establish your unique identity as a value creator",
      details: [
        {
          question: "What is a Genius ID?",
          answer:
            "Your Genius ID is your unique identity in the Supercivilization. It defines who you are as a value creator and how you contribute to the positive-sum system.",
        },
        {
          question: "Why is a unique identity important?",
          answer:
            "Your unique identity helps you stand out in the Supercivilization and focus your value creation efforts where they'll have the greatest impact.",
        },
        {
          question: "What happens after I create my Genius ID?",
          answer:
            "After creating your Genius ID, you'll earn your first GEN tokens and be ready to continue your transformation journey.",
        },
      ],
    },
    3: {
      title: "Unlock GEN Tokens",
      description: "Gain the currency of value creation",
      details: [
        {
          question: "What are GEN tokens?",
          answer:
            "GEN tokens are the currency of value creation in the Supercivilization. They represent your capacity to create value for yourself and others.",
        },
        {
          question: "How do I earn GEN tokens?",
          answer:
            "You earn GEN tokens by creating value, completing challenges, and contributing to the Supercivilization.",
        },
        {
          question: "What can I do with GEN tokens?",
          answer:
            "GEN tokens fuel your transformation journey. You can use them to access Genie AI, unlock new capabilities, and participate in the Supercivilization economy.",
        },
      ],
    },
    4: {
      title: "Access Genie AI",
      description: "Get personalized guidance on your transformation journey",
      details: [
        {
          question: "What is Genie AI?",
          answer:
            "Genie AI is your personal guide on your journey from Degen to Regen. It provides personalized guidance, answers questions, and helps you overcome obstacles.",
        },
        {
          question: "How does Genie AI help my transformation?",
          answer:
            "Genie AI accelerates your transformation by providing insights tailored to your unique journey, helping you apply Regen thinking to your specific situation.",
        },
        {
          question: "How do I use Genie AI?",
          answer:
            "Simply ask Genie AI questions about your transformation journey, value creation strategies, or how to apply Supercivilization principles in your life.",
        },
      ],
    },
    5: {
      title: "Welcome to the Supercivilization",
      description: "You've unlocked all the tools to create value",
      details: [
        {
          question: "What happens now?",
          answer:
            "Now you can fully participate in the Supercivilization. Continue creating value, earning GEN tokens, and using Genie AI to guide your ongoing transformation.",
        },
        {
          question: "How do I continue my transformation?",
          answer:
            "Your transformation is ongoing. Continue applying Regen thinking to your daily decisions, creating value in ways that benefit yourself and others.",
        },
        {
          question: "How can I contribute to the Supercivilization?",
          answer:
            "Contribute by creating value, sharing your insights with others, and helping build the positive-sum system of the Supercivilization.",
        },
      ],
    },
  }

  const currentStep = stepContent[step]

  return (
    <div className="bg-muted/50 rounded-lg p-6 border">
      <h3 className="text-lg font-medium mb-4">Learn More About This Step</h3>
      <Accordion type="single" collapsible className="w-full">
        {currentStep.details.map((detail, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{detail.question}</AccordionTrigger>
            <AccordionContent>{detail.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
