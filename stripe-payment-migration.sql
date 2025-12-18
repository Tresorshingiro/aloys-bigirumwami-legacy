-- Add payment tracking columns to orders table

-- Add payment columns
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
  CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'canceled'));

-- Create indexes for payment lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON public.orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- Add comment to explain the payment_status column
COMMENT ON COLUMN public.orders.payment_status IS 'Stripe payment status: pending, succeeded, failed, or canceled';
COMMENT ON COLUMN public.orders.payment_intent_id IS 'Stripe PaymentIntent ID for tracking';

-- Update existing orders to have payment_status
UPDATE public.orders 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;
