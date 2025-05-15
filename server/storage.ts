import { 
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  invoices, type Invoice, type InsertInvoice,
  invoiceItems, type InvoiceItem, type InsertInvoiceItem,
  recurringTemplates, type RecurringTemplate, type InsertRecurringTemplate,
  recurringTemplateItems, type RecurringTemplateItem, type InsertRecurringTemplateItem
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { DatabaseStorage } from "./databaseStorage";
import { pool } from "./db";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Client operations
  getClientsByUserId(userId: number): Promise<Client[]>;
  getClientById(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, clientData: Partial<Client>): Promise<Client>;
  deleteClient(id: number): Promise<boolean>;
  
  // Invoice operations
  getInvoicesByUserId(userId: number): Promise<Invoice[]>;
  getInvoiceById(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice>;
  deleteInvoice(id: number): Promise<boolean>;
  
  // Invoice items operations
  getInvoiceItemsByInvoiceId(invoiceId: number): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: number, itemData: Partial<InvoiceItem>): Promise<InvoiceItem>;
  deleteInvoiceItem(id: number): Promise<boolean>;
  
  // Recurring Template operations
  getRecurringTemplatesByUserId(userId: number): Promise<RecurringTemplate[]>;
  getRecurringTemplateById(id: number): Promise<RecurringTemplate | undefined>;
  createRecurringTemplate(template: InsertRecurringTemplate): Promise<RecurringTemplate>;
  updateRecurringTemplate(id: number, templateData: Partial<RecurringTemplate>): Promise<RecurringTemplate>;
  toggleRecurringTemplateStatus(id: number, active: boolean): Promise<RecurringTemplate>;
  deleteRecurringTemplate(id: number): Promise<boolean>;
  
  // Recurring Template Items operations
  getRecurringTemplateItemsByTemplateId(templateId: number): Promise<RecurringTemplateItem[]>;
  createRecurringTemplateItem(item: InsertRecurringTemplateItem): Promise<RecurringTemplateItem>;
  updateRecurringTemplateItem(id: number, itemData: Partial<RecurringTemplateItem>): Promise<RecurringTemplateItem>;
  deleteRecurringTemplateItem(id: number): Promise<boolean>;
  
  // Recurring Invoice Generation
  generateInvoicesFromTemplates(date?: Date): Promise<Invoice[]>;
  generateInvoiceFromTemplate(templateId: number): Promise<Invoice>;
  
  // Dashboard metrics
  getDashboardMetrics(userId: number): Promise<{
    pendingAmount: number;
    paidAmount: number;
    overdueAmount: number;
    totalClients: number;
    recentInvoices: any[];
    upcomingPayments: any[];
  }>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private invoices: Map<number, Invoice>;
  private invoiceItems: Map<number, InvoiceItem>;
  private recurringTemplates: Map<number, RecurringTemplate>;
  private recurringTemplateItems: Map<number, RecurringTemplateItem>;
  sessionStore: session.Store;
  private userIdCounter: number = 1;
  private clientIdCounter: number = 1;
  private invoiceIdCounter: number = 1;
  private invoiceItemIdCounter: number = 1;
  private recurringTemplateIdCounter: number = 1;
  private recurringTemplateItemIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
    
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Create a test user
    this.createTestData();
  }
  
  // Helper method to seed some test data
  private async createTestData() {
    try {
      // Create a test user with a hashed password (password is "password")
      const testUser: User = {
        id: this.userIdCounter++,
        username: "demo",
        password: "5809528b1fcf2523c6f42df2338756cabbf131f1cbf6b337a258d1a8c308ecf4afd031bf102f0be60435ad840b5eef792b11b5c5ff5408435ed707d81330558f.0ed76b1336318aea735a91166e9c5ba5",
        email: "demo@example.com",
        businessName: "Demo Business",
        address: "123 Demo Street",
        phone: "555-1234",
        taxNumber: "123456789",
        plan: "free",
        stripeCustomerId: null,
        stripeSubscriptionId: null
      };
      this.users.set(testUser.id, testUser);
      
      // Create a test client
      const testClient: Client = {
        id: this.clientIdCounter++,
        userId: testUser.id,
        name: "Test Client",
        email: "client@example.com",
        phone: "555-5678",
        address: "456 Client Avenue",
        company: "Test Company Ltd",
        notes: "This is a test client for demo purposes"
      };
      this.clients.set(testClient.id, testClient);
      
      // Create a test invoice
      const today = new Date();
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + 14); // Due in 14 days
      
      const testInvoice: Invoice = {
        id: this.invoiceIdCounter++,
        userId: testUser.id,
        clientId: testClient.id,
        invoiceNumber: "INV-2023-001",
        issueDate: today,
        dueDate: dueDate,
        status: "sent",
        totalAmount: "1250.00",
        notes: "Payment for web development services",
        isRecurring: false,
        recurringFrequency: null,
        lastSentDate: null
      };
      this.invoices.set(testInvoice.id, testInvoice);
      
      // Create test invoice items
      const invoiceItems: InvoiceItem[] = [
        {
          id: this.invoiceItemIdCounter++,
          invoiceId: testInvoice.id,
          description: "Website Design",
          quantity: "1",
          unitPrice: "800.00",
          amount: "800.00"
        },
        {
          id: this.invoiceItemIdCounter++,
          invoiceId: testInvoice.id,
          description: "SEO Optimization",
          quantity: "5",
          unitPrice: "90.00",
          amount: "450.00"
        }
      ];
      
      for (const item of invoiceItems) {
        this.invoiceItems.set(item.id, item);
      }
      
    } catch (error) {
      console.error("Error creating test data:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...userData, 
      id, 
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Client operations
  async getClientsByUserId(userId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(
      (client) => client.userId === userId
    );
  }
  
  async getClientById(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async createClient(clientData: InsertClient): Promise<Client> {
    const id = this.clientIdCounter++;
    const client: Client = { ...clientData, id };
    this.clients.set(id, client);
    return client;
  }
  
  async updateClient(id: number, clientData: Partial<Client>): Promise<Client> {
    const client = await this.getClientById(id);
    if (!client) {
      throw new Error("Client not found");
    }
    
    const updatedClient = { ...client, ...clientData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Invoice operations
  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.userId === userId
    );
  }
  
  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }
  
  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceIdCounter++;
    const invoice: Invoice = { 
      ...invoiceData, 
      id,
      lastSentDate: null
    };
    this.invoices.set(id, invoice);
    return invoice;
  }
  
  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    
    const updatedInvoice = { ...invoice, ...invoiceData };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  async updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    
    const updatedInvoice = { 
      ...invoice, 
      status: status as "draft" | "sent" | "viewed" | "paid" | "overdue",
      lastSentDate: status === 'sent' ? new Date() : invoice.lastSentDate
    };
    
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  async deleteInvoice(id: number): Promise<boolean> {
    // Delete all invoice items associated with this invoice
    const itemsToDelete = Array.from(this.invoiceItems.values())
      .filter(item => item.invoiceId === id);
      
    for (const item of itemsToDelete) {
      await this.deleteInvoiceItem(item.id);
    }
    
    return this.invoices.delete(id);
  }

  // Invoice items operations
  async getInvoiceItemsByInvoiceId(invoiceId: number): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values()).filter(
      (item) => item.invoiceId === invoiceId
    );
  }
  
  async createInvoiceItem(itemData: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = this.invoiceItemIdCounter++;
    const invoiceItem: InvoiceItem = { ...itemData, id };
    this.invoiceItems.set(id, invoiceItem);
    return invoiceItem;
  }
  
  async updateInvoiceItem(id: number, itemData: Partial<InvoiceItem>): Promise<InvoiceItem> {
    const item = this.invoiceItems.get(id);
    if (!item) {
      throw new Error("Invoice item not found");
    }
    
    const updatedItem = { ...item, ...itemData };
    this.invoiceItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteInvoiceItem(id: number): Promise<boolean> {
    return this.invoiceItems.delete(id);
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
    const userInvoices = await this.getInvoicesByUserId(userId);
    const userClients = await this.getClientsByUserId(userId);
    
    // Calculate financial metrics
    let pendingAmount = 0;
    let paidAmount = 0;
    let overdueAmount = 0;
    
    for (const invoice of userInvoices) {
      const amount = parseFloat(invoice.totalAmount.toString());
      
      if (invoice.status === 'pending') {
        pendingAmount += amount;
      } else if (invoice.status === 'paid') {
        paidAmount += amount;
      } else if (invoice.status === 'overdue') {
        overdueAmount += amount;
      }
    }
    
    // Get recent invoices (latest 5)
    const recentInvoices = userInvoices
      .sort((a, b) => {
        const dateA = new Date(a.issueDate).getTime();
        const dateB = new Date(b.issueDate).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(async (invoice) => {
        const client = await this.getClientById(invoice.clientId);
        return {
          ...invoice,
          clientName: client?.name || 'Unknown Client'
        };
      });
    
    // Get upcoming payments (due in next 30 days, not paid)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const upcomingPayments = userInvoices
      .filter(invoice => 
        invoice.status !== 'paid' && 
        new Date(invoice.dueDate) <= thirtyDaysFromNow &&
        new Date(invoice.dueDate) >= today
      )
      .sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB;
      })
      .slice(0, 3)
      .map(async (invoice) => {
        const client = await this.getClientById(invoice.clientId);
        return {
          ...invoice,
          clientName: client?.name || 'Unknown Client',
          daysUntilDue: Math.ceil((new Date(invoice.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        };
      });
    
    return {
      pendingAmount,
      paidAmount,
      overdueAmount,
      totalClients: userClients.length,
      recentInvoices: await Promise.all(recentInvoices),
      upcomingPayments: await Promise.all(upcomingPayments)
    };
  }
}

// Use DatabaseStorage if DATABASE_URL is set, otherwise fall back to MemStorage
export const storage = pool ? new DatabaseStorage() : new MemStorage();
