import React from 'react'
import { render, screen } from '@testing-library/react'
import { TokenBalanceCard } from '@/components/tokens/TokenBalanceCard'
import { describe, it, expect } from 'vitest'

describe('TokenBalanceCard Component', () => {
  const mockToken = {
    token_symbol: 'GEN',
    token_name: 'Genesis Token',
    balance: 1000,
    staked_balance: 250,
    icon_url: '/images/tokens/gen.png',
    gradient_class: 'bg-gradient-to-r from-blue-500 to-purple-500'
  }

  it('renders loading skeleton when isLoading is true', () => {
    const { container } = render(<TokenBalanceCard token={mockToken} isLoading={true} />)
    
    // Check for skeleton elements - they don't have data-testid, so we need to query by class
    const skeletons = container.querySelectorAll('.h-6, .h-4, .h-12, .h-8')
    expect(skeletons.length).toBeGreaterThan(0)
    
    // Token data should not be visible
    expect(screen.queryByText(mockToken.token_name)).not.toBeInTheDocument()
    expect(screen.queryByText(mockToken.token_symbol)).not.toBeInTheDocument()
  })

  it('renders token information correctly', () => {
    render(<TokenBalanceCard token={mockToken} />)
    
    // Check token name and symbol are displayed
    expect(screen.getByText(mockToken.token_name)).toBeInTheDocument()
    // Use getAllByText since the symbol appears multiple times
    expect(screen.getAllByText(mockToken.token_symbol).length).toBeGreaterThan(0)
    
    // Check balance is displayed and formatted
    expect(screen.getByText('1,000')).toBeInTheDocument()
    
    // Check staked balance is displayed
    expect(screen.getByText('250 staked')).toBeInTheDocument()
  })

  it('renders token without staked balance correctly', () => {
    const tokenWithoutStaked = {
      ...mockToken,
      staked_balance: 0
    }
    
    render(<TokenBalanceCard token={tokenWithoutStaked} />)
    
    // Check token data is displayed
    expect(screen.getByText(tokenWithoutStaked.token_name)).toBeInTheDocument()
    
    // Staked balance should not be shown
    expect(screen.queryByText(/staked/)).not.toBeInTheDocument()
  })

  it('renders token without icon correctly', () => {
    const tokenWithoutIcon = {
      ...mockToken,
      icon_url: null
    }
    
    render(<TokenBalanceCard token={tokenWithoutIcon} />)
    
    // Check token data is displayed
    expect(screen.getByText(tokenWithoutIcon.token_name)).toBeInTheDocument()
    
    // Icon should not be present
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('uses default gradient when gradient_class is not provided', () => {
    const tokenWithoutGradient = {
      ...mockToken,
      gradient_class: null
    }
    
    const { container } = render(<TokenBalanceCard token={tokenWithoutGradient} />)
    
    // Check for default gradient class
    const gradientElement = container.querySelector('.bg-gradient-to-r.from-primary.to-secondary')
    expect(gradientElement).toBeInTheDocument()
  })
})
