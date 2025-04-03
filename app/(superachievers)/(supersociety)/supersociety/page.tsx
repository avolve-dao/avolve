import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupersocietyPage() {
  return (
    <div className="container py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Supersociety</CardTitle>
          <CardDescription>Advanced social structures and collaboration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <p>
              Welcome to the Supersociety platform. Here you can participate in and help build advanced social
              structures and collaborative systems.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Join and contribute to specialized communities</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Governance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Participate in collaborative decision-making</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

