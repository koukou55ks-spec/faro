import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
}) : null

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables not configured')
  }

  return createClient(url, key)
}

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('[Stripe Webhook] Error verifying signature:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('[Stripe Webhook] Event type:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id

        if (!userId) {
          console.error('[Stripe Webhook] No user_id in metadata')
          break
        }

        // Retrieve subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Update subscription in database
        const supabase = getSupabaseClient()
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          status: subscription.status,
          plan: 'pro',
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })

        console.log('[Stripe Webhook] Subscription created for user:', userId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const supabase2 = getSupabaseClient()
        const { data: existingSubscription } = await supabase2
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!existingSubscription) {
          console.error('[Stripe Webhook] Subscription not found for customer:', customerId)
          break
        }

        // Update subscription status
        await supabase2
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('user_id', existingSubscription.user_id)

        console.log('[Stripe Webhook] Subscription updated for user:', existingSubscription.user_id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const supabase3 = getSupabaseClient()
        const { data: existingSubscription } = await supabase3
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!existingSubscription) {
          console.error('[Stripe Webhook] Subscription not found for customer:', customerId)
          break
        }

        // Update to free plan
        await supabase3
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan: 'free',
            stripe_subscription_id: null,
            stripe_price_id: null,
          })
          .eq('user_id', existingSubscription.user_id)

        console.log('[Stripe Webhook] Subscription canceled for user:', existingSubscription.user_id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find user by customer ID
        const supabase4 = getSupabaseClient()
        const { data: existingSubscription } = await supabase4
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!existingSubscription) {
          console.error('[Stripe Webhook] Subscription not found for customer:', customerId)
          break
        }

        // Update status to past_due
        await supabase4
          .from('subscriptions')
          .update({
            status: 'past_due',
          })
          .eq('user_id', existingSubscription.user_id)

        console.log('[Stripe Webhook] Payment failed for user:', existingSubscription.user_id)
        break
      }

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error processing event:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
