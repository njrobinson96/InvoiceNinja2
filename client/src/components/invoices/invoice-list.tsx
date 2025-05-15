import { useState } from "react";
import { Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, MoreVertical, Printer, Send, Trash, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import InvoicePDFPrint from "../pdf/invoice-pdf-print";

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  totalAmount: string | number;
  issueDate: string;
  dueDate: string;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue";
  clientName?: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
  isLoading: boolean;
  error: Error | null;
}

export default function InvoiceList({ invoices, isLoading, error }: InvoiceListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'markAsPaid' | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printData, setPrintData] = useState<{
    invoice: any;
    client: any;
    items: any[];
  } | null>(null);

  // Mutation for updating invoice status
  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/invoices/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      toast({
        title: "Invoice updated",
        description: actionType === 'markAsPaid' 
          ? "Invoice has been marked as paid." 
          : "Invoice status has been updated.",
      });
      
      setConfirmDialogOpen(false);
      setSelectedInvoice(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to mark invoice as paid
  const markAsPaid = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActionType('markAsPaid');
    setConfirmDialogOpen(true);
  };
  
  // Function to prepare invoice for printing
  const prepareInvoicePrint = async (invoice: Invoice) => {
    try {
      // Fetch invoice details including items
      const invRes = await fetch(`/api/invoices/${invoice.id}`);
      if (!invRes.ok) throw new Error('Failed to fetch invoice details');
      const invData = await invRes.json();
      
      // Fetch client details
      const clientRes = await fetch(`/api/clients/${invoice.clientId}`);
      if (!clientRes.ok) throw new Error('Failed to fetch client details');
      const clientData = await clientRes.json();
      
      setPrintData({
        invoice: invData,
        client: clientData,
        items: invData.items || []
      });
      
      setPrintDialogOpen(true);
    } catch (error) {
      console.error('Error preparing invoice for print:', error);
      toast({
        title: "Print failed",
        description: "Failed to prepare invoice for printing. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle invoice action confirmation
  const handleConfirmAction = () => {
    if (!selectedInvoice) return;
    
    if (actionType === 'markAsPaid') {
      updateInvoiceStatusMutation.mutate({ 
        id: selectedInvoice.id, 
        status: 'paid' 
      });
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500">Error loading invoices: {error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/invoices"] })}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Render empty state
  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg py-12 px-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
        <p className="text-gray-500 mb-6">Create your first invoice to get started</p>
        <Link href="/invoices/create">
          <Button>Create Invoice</Button>
        </Link>
      </div>
    );
  }

  // Render invoice list
  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href={`/invoices/${invoice.id}`}>
                          <div className="flex items-center w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={invoice.status === 'paid'}>
                        <Link href={`/invoices/${invoice.id}/pay`}>
                          <div className="flex items-center w-full">
                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="20" height="14" x="2" y="5" rx="2" />
                              <line x1="2" x2="22" y1="10" y2="10" />
                            </svg>
                            <span>Pay Invoice</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={invoice.status === 'paid'}>
                        <div 
                          className="flex items-center w-full" 
                          onClick={() => invoice.status !== 'paid' && markAsPaid(invoice)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>Mark as Paid</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={invoice.status !== 'paid'}>
                        <div 
                          className="flex items-center w-full" 
                          onClick={async () => {
                            if (invoice.status === 'paid') {
                              try {
                                const res = await fetch(`/api/invoices/${invoice.id}/receipt`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' }
                                });
                                
                                if (!res.ok) {
                                  throw new Error('Failed to send receipt');
                                }
                                
                                const data = await res.json();
                                alert(`Payment receipt sent to ${data.email}`);
                              } catch (error) {
                                console.error('Error sending receipt:', error);
                                alert('Failed to send receipt. Please try again.');
                              }
                            }
                          }}
                        >
                          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          <span>Send Receipt</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div 
                          className="flex items-center w-full"
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/invoices/${invoice.id}/send`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' }
                              });
                              
                              if (!res.ok) {
                                throw new Error('Failed to send invoice');
                              }
                              
                              const data = await res.json();
                              alert(`Invoice sent successfully to ${data.email}`);
                              queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
                            } catch (error) {
                              console.error('Error sending invoice:', error);
                              alert('Failed to send invoice. Please try again.');
                            }
                          }}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          <span>Send Invoice</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div 
                          className="flex items-center w-full"
                          onClick={() => prepareInvoicePrint(invoice)}
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          <span>Print</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'markAsPaid' ? 'Mark Invoice as Paid' : 'Confirm Action'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'markAsPaid' 
                ? `Are you sure you want to mark invoice ${selectedInvoice?.invoiceNumber} as paid?`
                : 'Are you sure you want to proceed with this action?'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              disabled={updateInvoiceStatusMutation.isPending}
            >
              {updateInvoiceStatusMutation.isPending 
                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                : null
              }
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* PDF Print Dialog */}
      {printData && user && (
        <InvoicePDFPrint
          invoice={printData.invoice}
          client={printData.client}
          user={user}
          invoiceItems={printData.items}
          isOpen={printDialogOpen}
          onClose={() => {
            setPrintDialogOpen(false);
            setPrintData(null);
          }}
        />
      )}
    </>
  );
}
