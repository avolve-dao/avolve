import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface StepCompletionEmailProps {
  name: string
  stepNumber: number
  stepTitle: string
}

export default function StepCompletionEmail({
  name = "there",
  stepNumber = 1,
  stepTitle = "Completing Your Step",
}: StepCompletionEmailProps) {
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    : "https://avolve.com/dashboard"

  const stepDescriptions = {
    1: "You've committed to the principles of value creation and taken the first step on your journey from Degen to Regen.",
    2: "You've established your unique identity as a value creator in the Supercivilization.",
    3: "You've gained the currency of value creation to fuel your transformation journey.",
    4: "You now have personalized guidance to accelerate your transformation from Degen to Regen.",
  }

  const nextStepTitles = {
    1: "Create Your Genius ID",
    2: "Unlock GEN Tokens",
    3: "Access Genie AI",
    4: "Continue Your Transformation",
  }

  const nextStepUrls = {
    1: "/unlock/genius-id",
    2: "/unlock/gen-token",
    3: "/unlock/genie-ai",
    4: "/dashboard",
  }

  const nextStepNumber = stepNumber < 4 ? stepNumber + 1 : 4
  const nextStepTitle = nextStepTitles[nextStepNumber as keyof typeof nextStepTitles]
  const nextStepUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://avolve.com"}${
    nextStepUrls[nextStepNumber as keyof typeof nextStepUrls]
  }`

  return (
    <Html>
      <Head />
      <Preview>Congratulations on completing {stepTitle}!</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto p-4 max-w-600">
            <Section className="bg-white p-8 rounded-lg shadow-sm">
              <Heading className="text-2xl font-bold text-center text-gray-800">Congratulations, {name}!</Heading>
              <Text className="text-gray-600 text-center">
                You've completed <strong>{stepTitle}</strong>
              </Text>

              <Section className="my-6 p-4 bg-green-50 rounded-lg">
                <Text className="text-gray-700">{stepDescriptions[stepNumber as keyof typeof stepDescriptions]}</Text>
              </Section>

              {stepNumber < 4 && (
                <Section className="my-6">
                  <Text className="font-medium text-gray-700">Your Next Step:</Text>
                  <Text className="text-gray-600">
                    Continue your transformation journey by completing the next step: <strong>{nextStepTitle}</strong>
                  </Text>
                  <Section className="text-center mt-4">
                    <Button className="bg-gray-800 text-white px-6 py-3 rounded-md font-medium" href={nextStepUrl}>
                      Continue to {nextStepTitle}
                    </Button>
                  </Section>
                </Section>
              )}

              {stepNumber === 4 && (
                <Section className="my-6">
                  <Text className="font-medium text-gray-700">Congratulations on Your Transformation!</Text>
                  <Text className="text-gray-600">
                    You've completed all the initial steps in your journey from Degen to Regen. Continue creating value
                    in the Supercivilization!
                  </Text>
                  <Section className="text-center mt-4">
                    <Button className="bg-gray-800 text-white px-6 py-3 rounded-md font-medium" href={dashboardUrl}>
                      View Your Dashboard
                    </Button>
                  </Section>
                </Section>
              )}

              <Hr className="my-6 border-gray-200" />

              <Text className="text-sm text-gray-500 text-center">
                © {new Date().getFullYear()} Avolve. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
