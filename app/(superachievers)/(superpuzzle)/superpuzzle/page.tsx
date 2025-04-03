import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuperpuzzlePage() {
  return (
    <div className="container py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Superpuzzle</CardTitle>
          <CardDescription>Collaborative problem-solving platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <p>
              Welcome to the Superpuzzle platform. Here you can collaborate with others to solve complex puzzles and
              challenges.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Active Puzzles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Join ongoing puzzle-solving efforts</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Create Challenge</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Submit a new puzzle for the community</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

