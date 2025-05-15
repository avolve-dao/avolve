import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"
import type { UserGoal } from "@/hooks/use-user-preferences"

interface OnboardingWelcomeEmailProps {
  name: string
  primaryGoal?: UserGoal
}

export default function OnboardingWelcomeEmail({ name = "there", primaryGoal }: OnboardingWelcomeEmailProps) {
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    : "https://avolve.com/dashboard"

  const goalMessages = {
    "personal-growth": "focus on personal growth and development",
    "professional-advancement": "advance your professional career",
    "community-building": "build and contribute to communities",
    "value-creation": "create more value in all areas of your life",
  }

  const goalMessage = primaryGoal
    ? goalMessages[primaryGoal as keyof typeof goalMessages]
    : "transform from Degen to Regen"

  return (
    <Html>
      <Head />
      <Preview>Welcome to Your Transformation Journey</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto p-4 max-w-600">
            <Section className="bg-white p-8 rounded-lg shadow-sm">
              <Heading className="text-2xl font-bold text-center text-gray-800">
                Welcome to Your Transformation Journey
              </Heading>
              <Text className="text-gray-600">Hello {name},</Text>
              <Text className="text-gray-600">
                You've taken the first step toward joining the Supercivilization. We're excited to help you{" "}
                {goalMessage}.
              </Text>

              <Section className="my-4">
                <Text className="font-medium text-gray-700">What Happens Next:</Text>
                <Text className="text-gray-600 ml-4">
                  • <strong>Complete the Supercivilization Agreement</strong> - Understand and commit to the principles
                  of value creation
                </Text>
                <Text className="text-gray-600 ml-4">
                  • <strong>Create Your Genius ID</strong> - Establish your unique identity as a value creator
                </Text>
                <Text className="text-gray-600 ml-4">
                  • <strong>Earn GEN Tokens</strong> - Gain the currency of the Supercivilization
                </Text>
                <Text className="text-gray-600 ml-4">
                  • <strong>Access Genie AI</strong> - Get personalized guidance on your journey
                </Text>
              </Section>

              <Text className="text-gray-600">
                Your transformation from Degen to Regen begins now. We're here to support you every step of the way.
              </Text>

              <Section className="text-center mt-8">
                <Button className="bg-gray-800 text-white px-6 py-3 rounded-md font-medium" href={dashboardUrl}>
                  Begin Your Transformation
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
