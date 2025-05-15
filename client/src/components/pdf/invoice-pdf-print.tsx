import React, { useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InvoicePDF from './invoice-pdf';

// Using type definitions directly to avoid import issues
interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  totalAmount: string | number;
  issueDate: string | Date;
  dueDate: string | Date;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue";
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  lastSentDate?: string | Date;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  userId: number;
  notes?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  businessName?: string;
  address?: string;
  phone?: string;
  taxNumber?: string;
  plan?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface InvoicePDFPrintProps {
  invoice: Invoice;
  client: Client;
  user: User;
  invoiceItems: any[];
  isOpen: boolean;
  onClose: () => void;
}

const InvoicePDFPrint: React.FC<InvoicePDFPrintProps> = ({
  invoice,
  client,
  user,
  invoiceItems,
  isOpen,
  onClose,
}) => {
  // Auto-print when the PDF is loaded in the dialog
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isOpen) {
      // Short delay to ensure PDF is rendered
      timeoutId = setTimeout(() => {
        window.print();
      }, 1000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Print Invoice #{invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            The print dialog should open automatically. If it doesn't, please use your browser's print function.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full h-full border rounded-md overflow-hidden mt-4">
          <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
            <InvoicePDF
              invoice={invoice}
              client={client}
              user={user}
              invoiceItems={invoiceItems}
            />
          </PDFViewer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePDFPrint;