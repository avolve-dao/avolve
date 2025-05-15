import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface TransformationJourneyEmailProps {
  username: string
  step: "welcome" | "genius-id" | "gen-tokens" | "genie-ai" | "complete"
  dashboardUrl: string
  actionUrl: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://avolve.com"

export default function TransformationJourneyEmail({
  username = "Regen",
  step = "welcome",
  dashboardUrl = "https://avolve.com/dashboard",
  actionUrl = "https://avolve.com/onboarding",
}: TransformationJourneyEmailProps) {
  const stepContent = {
    welcome: {
      subject: "Welcome to Your Transformation Journey",
      previewText: "Your journey from Degen to Regen begins now",
      heading: "Welcome to Your Transformation Journey",
      mainText:
        "You've taken the first step toward joining the Supercivilization. Complete these steps to transform from Degen to Regen and create more value in your life and work.",
      steps: [
        "Complete the Supercivilization Agreement - Understand and commit to the principles of value creation",
        "Create Your Genius ID - Establish your unique identity as a value creator",
        "Earn GEN Tokens - Gain the currency of the Supercivilization",
        "Access Genie AI - Get personalized guidance on your journey",
      ],
      actionText: "Begin Your Transformation",
    },
    "genius-id": {
      subject: "Create Your Genius ID - Establish Your Value Creator Identity",
      previewText: "Define your unique identity in the Supercivilization",
      heading: "Establish Your Identity as a Value Creator",
      mainText:
        "Your Genius ID defines who you are in the Supercivilization. It's your unique identity as a value creator and sets the foundation for your transformation from Degen to Regen.",
      benefits: [
        "Establish your unique identity in the Supercivilization",
        "Earn your first GEN tokens",
        "Begin tracking your transformation progress",
      ],
      actionText: "Create Your Genius ID",
    },
    "gen-tokens": {
      subject: "Understanding GEN Tokens - The Currency of Value Creation",
      previewText: "Learn about the currency of the Supercivilization",
      heading: "GEN Tokens: The Currency of Value Creation",
      mainText:
        "GEN tokens are the currency of value creation in the Supercivilization. They represent your capacity to create value for yourself and others.",
      howTo: ["Complete challenges", "Create value for yourself and others", "Contribute to the Supercivilization"],
      actionText: "Earn GEN Tokens",
    },
    "genie-ai": {
      subject: "Meet Genie AI - Your Guide to the Supercivilization",
      previewText: "Get personalized guidance on your transformation journey",
      heading: "Meet Genie AI: Your Transformation Guide",
      mainText:
        "Your journey from Degen to Regen is unique, and sometimes you need guidance. Genie AI provides personalized assistance to help you navigate challenges and accelerate your transformation.",
      questions: [
        "Value creation strategies",
        "Overcoming zero-sum thinking",
        "Applying Regen principles in your life",
      ],
      actionText: "Chat with Genie AI",
    },
    complete: {
      subject: "Your Transformation Progress - From Degen to Regen",
      previewText: "Congratulations on your transformation journey",
      heading: "Your Transformation Journey",
      mainText:
        "Congratulations on completing all the initial steps in your transformation journey! You now have access to all the tools and resources you need to create more value in your life and work.",
      nextSteps: [
        "Apply Regen thinking to your daily decisions",
        "Create value in ways that benefit yourself and others",
        "Connect with other value creators in the Supercivilization",
      ],
      actionText: "View Your Dashboard",
    },
  }

  const content = stepContent[step]

  return (
    <Html>
      <Head />
      <Preview>{content.previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto p-4 max-w-600">
            <Section className="bg-white p-8 rounded-lg shadow-sm">
              <Heading className="text-2xl font-bold text-center text-gray-800">{content.heading}</Heading>
              <Text className="text-gray-600">Hello {username},</Text>
              <Text className="text-gray-600">{content.mainText}</Text>

              {step === "welcome" && (
                <Section className="my-4">
                  <Text className="font-medium text-gray-700">What Happens Next:</Text>
                  <ul>
                    {content.steps.map((step, index) => (
                      <Text key={index} className="text-gray-600 ml-4">
                        • {step}
                      </Text>
                    ))}
                  </ul>
                </Section>
              )}

              {step === "genius-id" && (
                <Section className="my-4">
                  <Text className="font-medium text-gray-700">Benefits of Creating Your Genius ID:</Text>
                  <ul>
                    {content.benefits.map((benefit, index) => (
                      <Text key={index} className="text-gray-600 ml-4">
                        • {benefit}
                      </Text>
                    ))}
                  </ul>
                </Section>
              )}

              {step === "gen-tokens" && (
                <Section className="my-4">
                  <Text className="font-medium text-gray-700">How to Earn More GEN Tokens:</Text>
                  <ul>
                    {content.howTo.map((item, index) => (
                      <Text key={index} className="text-gray-600 ml-4">
                        • {item}
                      </Text>
                    ))}
                  </ul>
                </Section>
              )}

              {step === "genie-ai" && (
                <Section className="my-4">
                  <Text className="font-medium text-gray-700">Ask Genie AI About:</Text>
                  <ul>
                    {content.questions.map((question, index) => (
                      <Text key={index} className="text-gray-600 ml-4">
                        • {question}
                      </Text>
                    ))}
                  </ul>
                </Section>
              )}

              {step === "complete" && (
                <Section className="my-4">
                  <Text className="font-medium text-gray-700">Next Steps in Your Transformation:</Text>
                  <ul>
                    {content.nextSteps.map((nextStep, index) => (
                      <Text key={index} className="text-gray-600 ml-4">
                        • {nextStep}
                      </Text>
                    ))}
                  </ul>
                </Section>
              )}

              <Section className="text-center mt-8">
                <Button className="bg-gray-800 text-white px-6 py-3 rounded-md font-medium" href={actionUrl}>
                  {content.actionText}
                </Button>
              </Section>

              <Hr className="my-6 border-gray-200" />

              <Text className="text-sm text-gray-500 text-center">
                © {new Date().getFullYear()} Avolve. All rights reserved.
              </Text>
              <Text className="text-xs text-gray-400 text-center">
                If you didn't create an account with us, you can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
