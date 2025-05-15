import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { ChevronLeft, Printer, Send, Edit, CheckCircle, FileText } from "lucide-react";
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
import { Loader2 } from "lucide-react";

export default function InvoiceDetailPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const params = useParams();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const invoiceId = params.id;

  // Fetch invoice data
  const { data: invoice, isLoading: isInvoiceLoading, error: invoiceError } = useQuery({
    queryKey: [`/api/invoices/${invoiceId}`],
    enabled: !!invoiceId,
  });

  // Fetch client data
  const { data: client, isLoading: isClientLoading, error: clientError } = useQuery({
    queryKey: ['/api/clients', invoice?.clientId],
    enabled: !!invoice?.clientId,
  });

  // Fetch invoice items
  const { data: invoiceItems, isLoading: isItemsLoading, error: itemsError } = useQuery({
    queryKey: [`/api/invoices/${invoiceId}/items`],
    enabled: !!invoiceId,
  });

  const isLoading = isInvoiceLoading || isClientLoading || isItemsLoading;
  const error = invoiceError || clientError || itemsError;

  const handleBack = () => {
    setLocation("/invoices");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          
          <main className="flex-1 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex items-center mb-6">
                  <Button variant="ghost" onClick={handleBack}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <Skeleton className="h-8 w-40" />
                  <div className="flex space-x-3">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-7 w-36 mb-2" />
                    <Skeleton className="h-5 w-64" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <Skeleton className="h-5 w-20 mb-2" />
                        <Skeleton className="h-4 w-40 mb-1" />
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                      <div>
                        <Skeleton className="h-5 w-20 mb-2" />
                        <Skeleton className="h-4 w-40 mb-1" />
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                    <Separator className="my-6" />
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="text-left pb-3">
                            <Skeleton className="h-4 w-20" />
                          </th>
                          <th className="text-right pb-3">
                            <Skeleton className="h-4 w-16 ml-auto" />
                          </th>
                          <th className="text-right pb-3">
                            <Skeleton className="h-4 w-16 ml-auto" />
                          </th>
                          <th className="text-right pb-3">
                            <Skeleton className="h-4 w-16 ml-auto" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2].map((i) => (
                          <tr key={i}>
                            <td className="py-2">
                              <Skeleton className="h-4 w-full max-w-xs" />
                            </td>
                            <td className="py-2 text-right">
                              <Skeleton className="h-4 w-10 ml-auto" />
                            </td>
                            <td className="py-2 text-right">
                              <Skeleton className="h-4 w-16 ml-auto" />
                            </td>
                            <td className="py-2 text-right">
                              <Skeleton className="h-4 w-16 ml-auto" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-6 flex justify-end">
                      <div className="w-full md:w-1/3">
                        <div className="flex justify-between mb-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex justify-between font-bold">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
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

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          
          <main className="flex-1 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex items-center mb-6">
                  <Button variant="ghost" onClick={handleBack}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-red-500 mb-4">Error loading invoice: {error instanceof Error ? error.message : "Unknown error"}</p>
                      <Button variant="outline" onClick={() => window.location.reload()}>
                        Try Again
                      </Button>
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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={handleBack}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Invoices
                </Button>
              </div>
              
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
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Invoice Details</CardTitle>
                    <StatusBadge status={invoice.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-500 mb-2">From</h3>
                      <p className="font-semibold">{user?.businessName || user?.username}</p>
                      <p>{user?.email}</p>
                      {user?.address && <p>{user.address}</p>}
                      {user?.phone && <p>{user.phone}</p>}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-500 mb-2">Bill To</h3>
                      <p className="font-semibold">{client.name}</p>
                      <p>{client.email}</p>
                      {client.company && <p>{client.company}</p>}
                      {client.address && <p>{client.address}</p>}
                      {client.phone && <p>{client.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-500 mb-2">Invoice Number</h3>
                      <p>{invoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-500 mb-2">Issue Date</h3>
                      <p>{formatDate(invoice.issueDate)}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-500 mb-2">Due Date</h3>
                      <p>{formatDate(invoice.dueDate)}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left pb-3 font-semibold text-gray-500">Description</th>
                        <th className="text-right pb-3 font-semibold text-gray-500">Quantity</th>
                        <th className="text-right pb-3 font-semibold text-gray-500">Unit Price</th>
                        <th className="text-right pb-3 font-semibold text-gray-500">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems && invoiceItems.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3">{item.description}</td>
                          <td className="py-3 text-right">{item.quantity}</td>
                          <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-3 text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-6 flex justify-end">
                    <div className="w-full md:w-1/3">
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-semibold">Total</span>
                        <span>{formatCurrency(invoice.totalAmount)}</span>
                      </div>
                      {invoice.status !== 'paid' && (
                        <div className="flex justify-between py-3 font-bold">
                          <span>Amount Due</span>
                          <span>{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                      )}
                      {invoice.status === 'paid' && (
                        <div className="flex justify-between py-3 font-bold text-green-600">
                          <span>Paid</span>
                          <span>{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {invoice.notes && (
                    <div className="mt-8 p-4 bg-gray-50 rounded-md">
                      <h3 className="font-semibold text-sm text-gray-500 mb-2">Notes</h3>
                      <p className="text-gray-700">{invoice.notes}</p>
                    </div>
                  )}
                  
                  {invoice.status === 'overdue' && (
                    <div className="mt-8">
                      <div className="p-4 bg-red-50 rounded-md mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">This invoice is overdue</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>Payment for this invoice is past the due date. Send a reminder to the client.</p>
                            </div>
                            <div className="mt-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/invoices/${invoiceId}/remind`, {
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
    </div>
  );
}