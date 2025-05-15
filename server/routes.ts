import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertClientSchema, 
  insertInvoiceSchema, 
  insertInvoiceItemSchema,
  insertRecurringTemplateSchema,
  insertRecurringTemplateItemSchema
} from "@shared/schema";
import Stripe from "stripe";
import * as EmailService from "./services/email-service";
import { renderToBuffer } from "@react-pdf/renderer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Initialize Stripe if API key is available
  let stripe: Stripe | undefined;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
  }

  // Middleware to check authentication
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Client routes
  app.get("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getClientsByUserId(req.user.id);
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClientById(clientId);
      
      if (!client || client.userId !== req.user.id) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Invoice routes
  app.get("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByUserId(req.user.id);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const invoiceData = {
        ...req.body,
        userId: req.user.id,
      };
      
      const validatedInvoice = insertInvoiceSchema.parse(invoiceData);
      const invoice = await storage.createInvoice(validatedInvoice);
      
      // Process invoice items if provided
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const itemData = {
            ...item,
            invoiceId: invoice.id,
          };
          
          const validatedItem = insertInvoiceItemSchema.parse(itemData);
          await storage.createInvoiceItem(validatedItem);
        }
      }
      
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoiceById(invoiceId);
      
      if (!invoice || invoice.userId !== req.user.id) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const items = await storage.getInvoiceItemsByInvoiceId(invoiceId);
      res.json({ ...invoice, items });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/invoices/:id/status", isAuthenticated, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoiceById(invoiceId);
      
      if (!invoice || invoice.userId !== req.user.id) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const statusSchema = z.object({
        status: z.enum(["draft", "sent", "viewed", "paid", "overdue"])
      });
      
      const { status } = statusSchema.parse(req.body);
      const updatedInvoice = await storage.updateInvoiceStatus(invoiceId, status);
      
      res.json(updatedInvoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const metrics = await storage.getDashboardMetrics(userId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment intent creation
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured" });
      }
      
      const { invoiceId } = req.body;
      
      if (!invoiceId) {
        return res.status(400).json({ message: "Invoice ID is required" });
      }
      
      const invoice = await storage.getInvoiceById(parseInt(invoiceId));
      
      if (!invoice || invoice.userId !== req.user.id) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const amountInCents = Math.round(parseFloat(invoice.totalAmount.toString()) * 100);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        metadata: {
          invoiceId: invoice.id.toString(),
        },
      });
      
      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Email invoice to client
  app.post("/api/invoices/:id/send", isAuthenticated, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoiceById(invoiceId);
      
      if (!invoice || invoice.userId !== req.user.id) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const client = await storage.getClientById(invoice.clientId);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const invoiceItems = await storage.getInvoiceItemsByInvoiceId(invoiceId);
      
      // Send the email
      const success = await EmailService.sendInvoiceEmail(
        invoice,
        client,
        req.user,
        invoiceItems
      );
      
      if (success) {
        // Update invoice status to 'sent' if it's in 'draft' status
        if (invoice.status === 'draft') {
          await storage.updateInvoiceStatus(invoiceId, 'sent');
        }
        
        // Update the lastSentDate
        const now = new Date();
        await storage.updateInvoice(invoiceId, { 
          lastSentDate: now 
        });
        
        res.status(200).json({
          message: "Invoice sent successfully",
          email: client.email
        });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Send payment reminder email
  app.post("/api/invoices/:id/remind", isAuthenticated, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoiceById(invoiceId);
      
      if (!invoice || invoice.userId !== req.user.id) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Don't send reminders for paid invoices
      if (invoice.status === 'paid') {
        return res.status(400).json({ message: "Cannot send reminder for paid invoice" });
      }
      
      const client = await storage.getClientById(invoice.clientId);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Calculate days overdue
      const today = new Date();
      const dueDate = new Date(invoice.dueDate);
      const diffTime = today.getTime() - dueDate.getTime();
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Send the reminder
      const success = await EmailService.sendPaymentReminderEmail(
        invoice,
        client,
        req.user,
        daysOverdue
      );
      
      if (success) {
        // If invoice is overdue and not already marked as such, update the status
        if (daysOverdue > 0 && invoice.status !== 'overdue') {
          await storage.updateInvoiceStatus(invoiceId, 'overdue');
        }
        
        res.status(200).json({
          message: "Payment reminder sent",
          email: client.email
        });
      } else {
        res.status(500).json({ message: "Failed to send reminder" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Send receipt after payment
  app.post("/api/invoices/:id/receipt", isAuthenticated, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoiceById(invoiceId);
      
      if (!invoice || invoice.userId !== req.user.id) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Only send receipts for paid invoices
      if (invoice.status !== 'paid') {
        return res.status(400).json({ message: "Invoice is not marked as paid" });
      }
      
      const client = await storage.getClientById(invoice.clientId);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Send the receipt
      const success = await EmailService.sendPaymentReceiptEmail(
        invoice,
        client,
        req.user,
        new Date() // Use current date as payment date
      );
      
      if (success) {
        res.status(200).json({
          message: "Payment receipt sent",
          email: client.email
        });
      } else {
        res.status(500).json({ message: "Failed to send receipt" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Recurring Template routes
  app.get("/api/recurring-templates", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const templates = await storage.getRecurringTemplatesByUserId(req.user.id);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/recurring-templates/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const template = await storage.getRecurringTemplateById(parseInt(req.params.id));
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Check if the template belongs to the user
      if (template.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/recurring-templates", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const validatedData = insertRecurringTemplateSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const template = await storage.createRecurringTemplate(validatedData);
      res.status(201).json(template);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/recurring-templates/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const template = await storage.getRecurringTemplateById(parseInt(req.params.id));
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Check if the template belongs to the user
      if (template.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Update the template
      const validatedData = z.object({
        name: z.string().optional(),
        clientId: z.number().optional(),
        frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'biannually', 'annually']).optional(),
        nextGenerationDate: z.string().optional(),
        daysBefore: z.number().optional(),
        notes: z.string().nullable().optional(),
        autoSend: z.boolean().optional(),
        emailTemplate: z.string().nullable().optional(),
      }).parse(req.body);
      
      const updatedTemplate = await storage.updateRecurringTemplate(template.id, validatedData);
      res.json(updatedTemplate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/recurring-templates/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const template = await storage.getRecurringTemplateById(parseInt(req.params.id));
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Check if the template belongs to the user
      if (template.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteRecurringTemplate(template.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Toggle template status (active/inactive)
  app.patch("/api/recurring-templates/:id/toggle", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const template = await storage.getRecurringTemplateById(parseInt(req.params.id));
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Check if the template belongs to the user
      if (template.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const active = z.boolean().parse(req.body.active);
      const updatedTemplate = await storage.toggleRecurringTemplateStatus(template.id, active);
      res.json(updatedTemplate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Template Items routes
  app.get("/api/recurring-templates/:id/items", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const template = await storage.getRecurringTemplateById(parseInt(req.params.id));
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Check if the template belongs to the user
      if (template.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const items = await storage.getRecurringTemplateItemsByTemplateId(template.id);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/recurring-templates/:id/items", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const template = await storage.getRecurringTemplateById(parseInt(req.params.id));
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Check if the template belongs to the user
      if (template.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertRecurringTemplateItemSchema.parse({
        ...req.body,
        templateId: template.id,
      });
      
      const item = await storage.createRecurringTemplateItem(validatedData);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/recurring-template-items/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const itemId = parseInt(req.params.id);
      
      // Get the template item
      const items = Array.from((storage as any).recurringTemplateItems.values());
      const item = items.find((i: any) => i.id === itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      // Get the template to check ownership
      const template = await storage.getRecurringTemplateById(item.templateId);
      
      if (!template || template.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Update the item
      const validatedData = z.object({
        description: z.string().optional(),
        quantity: z.number().optional(),
        unitPrice: z.number().optional(),
        amount: z.number().optional(),
      }).parse(req.body);
      
      const updatedItem = await storage.updateRecurringTemplateItem(itemId, validatedData);
      res.json(updatedItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/recurring-template-items/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const itemId = parseInt(req.params.id);
      
      // Get the template item
      const items = Array.from((storage as any).recurringTemplateItems.values());
      const item = items.find((i: any) => i.id === itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      // Get the template to check ownership
      const template = await storage.getRecurringTemplateById(item.templateId);
      
      if (!template || template.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteRecurringTemplateItem(itemId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate invoices from templates
  app.post("/api/recurring-templates/generate", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Optional date parameter
      const date = req.body.date ? new Date(req.body.date) : new Date();
      
      // Generate invoices from templates
      const invoices = await storage.generateInvoicesFromTemplates(date);
      
      // Filter to only include invoices for the current user
      const userInvoices = invoices.filter(invoice => invoice.userId === req.user!.id);
      
      res.status(201).json({
        message: `Generated ${userInvoices.length} invoices`,
        invoices: userInvoices
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate invoice from a specific template
  app.post("/api/recurring-templates/:id/generate", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const template = await storage.getRecurringTemplateById(parseInt(req.params.id));
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Check if the template belongs to the user
      if (template.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Generate invoice from template
      const invoice = await storage.generateInvoiceFromTemplate(template.id);
      
      res.status(201).json({
        message: "Invoice generated successfully",
        invoice
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
