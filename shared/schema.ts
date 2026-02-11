import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";

export const financialProfiles = pgTable("financial_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Link to auth users
  baseIncome: doublePrecision("base_income").notNull(), // Ingreso Neto
  preDeducted: doublePrecision("pre_deducted").notNull().default(0), // Deudas/Adelantos
  fixedCosts: jsonb("fixed_costs").$type<{ name: string; amount: number }[]>().notNull().default([]), // Gastos Fijos (Multiple)
  startDate: timestamp("start_date").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  category: text("category").notNull(), // 'super', 'delivery', etc.
  description: text("description"),
  date: timestamp("date").notNull().defaultNow(),
});

// Zod Schemas
export const insertFinancialProfileSchema = createInsertSchema(financialProfiles).omit({
  id: true,
  userId: true,
  updatedAt: true,
  startDate: true,
}).extend({
    baseIncome: z.number().min(0, "Income must be positive"),
    preDeducted: z.number().min(0).default(0),
    fixedCosts: z.array(z.object({
        name: z.string().min(1, "Name is required"),
        amount: z.number().min(0, "Amount must be positive"),
    })).default([]),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  userId: true,
  date: true
}).extend({
    amount: z.number().positive("Amount must be positive"),
    category: z.string().min(1, "Category is required"),
});

export type FinancialProfile = typeof financialProfiles.$inferSelect;
export type InsertFinancialProfile = z.infer<typeof insertFinancialProfileSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Categories standard list for validation/frontend use
export const CATEGORIES = [
    { id: 'super', name: 'Super', icon: '🛒' },
    { id: 'delivery', name: 'Delivery', icon: '🍔' },
    { id: 'transporte', name: 'Transp.', icon: '🚌' },
    { id: 'ocio', name: 'Ocio', icon: '🍻' },
    { id: 'servicios', name: 'Servicios', icon: '💡' },
    { id: 'varios', name: 'Varios', icon: '📦' }
] as const;
