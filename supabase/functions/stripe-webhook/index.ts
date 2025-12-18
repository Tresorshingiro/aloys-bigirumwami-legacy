// Stripe Webhook Handler (Optional - for production)
// This handles payment confirmations from Stripe's servers
// Deploy this after basic integration is working

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature || !webhookSecret) {
      throw new Error('Missing signature or webhook secret')
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log(`Received event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId

        if (orderId) {
          // Update order status
          const { error } = await supabase
            .from('orders')
            .update({
              status: 'processing',
              payment_status: 'succeeded',
              payment_intent_id: paymentIntent.id,
            })
            .eq('id', orderId)

          if (error) {
            console.error('Error updating order:', error)
          } else {
            console.log(`Order ${orderId} marked as paid`)
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId

        if (orderId) {
          // Update order with failed payment
          const { error } = await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              payment_intent_id: paymentIntent.id,
            })
            .eq('id', orderId)

          if (error) {
            console.error('Error updating order:', error)
          } else {
            console.log(`Payment failed for order ${orderId}`)
          }
        }
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId

        if (orderId) {
          // Update order with canceled payment
          const { error } = await supabase
            .from('orders')
            .update({
              status: 'cancelled',
              payment_status: 'canceled',
              payment_intent_id: paymentIntent.id,
            })
            .eq('id', orderId)

          if (error) {
            console.error('Error updating order:', error)
          } else {
            console.log(`Payment canceled for order ${orderId}`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
