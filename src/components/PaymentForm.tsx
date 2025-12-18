import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  totalAmount: number;
  onSuccess: () => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ 
  totalAmount, 
  onSuccess,
  isProcessing,
  setIsProcessing 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-6">
        <PaymentElement />
      </div>

      <Button
        type="submit"
        variant="burgundy"
        size="lg"
        className="w-full"
        disabled={!stripe || isProcessing}
      >
        <Lock className="mr-2 h-5 w-5" />
        {isProcessing ? 'Processing...' : `Pay ${totalAmount.toLocaleString()} RWF`}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
};
