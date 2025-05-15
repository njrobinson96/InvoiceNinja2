import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer 
} from '@react-pdf/renderer';
import { formatCurrency, formatDate } from '@/lib/utils';

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

interface InvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  businessInfo: {
    marginBottom: 20,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 10,
    color: '#666',
  },
  businessContact: {
    fontSize: 10,
    color: '#666',
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  invoiceInfo: {
    fontSize: 10,
    color: '#333',
    textAlign: 'right',
  },
  clientSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#666',
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  clientAddress: {
    fontSize: 10,
    color: '#333',
  },
  datesSection: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateContainer: {
    width: '30%',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  dateValue: {
    fontSize: 12,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#eee',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderColor: '#eee',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 5,
    backgroundColor: '#f9fafb',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderColor: '#eee',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  tableCell: {
    fontSize: 10,
    color: '#374151',
  },
  amountSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '40%',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  amountLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  amountValue: {
    fontSize: 10,
    color: '#374151',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  notesSection: {
    marginTop: 40,
  },
  notesText: {
    fontSize: 10,
    color: '#6b7280',
  },
  footerSection: {
    marginTop: 50,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  client: Client;
  user: User;
  invoiceItems: InvoiceItem[];
}

// Create Document Component
const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, client, user, invoiceItems }) => {
  // Calculate subtotal
  const subtotal = invoiceItems.reduce((acc, item) => acc + item.amount, 0);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{user.businessName || user.username}</Text>
            <Text style={styles.businessAddress}>{user.address}</Text>
            <Text style={styles.businessContact}>{user.email} | {user.phone}</Text>
            {user.taxNumber && (
              <Text style={styles.businessContact}>Tax Number: {user.taxNumber}</Text>
            )}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceInfo}>Invoice #{invoice.invoiceNumber}</Text>
            <Text style={styles.invoiceInfo}>
              Status: {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Text>
          </View>
        </View>
        
        {/* Client Section */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>BILL TO</Text>
          <Text style={styles.clientName}>{client.name}</Text>
          {client.company && (
            <Text style={styles.clientAddress}>{client.company}</Text>
          )}
          {client.address && (
            <Text style={styles.clientAddress}>{client.address}</Text>
          )}
          <Text style={styles.clientAddress}>{client.email}</Text>
          {client.phone && (
            <Text style={styles.clientAddress}>{client.phone}</Text>
          )}
        </View>
        
        {/* Dates Section */}
        <View style={styles.datesSection}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>ISSUE DATE</Text>
            <Text style={styles.dateValue}>{formatDate(invoice.issueDate)}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>DUE DATE</Text>
            <Text style={styles.dateValue}>{formatDate(invoice.dueDate)}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>AMOUNT DUE</Text>
            <Text style={styles.dateValue}>{formatCurrency(invoice.totalAmount)}</Text>
          </View>
        </View>
        
        {/* Table Section */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Description</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Quantity</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Unit Price</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Amount</Text>
            </View>
          </View>
          
          {/* Table Rows */}
          {invoiceItems.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.description}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatCurrency(item.unitPrice)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatCurrency(item.amount)}</Text>
              </View>
            </View>
          ))}
        </View>
        
        {/* Amount Section */}
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Subtotal</Text>
            <Text style={styles.amountValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.totalAmount)}</Text>
          </View>
        </View>
        
        {/* Notes Section */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>NOTES</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}
        
        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Thank you for your business! Payment is due by {formatDate(invoice.dueDate)}.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;