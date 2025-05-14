import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '../ui/button';
import { DownloadIcon } from 'lucide-react';
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

interface InvoicePDFDownloadProps {
  invoice: Invoice;
  client: Client;
  user: User;
  invoiceItems: any[];
  buttonText?: string;
  className?: string;
}

const InvoicePDFDownload: React.FC<InvoicePDFDownloadProps> = ({
  invoice,
  client,
  user,
  invoiceItems,
  buttonText = 'Download PDF',
  className = '',
}) => {
  return (
    <PDFDownloadLink
      document={
        <InvoicePDF
          invoice={invoice}
          client={client}
          user={user}
          invoiceItems={invoiceItems}
        />
      }
      fileName={`invoice-${invoice.invoiceNumber}.pdf`}
      className={className}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          <DownloadIcon className="h-4 w-4 mr-2" />
          {loading ? 'Generating PDF...' : buttonText}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default InvoicePDFDownload;