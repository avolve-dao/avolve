import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupergeniusPage() {
  return (
    <div className="container py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Supergenius</CardTitle>
          <CardDescription>Collaborative innovation and breakthrough thinking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <p>
              Welcome to the Supergenius platform. Here you can collaborate on breakthrough innovations and advanced
              thinking.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Innovation Labs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Participate in collaborative innovation projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Think Tank</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Contribute to advanced thinking and research</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

