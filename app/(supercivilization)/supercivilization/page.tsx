import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupercivilizationPage() {
  return (
    <div className="container py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Supercivilization</CardTitle>
          <CardDescription>Building the future of human civilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <p>
              Welcome to the Supercivilization platform. Here we collaborate on long-term projects to advance human
              civilization.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Grand Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Work on solving humanity's greatest challenges</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Future Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Contribute to long-term civilization planning</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Resource Coordination</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Help coordinate global resources for maximum impact</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

