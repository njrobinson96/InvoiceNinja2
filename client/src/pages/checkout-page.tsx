import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { apiRequest } from "@/lib/queryClient";
import CheckoutForm from "../components/payment/checkout-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Load Stripe outside of component to avoid recreating on each render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing Stripe public key. Please set VITE_STRIPE_PUBLIC_KEY in your environment.");
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const params = useParams();
  const invoiceId = params.id;
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  interface Invoice {
    id: number;
    invoiceNumber: string;
    clientId: number;
    clientName?: string;
    totalAmount: string | number;
    issueDate: string;
    dueDate: string;
    status: "draft" | "sent" | "viewed" | "paid" | "overdue";
    notes?: string;
    items?: any[];
  }

  const { data: invoice, isLoading } = useQuery<Invoice>({
    queryKey: [`/api/invoices/${invoiceId}`],
    enabled: !!invoiceId,
  });

  useEffect(() => {
    if (invoiceId) {
      // Create PaymentIntent as soon as the page loads
      apiRequest("POST", "/api/create-payment-intent", { invoiceId })
        .then((res) => {
          if (!res.ok) {
            return res.json().then(data => {
              throw new Error(data.message || "Error creating payment intent");
            });
          }
          return res.json();
        })
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [invoiceId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4">Invoice Not Found</h2>
        <p className="text-gray-500 mb-4">The requested invoice could not be found.</p>
        <Button onClick={() => navigate("/invoices")}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="flex items-center text-gray-600"
            onClick={() => navigate(`/invoices/${invoiceId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to invoice
          </Button>
        </div>

        <div className="flex items-center justify-center mb-8">
          <FileText className="h-8 w-8 mr-2 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">InvoiceFlow</h1>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold">Invoice Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice Number:</span>
                <span className="font-medium">{invoice?.invoiceNumber || "N/A"}</span>
              </div>
              {invoice?.clientName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Client:</span>
                  <span className="font-medium">{invoice.clientName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Due:</span>
                <span className="font-medium">{formatCurrency(invoice?.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date:</span>
                <span className="font-medium">
                  {invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold">Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-6">
                <p className="text-red-500 mb-4">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/invoices/${invoiceId}`)}
                >
                  Back to Invoice
                </Button>
              </div>
            ) : !clientSecret ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <meta name="stripe-client-secret" content={clientSecret} />
                <CheckoutForm invoiceId={invoiceId || null} />
              </Elements>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}