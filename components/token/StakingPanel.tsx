import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { useUser } from '@/lib/hooks/use-user'

interface StakingRule {
  id: string
  token_type_id: string
  min_stake_amount: number
  lock_period_days: number
  apy_percentage: number
  voting_weight_multiplier: number
  focus_areas: string[]
  bonus_features: {
    features: string[]
    personal_boost?: number
    collective_boost?: number
    ecosystem_boost?: number
  }
}

interface TokenBalance {
  token_type_id: string
  balance: number
  staked_amount: number
}

export function StakingPanel() {
  const [stakingRules, setStakingRules] = useState<StakingRule[]>([])
  const [selectedRule, setSelectedRule] = useState<StakingRule | null>(null)
  const [amount, setAmount] = useState('')
  const [userProfile, setUserProfile] = useState<{ focus: string, zinc_gradient: number } | null>(null)
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [isStaking, setIsStaking] = useState(false)
  
  const supabase = createClientComponentClient()
  const { user } = useUser()

  useEffect(() => {
    if (!user?.id) return

    const fetchStakingData = async () => {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('focus, zinc_gradient')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
      }

      // Fetch staking rules
      const { data: rules } = await supabase
        .from('token_staking_rules')
        .select('*')
        .eq('active', true)
        .order('min_stake_amount')

      if (rules) {
        setStakingRules(rules)
      }

      // Fetch token balances
      const { data: balances } = await supabase
        .from('token_balances')
        .select('*')
        .eq('user_id', user.id)

      if (balances) {
        setBalances(balances)
      }
    }

    fetchStakingData()
  }, [user?.id])

  const handleStake = async () => {
    if (!selectedRule || !user?.id || !amount) return

    try {
      setIsStaking(true)

      const stakeAmount = parseFloat(amount)
      if (isNaN(stakeAmount)) throw new Error('Invalid amount')

      const balance = balances.find(b => b.token_type_id === selectedRule.token_type_id)
      if (!balance || balance.balance < stakeAmount) {
        throw new Error('Insufficient balance')
      }

      // Call the stake function
      const { error } = await supabase.rpc('stake_tokens', {
        p_token_type_id: selectedRule.token_type_id,
        p_amount: stakeAmount,
        p_staking_rule_id: selectedRule.id
      })

      if (error) throw error

      toast.success('Tokens staked successfully')

      // Refresh balances
      const { data: newBalances } = await supabase
        .from('token_balances')
        .select('*')
        .eq('user_id', user.id)

      if (newBalances) {
        setBalances(newBalances)
      }

      setAmount('')
      setSelectedRule(null)
    } catch (error) {
      console.error('Staking error:', error)
      toast.error('Failed to stake tokens')
    } finally {
      setIsStaking(false)
    }
  }

  const getEffectiveAPY = (rule: StakingRule) => {
    if (!userProfile) return rule.apy_percentage

    const boostKey = `${userProfile.focus}_boost` as keyof typeof rule.bonus_features;
    const boost = (rule.bonus_features[boostKey] ?? 1) as number;
    const zincBonus = userProfile.zinc_gradient * 0.001 // 0.1% per gradient point
    
    return rule.apy_percentage * boost * (1 + zincBonus)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stakingRules.map(rule => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card
              className={`p-4 cursor-pointer ${
                selectedRule?.id === rule.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedRule(rule)}
            >
              <h3 className="text-lg font-semibold mb-2">
                {rule.token_type_id.toUpperCase()} Staking
              </h3>
              
              <div className="space-y-2 text-sm">
                <p>Min Stake: {rule.min_stake_amount.toLocaleString()} tokens</p>
                <p>Lock Period: {rule.lock_period_days} days</p>
                <p>Base APY: {rule.apy_percentage}%</p>
                <p>Effective APY: {getEffectiveAPY(rule).toFixed(2)}%</p>
                <p>Voting Weight: {rule.voting_weight_multiplier}x</p>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-1">Features:</h4>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {rule.bonus_features.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedRule && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Stake {selectedRule.token_type_id.toUpperCase()}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount to Stake
                </label>
                <Input
                  type="number"
                  min={selectedRule.min_stake_amount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min ${selectedRule.min_stake_amount}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Lock Period: {selectedRule.lock_period_days} days
                </label>
                <Progress value={100} className="h-2" />
              </div>

              <Button
                onClick={handleStake}
                disabled={isStaking || !amount || parseFloat(amount) < selectedRule.min_stake_amount}
                className="w-full"
              >
                {isStaking ? 'Staking...' : 'Stake Tokens'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Progress({ value, className }: { value: number, className?: string }) {
  return (
    <div className={`bg-gray-200 rounded-full ${className}`}>
      <div
        className="bg-primary rounded-full transition-all"
        style={{ width: `${value}%`, height: '100%' }}
      />
    </div>
  )
}
