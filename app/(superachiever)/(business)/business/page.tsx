import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function BusinessPage() {
  return (
    <div className="container py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Business Growth</CardTitle>
          <CardDescription>Manage and scale your business ventures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <p>
              Welcome to your business dashboard. Here you can track your business metrics, projects, and growth
              opportunities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Track key business performance indicators</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Manage your business projects and initiatives</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

