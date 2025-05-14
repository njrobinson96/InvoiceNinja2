import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '../ui/button';
import { DownloadIcon } from 'lucide-react';
import InvoicePDF from './invoice-pdf';
import { Client, Invoice, User } from '../../../shared/schema';

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