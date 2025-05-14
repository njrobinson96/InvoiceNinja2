import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Invoice, Client, User, InvoiceItem } from '../../../shared/schema';
import { formatDate, formatCurrency } from '../../lib/utils';

// Define styles for PDF document
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  headerLeft: {
    maxWidth: '60%',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  value: {
    fontSize: 12,
    marginBottom: 5,
  },
  client: {
    marginBottom: 30,
  },
  clientTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    minHeight: 30,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  totalsTable: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  footerText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  notes: {
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 10,
    color: '#666',
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  client: Client;
  user: User;
  invoiceItems: any[];
}

const InvoicePDF = ({ invoice, client, user, invoiceItems }: InvoicePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with business and invoice details */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.companyName}>{user.businessName || user.username}</Text>
          <Text style={styles.value}>{user.email}</Text>
          {user.phone && <Text style={styles.value}>{user.phone}</Text>}
          {user.address && <Text style={styles.value}>{user.address}</Text>}
          {user.taxNumber && <Text style={styles.value}>Tax Number: {user.taxNumber}</Text>}
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.value}>#{invoice.invoiceNumber}</Text>
          <Text style={styles.label}>Issue Date:</Text>
          <Text style={styles.value}>{formatDate(invoice.issueDate)}</Text>
          <Text style={styles.label}>Due Date:</Text>
          <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{invoice.status.toUpperCase()}</Text>
        </View>
      </View>
      
      {/* Client Information */}
      <View style={styles.client}>
        <Text style={styles.clientTitle}>Bill To:</Text>
        <Text style={styles.value}>{client.name}</Text>
        <Text style={styles.value}>{client.email}</Text>
        {client.company && <Text style={styles.value}>{client.company}</Text>}
        {client.address && <Text style={styles.value}>{client.address}</Text>}
        {client.phone && <Text style={styles.value}>{client.phone}</Text>}
      </View>
      
      {/* Invoice Items */}
      <View style={styles.table}>
        {/* Table header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { width: '40%' }]}>Description</Text>
          <Text style={[styles.tableCell, { width: '20%' }]}>Quantity</Text>
          <Text style={[styles.tableCell, { width: '20%' }]}>Unit Price</Text>
          <Text style={[styles.tableCell, { width: '20%' }]}>Amount</Text>
        </View>
        
        {/* Table rows */}
        {invoiceItems.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '40%' }]}>{item.description}</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>{formatCurrency(parseFloat(item.unitPrice))}</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>{formatCurrency(parseFloat(item.amount))}</Text>
          </View>
        ))}
      </View>
      
      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalsTable}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(parseFloat(invoice.totalAmount))}</Text>
          </View>
        </View>
      </View>
      
      {/* Notes Section */}
      {invoice.notes && (
        <View style={styles.notes}>
          <Text style={styles.noteTitle}>Notes:</Text>
          <Text style={styles.noteText}>{invoice.notes}</Text>
        </View>
      )}
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for your business!
        </Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;