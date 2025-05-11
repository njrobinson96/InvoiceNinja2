import { useState } from "react";
import { useLocation } from "wouter";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const cardStyle = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

interface CheckoutFormProps {
  invoiceId: string | null;
}

export default function CheckoutForm({ invoiceId }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Mutation for updating invoice status to paid
  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async (id: string | null) => {
      if (!id) throw new Error("Invoice ID is required");
      const res = await apiRequest("PATCH", `/api/invoices/${id}/status`, { status: "paid" });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      toast({
        title: "Payment successful",
        description: "Thank you for your payment. The invoice has been marked as paid.",
      });
      
      navigate("/invoices");
    },
    onError: (error: any) => {
      toast({
        title: "Status update failed",
        description: "Payment was processed but invoice status couldn't be updated.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Wait to render
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError("Card element not found");
      setProcessing(false);
      return;
    }

    // Get the client secret from the stripe context
    const clientSecret = document.querySelector('meta[name="stripe-client-secret"]')?.getAttribute('content') || "";
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      setError(error.message || "Payment failed");
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Payment succeeded, update invoice status
      updateInvoiceStatusMutation.mutate(invoiceId);
    } else {
      setError("Payment processing error. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md bg-white">
        <CardElement options={cardStyle} />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <Button 
        type="submit" 
        disabled={!stripe || processing}
        className="w-full"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
      
      <div className="text-xs text-gray-500 text-center mt-4">
        <p>Your payment is secured by Stripe. We don't store your card details.</p>
      </div>
    </form>
  );
}