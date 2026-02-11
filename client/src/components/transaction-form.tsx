import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTransactionSchema, CATEGORIES, type InsertTransaction } from "@shared/schema";
import { useCreateTransaction } from "@/hooks/use-financial-data";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const mutation = useCreateTransaction();
  
  const form = useForm<InsertTransaction>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      amount: undefined,
      category: "",
      description: "",
    },
  });

  const onSubmit = (data: InsertTransaction) => {
    mutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="p-6 pb-2">
        <h2 className="text-xl font-bold font-display text-white">New Transaction</h2>
        <p className="text-sm text-slate-400">Record a new expense</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col p-6 space-y-6">
          
          {/* Amount Input */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500">$</span>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="pl-10 h-20 text-4xl font-bold bg-slate-800/50 border-slate-700 focus:border-primary text-white rounded-2xl"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Categories Grid */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-slate-400 uppercase text-xs tracking-wider">Category</FormLabel>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => field.onChange(cat.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200",
                        field.value === cat.id
                          ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600"
                      )}
                    >
                      <span className="text-2xl mb-1 filter drop-shadow-md">{cat.icon}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wide">{cat.name}</span>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 uppercase text-xs tracking-wider">Note (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Lunch at..." 
                    className="bg-slate-800/50 border-slate-700 text-white h-12 rounded-xl"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex-1" />

          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              "Add Transaction"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
