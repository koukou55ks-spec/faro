import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status: string
  plan: 'free' | 'pro'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubscription() {
      // Check for mock subscription in localStorage (開発用)
      const mockPlan = localStorage.getItem('mockSubscriptionPlan')

      if (!user) {
        // Guest user - free plan
        setSubscription({
          id: 'guest',
          user_id: 'guest',
          stripe_customer_id: null,
          stripe_subscription_id: null,
          stripe_price_id: null,
          status: 'active',
          plan: 'free',
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        setLoading(false)
        return
      }

      // If mock plan is set (development mode)
      if (mockPlan === 'pro' && process.env.NODE_ENV === 'development') {
        setSubscription({
          id: 'mock-' + user.id,
          user_id: user.id,
          stripe_customer_id: 'mock_customer',
          stripe_subscription_id: 'mock_subscription',
          stripe_price_id: 'mock_price',
          status: 'active',
          plan: 'pro',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/subscription/status')
        if (!response.ok) {
          throw new Error('Failed to fetch subscription')
        }

        const data = await response.json()
        setSubscription(data.subscription)
      } catch (err) {
        console.error('[useSubscription] Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Fallback to free plan on error
        setSubscription({
          id: user.id,
          user_id: user.id,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          stripe_price_id: null,
          status: 'active',
          plan: 'free',
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'
  const isFree = subscription?.plan === 'free' || !isPro

  return {
    subscription,
    loading,
    error,
    isPro,
    isFree,
    refetch: () => {
      setLoading(true)
      // Trigger re-fetch by updating a dependency
    },
  }
}
