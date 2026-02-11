import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFinancialProfileSchema, type InsertFinancialProfile } from "@shared/schema";
import { useCreateOrUpdateProfile } from "@/hooks/use-financial-data";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function SetupPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const mutation = useCreateOrUpdateProfile();

  const form = useForm<InsertFinancialProfile>({
    resolver: zodResolver(insertFinancialProfileSchema),
    defaultValues: {
      baseIncome: 0,
      preDeducted: 0,
      fixedCosts: 0,
    },
  });

  const onSubmit = (data: InsertFinancialProfile) => {
    mutation.mutate(data, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold text-white">Welcome, {user?.firstName}</h1>
          <p className="text-slate-400">Let's set up your financial reality engine.</p>
        </div>

        <Card className="border-slate-800 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Profile Setup</CardTitle>
            <CardDescription>Enter your monthly financial baseline.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="baseIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">Net Monthly Income</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                          <Input 
                            type="number" 
                            className="pl-8 bg-slate-900/50 border-slate-700 text-white focus:border-primary"
                            placeholder="2000" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-slate-500">Your total income after taxes.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preDeducted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debts & Pre-Deductions</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                          <Input 
                            type="number" 
                            className="pl-8 bg-slate-900/50 border-slate-700 text-white focus:border-primary"
                            placeholder="300" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-slate-500">Money already spent/owed (Credit cards, loans).</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fixedCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fixed Costs</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                          <Input 
                            type="number" 
                            className="pl-8 bg-slate-900/50 border-slate-700 text-white focus:border-primary"
                            placeholder="800" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-slate-500">Rent, utilities, subscriptions, internet.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="w-full h-12 text-lg font-semibold mt-4 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Start Engine <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
