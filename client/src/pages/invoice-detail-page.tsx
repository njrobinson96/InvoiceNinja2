import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { ChevronLeft, Printer, Send, Edit, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileMenu from "@/components/layout/mobile-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import InvoicePDFDownload from "../components/pdf/invoice-pdf-download";
import InvoicePDFPrint from "../components/pdf/invoice-pdf-print";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceDetailPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const params = useParams();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const invoiceId = params.id;

  // Fetch invoice data
  const { data: invoice, isLoading: isInvoiceLoading, error: invoiceError } = useQuery({
    queryKey: [`/api/invoices/${invoiceId}`],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/${invoiceId}`);
      const data = await res.json();
      return data;
    },
    enabled: !!invoiceId,
  });

  // Fetch client data if invoice is loaded
  const { data: client, isLoading: isClientLoading } = useQuery({
    queryKey: [`/api/clients/${invoice?.clientId}`],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${invoice.clientId}`);
      const data = await res.json();
      return data;
    },
    enabled: !!invoice?.clientId,
  });

  // Fetch invoice items
  const { data: invoiceItems, isLoading: isItemsLoading } = useQuery({
    queryKey: [`/api/invoices/${invoiceId}/items`],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/${invoiceId}/items`);
      const data = await res.json();
      return data;
    },
    enabled: !!invoiceId,
  });

  // Combined loading state
  const isLoading = isInvoiceLoading || isClientLoading || isItemsLoading;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header openMobileMenu={() => setIsMobileMenuOpen(true)} />
          <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center mb-8">
                <Link href="/invoices">
                  <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Invoices
                  </Button>
                </Link>
              </div>
              <div className="grid gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-8 w-64" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                          <Skeleton className="h-6 w-48 mb-1" />
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Invoice Details</h3>
                          <Skeleton className="h-4 w-36 mb-1" />
                          <Skeleton className="h-4 w-28 mb-1" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Items</h3>
                        <div className="space-y-2">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (invoiceError) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header openMobileMenu={() => setIsMobileMenuOpen(true)} />
          <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-5xl mx-auto text-center pt-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Invoice</h2>
              <p className="text-gray-600 mb-6">We couldn't load the invoice details.</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header openMobileMenu={() => setIsMobileMenuOpen(true)} />
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center mb-8">
              <Link href="/invoices">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Invoices
                </Button>
              </Link>
            </div>
            <div className="grid gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                      Invoice #{invoice.invoiceNumber}
                    </h1>
                    <div className="flex space-x-3">
                      {user && invoice && client && invoiceItems && (
                        <>
                          <InvoicePDFDownload
                            invoice={invoice}
                            client={client}
                            user={user}
                            invoiceItems={invoiceItems}
                            buttonText="Download PDF"
                            className="no-underline"
                          />
                          <Button 
                            variant="outline"
                            onClick={() => setPrintDialogOpen(true)}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/invoices/${invoiceId}/send`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' }
                            });
                            
                            if (!res.ok) {
                              throw new Error('Failed to send invoice');
                            }
                            
                            const data = await res.json();
                            alert(`Invoice sent successfully to ${data.email}`);
                            window.location.reload();
                          } catch (error) {
                            console.error('Error sending invoice:', error);
                            alert('Failed to send invoice. Please try again.');
                          }
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Invoice
                      </Button>
                      <Link href={`/invoices/${invoiceId}/edit`}>
                        <Button>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                      <div className="text-lg font-medium mb-1">{client.name}</div>
                      <div className="text-gray-600">
                        {client.email}<br />
                        {client.phone && <>{client.phone}<br /></>}
                        {client.company && <>{client.company}<br /></>}
                        {client.address && <>{client.address}</>}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Invoice Status</h3>
                        <StatusBadge status={invoice.status} />
                      </div>
                      <div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Date Issued</h3>
                            <div>{formatDate(invoice.issueDate)}</div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                            <div>{formatDate(invoice.dueDate)}</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h3>
                        <div className="text-xl font-bold">{formatCurrency(invoice.totalAmount)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Invoice Items</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-left font-medium text-gray-500">Description</th>
                            <th className="py-2 px-4 text-right font-medium text-gray-500">Quantity</th>
                            <th className="py-2 px-4 text-right font-medium text-gray-500">Price</th>
                            <th className="py-2 px-4 text-right font-medium text-gray-500">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceItems && invoiceItems.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="py-3 px-4">{item.description}</td>
                              <td className="py-3 px-4 text-right">{item.quantity}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(item.amount)}</td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={2}></td>
                            <td className="py-3 px-4 text-right font-medium">Total</td>
                            <td className="py-3 px-4 text-right font-bold">{formatCurrency(invoice.totalAmount)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {invoice.notes && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-2">Notes</h3>
                      <p className="text-gray-600 whitespace-pre-line">{invoice.notes}</p>
                    </div>
                  )}
                  
                  {invoice.status === 'overdue' && (
                    <div className="border rounded-lg p-6 mb-8 bg-amber-50">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <FileText className="h-6 w-6 text-amber-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-amber-800">Payment Overdue</h3>
                          <p className="mt-2 text-amber-700">
                            This invoice is past its due date. Send a reminder to the client.
                          </p>
                          <div className="mt-4">
                            <Button 
                              variant="outline" 
                              className="border-amber-300 text-amber-700 hover:bg-amber-100"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/invoices/${invoiceId}/send-reminder`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' }
                                  });
                                  
                                  if (!res.ok) {
                                    throw new Error('Failed to send reminder');
                                  }
                                  
                                  const data = await res.json();
                                  alert(`Payment reminder sent to ${data.email}`);
                                } catch (error) {
                                  console.error('Error sending reminder:', error);
                                  alert('Failed to send reminder. Please try again.');
                                }
                              }}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send Reminder
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {invoice.status !== 'paid' && (
                    <div className="mt-8 flex justify-center">
                      <Link href={`/invoices/${invoiceId}/pay`}>
                        <Button size="lg">
                          Pay Now {formatCurrency(invoice.totalAmount)}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      {/* Print Dialog */}
      {printDialogOpen && user && invoice && client && invoiceItems && (
        <InvoicePDFPrint
          invoice={invoice}
          client={client}
          user={user}
          invoiceItems={invoiceItems}
          isOpen={printDialogOpen}
          onClose={() => setPrintDialogOpen(false)}
        />
      )}
    </div>
  );
}