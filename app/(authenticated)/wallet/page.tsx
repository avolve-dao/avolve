import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { CardContainer } from "@/components/card-container"
import { LoadingSpinner } from "@/components/loading-spinner"
import { GenTokenDisplay } from "@/components/gen-token-display"
import { TokenTransactionHistory } from "@/components/token-transaction-history"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ROUTES } from "@/constants"

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        description="Manage your tokens and transactions"
        actions={
          <Link href={ROUTES.UNLOCK.GEN_TOKEN}>
            <Button>Earn More Tokens</Button>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <CardContainer title="Gen Token Balance">
          <Suspense fallback={<LoadingSpinner />}>
            <GenTokenDisplay />
          </Suspense>
        </CardContainer>

        <CardContainer title="Token Information">
          <div className="space-y-4">
            <p>
              Gen Tokens are the primary currency in the Avolve ecosystem. You can earn tokens by completing challenges
              and contributing to the community.
            </p>
            <Link href={ROUTES.UNLOCK.GEN_TOKEN}>
              <Button variant="outline">Learn More</Button>
            </Link>
          </div>
        </CardContainer>
      </div>

      <CardContainer title="Transaction History">
        <Suspense fallback={<LoadingSpinner />}>
          <TokenTransactionHistory />
        </Suspense>
      </CardContainer>
    </div>
  )
}
