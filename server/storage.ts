import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { 
    financialProfiles, transactions,
    type FinancialProfile, type InsertFinancialProfile,
    type Transaction, type InsertTransaction
} from "@shared/schema";

export interface IStorage {
    // Financial Profile
    getFinancialProfile(userId: string): Promise<FinancialProfile | undefined>;
    createOrUpdateFinancialProfile(userId: string, profile: InsertFinancialProfile): Promise<FinancialProfile>;

    // Transactions
    getTransactions(userId: string): Promise<Transaction[]>;
    createTransaction(userId: string, transaction: InsertTransaction): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
    async getFinancialProfile(userId: string): Promise<FinancialProfile | undefined> {
        const [profile] = await db
            .select()
            .from(financialProfiles)
            .where(eq(financialProfiles.userId, userId));
        return profile;
    }

    async createOrUpdateFinancialProfile(userId: string, profile: InsertFinancialProfile): Promise<FinancialProfile> {
        // Check if exists
        const existing = await this.getFinancialProfile(userId);
        
        if (existing) {
            const [updated] = await db
                .update(financialProfiles)
                .set({
                    ...profile,
                    updatedAt: new Date()
                })
                .where(eq(financialProfiles.userId, userId))
                .returning();
            return updated;
        } else {
            const [created] = await db
                .insert(financialProfiles)
                .values({ ...profile, userId })
                .returning();
            return created;
        }
    }

    async getTransactions(userId: string): Promise<Transaction[]> {
        return await db
            .select()
            .from(transactions)
            .where(eq(transactions.userId, userId))
            .orderBy(desc(transactions.date));
    }

    async createTransaction(userId: string, transaction: InsertTransaction): Promise<Transaction> {
        const [created] = await db
            .insert(transactions)
            .values({ ...transaction, userId })
            .returning();
        return created;
    }
}

export const storage = new DatabaseStorage();
