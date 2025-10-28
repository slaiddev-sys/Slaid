import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../AuthProvider'
import { supabase } from '../../lib/supabase'

interface CreditBalance {
  total_credits: number
  used_credits: number
  remaining_credits: number
  plan_type: string
  last_renewal_date: string
}

interface UseCreditsReturn {
  credits: CreditBalance | null
  loading: boolean
  error: string | null
  refreshCredits: () => Promise<void>
  deductCredits: (amount: number, anthropicCost?: number, presentationId?: string, workspace?: string, description?: string) => Promise<boolean>
  addCredits: (amount: number, description?: string) => Promise<boolean>
  hasEnoughCredits: (amount: number) => boolean
}

export function useCredits(): UseCreditsReturn {
  const { user } = useAuth()
  const [credits, setCredits] = useState<CreditBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshCredits = useCallback(async () => {
    if (!user) {
      setCredits(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No valid session found')
      }

      const response = await fetch('/api/credits/balance', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        console.error('❌ Credit API failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: response.url
        })
        
        // If database functions don't exist yet, use fallback credits
        if (errorData.error?.includes('get_user_credits') || errorData.error?.includes('function') || response.status === 500 || response.status === 401) {
          console.warn('⚠️ Credit system not fully configured, using fallback credits. Status:', response.status, 'Error:', errorData.error)
          setCredits({
            total_credits: 10,
            used_credits: 0,
            remaining_credits: 10,
            plan_type: 'free',
            last_renewal_date: new Date().toISOString()
          })
          return
        }
        
        throw new Error(errorData.error || 'Failed to fetch credits')
      }

      const data = await response.json()
      console.log('✅ Credit API success:', {
        status: response.status,
        data,
        credits: data.credits
      })
      
      setCredits(data.credits)

      if (data.initialized) {
        console.log('✅ Credits initialized for new user')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch credits'
      setError(errorMessage)
      console.error('❌ Error fetching credits:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const deductCredits = useCallback(async (
    amount: number, 
    anthropicCost?: number, 
    presentationId?: string, 
    workspace?: string, 
    description?: string
  ): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No valid session found')
      }

      const response = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creditsToDeduct: amount,
          anthropicCostCents: anthropicCost,
          presentationId,
          workspace,
          description
        })
      })

      const data = await response.json()

      if (response.status === 402) {
        // Insufficient credits
        setError('Insufficient credits')
        return false
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deduct credits')
      }

      if (data.success) {
        // Update local state with new balance
        if (credits) {
          setCredits({
            ...credits,
            remaining_credits: data.remainingCredits,
            total_credits: data.totalCredits,
            used_credits: data.usedCredits
          })
        }
        return true
      }

      return false

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deduct credits'
      setError(errorMessage)
      console.error('❌ Error deducting credits:', err)
      return false
    }
  }, [user, credits])

  const addCredits = useCallback(async (amount: number, description?: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No valid session found')
      }

      const response = await fetch('/api/credits/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creditsToAdd: amount,
          description
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to add credits')
      }

      const data = await response.json()

      if (data.success) {
        // Update local state with new balance
        if (credits) {
          setCredits({
            ...credits,
            remaining_credits: data.remainingCredits,
            total_credits: data.totalCredits,
            used_credits: data.usedCredits
          })
        }
        return true
      }

      return false

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add credits'
      setError(errorMessage)
      console.error('❌ Error adding credits:', err)
      return false
    }
  }, [user, credits])

  const hasEnoughCredits = useCallback((amount: number): boolean => {
    return credits ? credits.remaining_credits >= amount : false
  }, [credits])

  // Load credits when user changes
  useEffect(() => {
    refreshCredits()
  }, [refreshCredits])

  return {
    credits,
    loading,
    error,
    refreshCredits,
    deductCredits,
    addCredits,
    hasEnoughCredits
  }
}
