import { Metadata } from 'next'
import TokensOverview from '@/components/tokens/TokensOverview'
import TokenRewards from '@/components/tokens/TokenRewards'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Tokens | Avolve',
  description: 'Manage your Avolve tokens and rewards',
}

export default function TokensPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Avolve Tokens</h1>
          <p className="text-muted-foreground mt-2">
            Manage your tokens, view transactions, and claim rewards
          </p>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <TokensOverview />
          </TabsContent>
          
          <TabsContent value="rewards" className="mt-6">
            <TokenRewards />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
