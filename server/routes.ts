import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper to get user ID from request (assuming auth middleware is working)
  const getUserId = (req: any) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return req.user?.claims?.sub;
    }
    return null;
  };

  // Financial Profile Routes
  app.get(api.financialProfile.get.path, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const profile = await storage.getFinancialProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.post(api.financialProfile.createOrUpdate.path, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const input = api.financialProfile.createOrUpdate.input.parse(req.body);
      const profile = await storage.createOrUpdateFinancialProfile(userId, input);
      res.json(profile); // 200/201
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Transaction Routes
  app.get(api.transactions.list.path, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const transactions = await storage.getTransactions(userId);
    res.json(transactions);
  });

  app.post(api.transactions.create.path, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const input = api.transactions.create.input.parse(req.body);
      const transaction = await storage.createTransaction(userId, input);
      res.status(201).json(transaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
