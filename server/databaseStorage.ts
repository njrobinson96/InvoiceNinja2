import { 
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  invoices, type Invoice, type InsertInvoice,
  invoiceItems, type InvoiceItem, type InsertInvoiceItem
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { IStorage } from "./storage";

// PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    if (!pool) {
      throw new Error("Database pool is not initialized. Cannot use DatabaseStorage.");
    }
    
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not initialized");
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        plan: "free",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        businessName: userData.businessName || null,
        address: userData.address || null,
        phone: userData.phone || null,
        taxNumber: userData.taxNumber || null
      })
      .returning();
      
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    if (!db) throw new Error("Database not initialized");
    
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
      
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }

  // Client operations
  async getClientsByUserId(userId: number): Promise<Client[]> {
    if (!db) return [];
    
    return await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId));
  }
  
  async getClientById(id: number): Promise<Client | undefined> {
    if (!db) return undefined;
    
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id));
      
    return client;
  }
  
  async createClient(clientData: InsertClient): Promise<Client> {
    if (!db) throw new Error("Database not initialized");
    
    const [client] = await db
      .insert(clients)
      .values({
        ...clientData,
        address: clientData.address || null,
        phone: clientData.phone || null,
        company: clientData.company || null,
        notes: clientData.notes || null
      })
      .returning();
      
    return client;
  }
  
  async updateClient(id: number, clientData: Partial<Client>): Promise<Client> {
    if (!db) throw new Error("Database not initialized");
    
    const [updatedClient] = await db
      .update(clients)
      .set(clientData)
      .where(eq(clients.id, id))
      .returning();
      
    if (!updatedClient) {
      throw new Error("Client not found");
    }
    
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    if (!db) throw new Error("Database not initialized");
    
    const result = await db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning({ deletedId: clients.id });
      
    return result.length > 0;
  }

  // Invoice operations
  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    if (!db) return [];
    
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId));
  }
  
  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    if (!db) return undefined;
    
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
      
    return invoice;
  }
  
  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    if (!db) throw new Error("Database not initialized");
    
    const [invoice] = await db
      .insert(invoices)
      .values({
        ...invoiceData,
        notes: invoiceData.notes || null,
        isRecurring: invoiceData.isRecurring || false,
        recurringFrequency: invoiceData.recurringFrequency || null,
        lastSentDate: null
      })
      .returning();
      
    return invoice;
  }
  
  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice> {
    if (!db) throw new Error("Database not initialized");
    
    const [updatedInvoice] = await db
      .update(invoices)
      .set(invoiceData)
      .where(eq(invoices.id, id))
      .returning();
      
    if (!updatedInvoice) {
      throw new Error("Invoice not found");
    }
    
    return updatedInvoice;
  }
  
  async updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
    if (!db) throw new Error("Database not initialized");
    
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ status: status as "draft" | "sent" | "viewed" | "paid" | "overdue" })
      .where(eq(invoices.id, id))
      .returning();
      
    if (!updatedInvoice) {
      throw new Error("Invoice not found");
    }
    
    return updatedInvoice;
  }
  
  async deleteInvoice(id: number): Promise<boolean> {
    if (!db) throw new Error("Database not initialized");
    
    // First delete related invoice items
    await db
      .delete(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));
    
    // Then delete the invoice
    const result = await db
      .delete(invoices)
      .where(eq(invoices.id, id))
      .returning({ deletedId: invoices.id });
      
    return result.length > 0;
  }

  // Invoice items operations
  async getInvoiceItemsByInvoiceId(invoiceId: number): Promise<InvoiceItem[]> {
    if (!db) return [];
    
    return await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
  }
  
  async createInvoiceItem(itemData: InsertInvoiceItem): Promise<InvoiceItem> {
    if (!db) throw new Error("Database not initialized");
    
    const [invoiceItem] = await db
      .insert(invoiceItems)
      .values(itemData)
      .returning();
      
    return invoiceItem;
  }
  
  async updateInvoiceItem(id: number, itemData: Partial<InvoiceItem>): Promise<InvoiceItem> {
    if (!db) throw new Error("Database not initialized");
    
    const [updatedItem] = await db
      .update(invoiceItems)
      .set(itemData)
      .where(eq(invoiceItems.id, id))
      .returning();
      
    if (!updatedItem) {
      throw new Error("Invoice item not found");
    }
    
    return updatedItem;
  }
  
  async deleteInvoiceItem(id: number): Promise<boolean> {
    if (!db) throw new Error("Database not initialized");
    
    const result = await db
      .delete(invoiceItems)
      .where(eq(invoiceItems.id, id))
      .returning({ deletedId: invoiceItems.id });
      
    return result.length > 0;
  }

  // Dashboard metrics
  async getDashboardMetrics(userId: number): Promise<{
    pendingAmount: number;
    paidAmount: number;
    overdueAmount: number;
    totalClients: number;
    recentInvoices: any[];
    upcomingPayments: any[];
  }> {
    if (!db) {
      return {
        pendingAmount: 0,
        paidAmount: 0,
        overdueAmount: 0,
        totalClients: 0,
        recentInvoices: [],
        upcomingPayments: []
      };
    }
    
    // Get all invoices for the user
    const userInvoices = await this.getInvoicesByUserId(userId);
    
    // Calculate financial metrics
    let pendingAmount = 0;
    let paidAmount = 0;
    let overdueAmount = 0;
    
    for (const invoice of userInvoices) {
      const amount = parseFloat(invoice.totalAmount.toString());
      
      if (invoice.status === 'sent' || invoice.status === 'viewed') {
        pendingAmount += amount;
      } else if (invoice.status === 'paid') {
        paidAmount += amount;
      } else if (invoice.status === 'overdue') {
        overdueAmount += amount;
      }
    }
    
    // Get client count
    const clients = await this.getClientsByUserId(userId);
    const totalClients = clients.length;
    
    // Get recent invoices (latest 5)
    const recentInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.issueDate))
      .limit(5);
      
    // Add client names to recent invoices
    const recentInvoicesWithClients = await Promise.all(
      recentInvoices.map(async (invoice) => {
        const client = await this.getClientById(invoice.clientId);
        return {
          ...invoice,
          clientName: client?.name || 'Unknown Client'
        };
      })
    );
    
    // Get upcoming payments (due in next 30 days, not paid)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const upcomingPayments = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          gte(invoices.dueDate, today),
          lte(invoices.dueDate, thirtyDaysFromNow),
          eq(invoices.status, 'sent').or(eq(invoices.status, 'viewed'))
        )
      )
      .orderBy(invoices.dueDate)
      .limit(3);
      
    // Add client names and days until due to upcoming payments
    const upcomingPaymentsWithDetails = await Promise.all(
      upcomingPayments.map(async (invoice) => {
        const client = await this.getClientById(invoice.clientId);
        const dueDate = new Date(invoice.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...invoice,
          clientName: client?.name || 'Unknown Client',
          daysUntilDue
        };
      })
    );
    
    return {
      pendingAmount,
      paidAmount,
      overdueAmount,
      totalClients,
      recentInvoices: recentInvoicesWithClients,
      upcomingPayments: upcomingPaymentsWithDetails
    };
  }
}