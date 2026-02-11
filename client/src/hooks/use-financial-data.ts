import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type FinancialProfile, 
  type InsertFinancialProfile, 
  type Transaction, 
  type InsertTransaction 
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// ============================================
// FINANCIAL PROFILE HOOKS
// ============================================

export function useFinancialProfile() {
  return useQuery({
    queryKey: [api.financialProfile.get.path],
    queryFn: async () => {
      const res = await fetch(api.financialProfile.get.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (res.status === 404) return null; // Handle specifically as "no profile"
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.financialProfile.get.responses[200].parse(await res.json());
    },
    retry: false
  });
}

export function useCreateOrUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertFinancialProfile) => {
      // Ensure numbers are numbers (coercion safety from forms)
      const payload = {
        ...data,
        baseIncome: Number(data.baseIncome),
        preDeducted: Number(data.preDeducted),
        fixedCosts: Number(data.fixedCosts),
      };

      const res = await fetch(api.financialProfile.createOrUpdate.path, {
        method: api.financialProfile.createOrUpdate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update profile");
      }
      return api.financialProfile.createOrUpdate.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.financialProfile.get.path] });
      toast({
        title: "Success",
        description: "Your financial profile has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ============================================
// TRANSACTIONS HOOKS
// ============================================

export function useTransactions() {
  return useQuery({
    queryKey: [api.transactions.list.path],
    queryFn: async () => {
      const res = await fetch(api.transactions.list.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertTransaction) => {
      const payload = {
        ...data,
        amount: Number(data.amount),
      };

      const res = await fetch(api.transactions.create.path, {
        method: api.transactions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create transaction");
      }
      return api.transactions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      toast({
        title: "Transaction Added",
        description: "Your spending has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
