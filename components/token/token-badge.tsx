"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToken } from '@/lib/token/use-token'
import { useTokenRBAC } from '@/lib/token/use-token-rbac'

interface TokenBadgeProps {
  tokenCode: string
  tokenName: string
  tokenSymbol: string
  className?: string
  showBalance?: boolean
  showTooltip?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/**
 * TokenBadge component displays a visual representation of a token
 * with optional balance and tooltip information.
 */
export function TokenBadge({
  tokenCode,
  tokenName,
  tokenSymbol,
  className,
  showBalance = false,
  showTooltip = true,
  size = 'md'
}: TokenBadgeProps) {
  const { getUserTokenBalance, loading } = useToken()
  const [balance, setBalance] = React.useState<number | null>(null)
  const { hasTokenPermission } = useTokenRBAC()
  const [hasAccess, setHasAccess] = React.useState(false)

  // Get gradient class based on token code
  const getGradientClass = (code: string) => {
    switch (code) {
      case 'GEN': return 'from-zinc-500 to-zinc-700'
      case 'SAP': return 'from-stone-500 to-stone-700'
      case 'PSP': return 'from-amber-500 to-yellow-500'
      case 'BSP': return 'from-teal-500 to-cyan-500'
      case 'SMS': return 'from-violet-500 via-purple-500 to-fuchsia-500'
      case 'SCQ': return 'from-slate-500 to-slate-700'
      case 'SPD': return 'from-red-500 via-green-500 to-blue-500'
      case 'SHE': return 'from-rose-500 via-red-500 to-orange-500'
      case 'SSA': return 'from-lime-500 via-green-500 to-emerald-500'
      case 'SGB': return 'from-sky-500 via-blue-500 to-indigo-500'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  // Get size classes
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return 'text-xs px-1.5 py-0.5'
      case 'lg': return 'text-base px-3 py-1'
      default: return 'text-sm px-2 py-0.5'
    }
  }

  // Fetch token balance and access status
  React.useEffect(() => {
    const fetchTokenData = async () => {
      try {
        // Fetch user's token balance
        if (showBalance) {
          const result = await getUserTokenBalance(tokenCode)
          if (result.data !== null) {
            setBalance(result.data)
          }
        }
        
        // Check if user has access via this token
        const access = await hasTokenPermission(tokenCode.toLowerCase(), 'access')
        setHasAccess(access)
      } catch (error) {
        console.error('Error fetching token data:', error)
      }
    }
    
    fetchTokenData()
  }, [tokenCode, showBalance, getUserTokenBalance, hasTokenPermission])

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border-2 bg-gradient-to-r',
        getGradientClass(tokenCode),
        getSizeClasses(size),
        hasAccess ? 'opacity-100' : 'opacity-40',
        className
      )}
    >
      {tokenSymbol}
      {showBalance && balance !== null && (
        <span className="ml-1 font-normal">{balance}</span>
      )}
    </Badge>
  )

  if (!showTooltip) {
    return badgeContent
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{tokenName}</p>
            <p className="text-xs text-muted-foreground">
              {hasAccess 
                ? 'You have access to features requiring this token' 
                : 'You need this token to access certain features'}
            </p>
            {showBalance && (
              <p className="text-xs">
                Balance: <span className="font-medium">{balance ?? 'Loading...'}</span>
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
