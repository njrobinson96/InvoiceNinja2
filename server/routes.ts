import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertClientSchema, insertInvoiceSchema, insertInvoiceItemSchema } from "@shared/schema";
import Stripe from "stripe";

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

  const httpServer = createServer(app);
  return httpServer;
}
