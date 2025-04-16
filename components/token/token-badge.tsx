"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTokens } from '@/hooks/use-tokens'
import { useTokenRBAC } from '@/lib/token/use-token-rbac'

/**
 * @interface TokenBadgeProps
 * @description Props for the TokenBadge component
 * @property {string} tokenCode - The unique code for the token (e.g., GEN, SAP, PSP)
 * @property {string} tokenName - The full name of the token (e.g., Genesis, Superachiever)
 * @property {string} tokenSymbol - The display symbol for the token
 * @property {string} [className] - Optional additional CSS classes
 * @property {boolean} [showBalance=false] - Whether to display the user's balance of this token
 * @property {boolean} [showTooltip=true] - Whether to show a tooltip with additional information
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Size variant for the badge
 * 
 * @example
 * <TokenBadge
 *   tokenCode="GEN"
 *   tokenName="Genesis"
 *   tokenSymbol="GEN"
 *   showBalance={true}
 * />
 */
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
 * @component TokenBadge
 * @description Displays a visual representation of a token with optional balance and tooltip information.
 * This component implements sacred geometry principles through its gradient styling and proportions.
 * 
 * The component follows Tesla's 3-6-9 pattern by categorizing tokens into three main families:
 * - Family 3: Creation tokens (GEN, SAP, SCQ)
 * - Family 6: Harmony tokens (PSP, BSP, SMS)
 * - Family 9: Completion tokens (SPD, SHE, SSA, SGB)
 * 
 * Each token has a unique gradient that corresponds to its position in the sacred geometry system.
 * 
 * @param {TokenBadgeProps} props - Component props
 * @returns {React.ReactElement} The rendered TokenBadge component
 * 
 * @example
 * // Basic usage
 * <TokenBadge tokenCode="GEN" tokenName="Genesis" tokenSymbol="GEN" />
 * 
 * // With balance display
 * <TokenBadge tokenCode="SAP" tokenName="Superachiever" tokenSymbol="SAP" showBalance={true} />
 * 
 * // Large size without tooltip
 * <TokenBadge 
 *   tokenCode="PSP" 
 *   tokenName="Personal Success Puzzle" 
 *   tokenSymbol="PSP" 
 *   size="lg"
 *   showTooltip={false}
 * />
 * 
 * @see {@link useTokens} For token balance retrieval
 * @see {@link useTokenRBAC} For token permission checking
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
  const { getUserTokenBalance, isLoading } = useTokens()
  const [balance, setBalance] = React.useState<number | null>(null)
  const { hasTokenPermission } = useTokenRBAC()
  const [hasAccess, setHasAccess] = React.useState(false)

  /**
   * @function getGradientClass
   * @description Returns the appropriate gradient CSS class based on the token code.
   * Each token has a unique gradient that corresponds to its position in the sacred geometry system.
   * 
   * @param {string} code - The token code (e.g., GEN, SAP, PSP)
   * @returns {string} The CSS class for the gradient
   * 
   * @example
   * const gradientClass = getGradientClass('GEN'); // Returns 'from-zinc-500 to-zinc-700'
   */
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

  /**
   * @function getSizeClasses
   * @description Returns the appropriate size CSS classes based on the size parameter.
   * The sizes follow the golden ratio (1.618) for padding and font size relationships.
   * 
   * @param {string} size - The size variant ('sm', 'md', or 'lg')
   * @returns {string} The CSS classes for the specified size
   * 
   * @example
   * const sizeClasses = getSizeClasses('lg'); // Returns 'text-base px-3 py-1'
   */
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return 'text-xs px-1.5 py-0.5'
      case 'lg': return 'text-base px-3 py-1'
      default: return 'text-sm px-2 py-0.5'
    }
  }

  /**
   * @function fetchTokenData
   * @description Fetches the user's token balance and checks if they have access via this token.
   * This is called on component mount and when tokenCode or showBalance changes.
   * 
   * @async
   * @returns {Promise<void>}
   */
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

  // Create the badge with appropriate styling
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

  // Return badge without tooltip if showTooltip is false
  if (!showTooltip) {
    return badgeContent
  }

  // Return badge with tooltip
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
