import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useUser } from '@/lib/hooks/use-user'

interface TokenBalance {
  token_type_id: string
  balance: number
  staked_amount: number
}

interface TokenType {
  id: string
  name: string
  description: string
  category: 'primary' | 'personal' | 'collective'
  frequency: string
}

const frequencyGradients: Record<string, string> = {
  '174hz': 'from-amber-200 to-amber-400',
  '285hz': 'from-orange-200 to-orange-400',
  '396hz': 'from-rose-200 to-rose-400',
  '417hz': 'from-emerald-200 to-emerald-400',
  '528hz': 'from-teal-200 to-teal-400',
  '639hz': 'from-cyan-200 to-cyan-400',
  '741hz': 'from-blue-200 to-blue-400',
  '852hz': 'from-indigo-200 to-indigo-400',
  '963hz': 'from-violet-200 to-violet-400',
}

export function TokenBalances() {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [tokenTypes, setTokenTypes] = useState<TokenType[]>([])
  const supabase = createClientComponentClient()
  const { user } = useUser()

  useEffect(() => {
    if (!user?.id) return

    const fetchTokenData = async () => {
      // Fetch token types
      const { data: types } = await supabase
        .from('token_types')
        .select('*')
        .order('category')

      if (types) {
        setTokenTypes(types)
      }

      // Fetch user's token balances
      const { data: balances } = await supabase
        .from('token_balances')
        .select('*')
        .eq('user_id', user.id)

      if (balances) {
        setBalances(balances)
      }
    }

    fetchTokenData()
  }, [user?.id])

  const getTokenBalance = (tokenId: string): TokenBalance => {
    return balances.find(b => b.token_type_id === tokenId) || {
      token_type_id: tokenId,
      balance: 0,
      staked_amount: 0
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tokenTypes.map(token => {
        const balance = getTokenBalance(token.id)
        const total = balance.balance + balance.staked_amount
        const stakedPercentage = total > 0 ? (balance.staked_amount / total) * 100 : 0

        return (
          <motion.div
            key={token.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4 relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-r ${frequencyGradients[token.frequency]} opacity-10`} />
              
              <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-1">{token.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{token.description}</p>
                
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Available</span>
                  <span className="font-medium">{balance.balance.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Staked</span>
                  <span className="font-medium">{balance.staked_amount.toLocaleString()}</span>
                </div>

                <Progress
                  value={stakedPercentage}
                  className="h-2 mb-2"
                />
                
                <div className="text-xs text-gray-500 text-right">
                  {stakedPercentage.toFixed(1)}% Staked
                </div>

                <div className="mt-2 text-xs text-gray-400">
                  Frequency: {token.frequency}
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
