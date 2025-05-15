import { ValueTiers } from "@/components/monetization/value-tiers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
  return (
    <div className="container py-12 space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Value Creation Investment</h1>
        <p className="text-xl text-muted-foreground">
          Choose the tier that aligns with your commitment to creating value in the Supercivilization
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <ValueTiers />
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Common questions about our value creation tiers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">What's the difference between Regen and Degen tiers?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Regen tiers are designed for self-leaders committed to value creation and positive-sum thinking. Degen
                tiers are entry-level options for those still transitioning from extractive thinking.
              </p>
            </div>

            <div>
              <h3 className="font-medium">How do GEN tokens work?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                GEN tokens are the currency of value creation in the Supercivilization. They can be used to access
                premium features, participate in value creation challenges, and unlock advanced Genie AI capabilities.
              </p>
            </div>

            <div>
              <h3 className="font-medium">What is the Value Creation Guarantee?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We're so confident in the value of our platform that if you don't create at least 10x the value of your
                subscription within 90 days, we'll refund your investment and give you 100 GEN tokens as an apology.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Can I upgrade my tier later?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Yes, you can upgrade your tier at any time. Your unused subscription value will be prorated toward your
                new tier, and you'll immediately receive the additional GEN token bonus.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Is this platform for everyone?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No. This platform is specifically designed for self-leaders and value creators committed to positive-sum
                thinking. If you're still trapped in zero-sum, extractive thinking, you'll need to transform or find
                another platform.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
