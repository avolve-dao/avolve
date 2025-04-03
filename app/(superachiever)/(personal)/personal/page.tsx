import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PersonalPage() {
  return (
    <div className="container py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Personal Development</CardTitle>
          <CardDescription>Track and enhance your personal growth journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <p>
              Welcome to your personal development dashboard. Here you can track your goals, habits, and achievements in
              your personal life.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Set and track your personal goals</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Habits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Build and maintain positive habits</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

