import sgMail from '@sendgrid/mail';
import { Invoice, Client, User, InvoiceItem } from '../../shared/schema';
import path from 'path';
import fs from 'fs';

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY environment variable not set. Email functionality will not work.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Helper function to format currency
function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(numAmount);
}

// Helper function to format date
function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

/**
 * Send an invoice via email to a client
 */
export async function sendInvoiceEmail(
  invoice: Invoice,
  client: Client,
  user: User,
  invoiceItems: InvoiceItem[],
  pdfBuffer?: Buffer
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('Cannot send email: SENDGRID_API_KEY is not set');
    return false;
  }

  try {
    // Calculate totals for the email
    const total = parseFloat(invoice.totalAmount.toString());
    
    // Create the payment link - this would be your frontend URL where clients can pay
    const paymentLink = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/invoices/${invoice.id}/pay`;

    const emailOptions: EmailOptions = {
      to: client.email,
      from: user.email,
      subject: `Invoice ${invoice.invoiceNumber} from ${user.businessName || user.username}`,
      text: `
        Hello ${client.name},
        
        Please find attached your invoice (${invoice.invoiceNumber}) for ${formatCurrency(invoice.totalAmount)}.
        
        Due date: ${formatDate(invoice.dueDate)}
        
        You can pay this invoice online at: ${paymentLink}
        
        Thank you for your business!
        
        Regards,
        ${user.businessName || user.username}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Invoice ${invoice.invoiceNumber}</h2>
          <p>Hello ${client.name},</p>
          <p>Please find attached your invoice for ${formatCurrency(invoice.totalAmount)}.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Invoice Number:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Issue Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatDate(invoice.issueDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Due Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatDate(invoice.dueDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount Due:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatCurrency(invoice.totalAmount)}</td>
            </tr>
          </table>
          
          <p>
            <a href="${paymentLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Pay Invoice
            </a>
          </p>
          
          <p>Thank you for your business!</p>
          <p>Regards,<br>${user.businessName || user.username}</p>
        </div>
      `
    };

    // Add PDF attachment if provided
    if (pdfBuffer) {
      emailOptions.attachments = [
        {
          content: pdfBuffer.toString('base64'),
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ];
    }

    await sgMail.send(emailOptions);
    
    console.log(`Email sent to ${client.email} for invoice ${invoice.invoiceNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return false;
  }
}

/**
 * Send a payment receipt to a client
 */
export async function sendPaymentReceiptEmail(
  invoice: Invoice,
  client: Client,
  user: User,
  paymentDate: Date
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('Cannot send email: SENDGRID_API_KEY is not set');
    return false;
  }

  try {
    const emailOptions: EmailOptions = {
      to: client.email,
      from: user.email,
      subject: `Payment Receipt for Invoice ${invoice.invoiceNumber}`,
      text: `
        Hello ${client.name},
        
        We've received your payment of ${formatCurrency(invoice.totalAmount)} for invoice ${invoice.invoiceNumber}.
        
        Payment date: ${formatDate(paymentDate)}
        
        Thank you for your business!
        
        Regards,
        ${user.businessName || user.username}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Receipt</h2>
          <p>Hello ${client.name},</p>
          <p>We've received your payment of ${formatCurrency(invoice.totalAmount)} for invoice ${invoice.invoiceNumber}.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Invoice Number:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Payment Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatDate(paymentDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatCurrency(invoice.totalAmount)}</td>
            </tr>
          </table>
          
          <p>Thank you for your business!</p>
          <p>Regards,<br>${user.businessName || user.username}</p>
        </div>
      `
    };

    await sgMail.send(emailOptions);
    
    console.log(`Payment receipt email sent to ${client.email} for invoice ${invoice.invoiceNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
    return false;
  }
}

/**
 * Send a payment reminder to a client
 */
export async function sendPaymentReminderEmail(
  invoice: Invoice,
  client: Client,
  user: User,
  daysOverdue: number
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('Cannot send email: SENDGRID_API_KEY is not set');
    return false;
  }

  try {
    // Create the payment link
    const paymentLink = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/invoices/${invoice.id}/pay`;

    // Determine the urgency level
    let subject = `Reminder: Invoice ${invoice.invoiceNumber} is due soon`;
    let urgencyMessage = 'This is a friendly reminder that your invoice is due soon.';
    
    if (daysOverdue > 0) {
      subject = `Invoice ${invoice.invoiceNumber} is overdue`;
      urgencyMessage = `This invoice is overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}.`;
    }

    const emailOptions: EmailOptions = {
      to: client.email,
      from: user.email,
      subject,
      text: `
        Hello ${client.name},
        
        ${urgencyMessage}
        
        Invoice Number: ${invoice.invoiceNumber}
        Amount Due: ${formatCurrency(invoice.totalAmount)}
        Due Date: ${formatDate(invoice.dueDate)}
        
        You can pay this invoice online at: ${paymentLink}
        
        If you've already made this payment, please disregard this reminder.
        
        Regards,
        ${user.businessName || user.username}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Invoice Reminder</h2>
          <p>Hello ${client.name},</p>
          <p><strong>${urgencyMessage}</strong></p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Invoice Number:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Due Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatDate(invoice.dueDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount Due:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatCurrency(invoice.totalAmount)}</td>
            </tr>
          </table>
          
          <p>
            <a href="${paymentLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Pay Invoice Now
            </a>
          </p>
          
          <p>If you've already made this payment, please disregard this reminder.</p>
          <p>Regards,<br>${user.businessName || user.username}</p>
        </div>
      `
    };

    await sgMail.send(emailOptions);
    
    console.log(`Payment reminder email sent to ${client.email} for invoice ${invoice.invoiceNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending payment reminder email:', error);
    return false;
  }
}