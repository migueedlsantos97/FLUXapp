import { useFinancialProfile, useTransactions } from "@/hooks/use-financial-data";
import { Gauge } from "@/components/ui/gauge";
import { Card } from "@/components/ui/card";
import { CATEGORIES } from "@shared/schema";
import { Loader2, TrendingDown, TrendingUp, Calendar, Wallet } from "lucide-react";
import { format, differenceInDays, endOfMonth, isSameMonth, parseISO } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading: profileLoading, error: profileError } = useFinancialProfile();
  const { data: transactions, isLoading: txLoading } = useTransactions();

  // Redirections
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/api/login"); // Redirect to API login handler
    } else if (!authLoading && !profileLoading && !profile) {
      setLocation("/setup");
    }
  }, [user, authLoading, profile, profileLoading, setLocation]);

  if (authLoading || profileLoading || txLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) return null; // Handled by useEffect redirect

  // Core Reality Engine Logic
  const today = new Date();
  const currentMonthTransactions = transactions?.filter(t => 
    isSameMonth(parseISO(t.date as unknown as string), today)
  ) || [];

  const initialAvailable = profile.baseIncome - profile.preDeducted - profile.fixedCosts;
  const totalSpent = currentMonthTransactions.reduce((acc, t) => acc + t.amount, 0);
  const currentBalance = initialAvailable - totalSpent;
  
  const daysInMonth = endOfMonth(today).getDate();
  const daysRemaining = differenceInDays(endOfMonth(today), today) + 1; // Include today
  
  // Safe division
  const dailyBudget = daysRemaining > 0 ? currentBalance / daysRemaining : currentBalance;

  // Recent activity (last 4)
  const recentTransactions = [...(transactions || [])]
    .sort((a, b) => new Date(b.date as unknown as string).getTime() - new Date(a.date as unknown as string).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-10">
      
      {/* Hero Gauge Section */}
      <div className="flex flex-col items-center justify-center -mt-4">
        <Gauge 
          value={dailyBudget} 
          max={initialAvailable / daysInMonth * 1.5} // Scale gauge somewhat dynamically
          label="DAILY BUDGET"
          sublabel={`${daysRemaining} DAYS LEFT`}
        />
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card/50 border-slate-800 p-4 flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Real Balance
          </span>
          <span className={`text-2xl font-mono font-bold ${currentBalance < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
            ${currentBalance.toLocaleString()}
          </span>
        </Card>

        <Card className="bg-card/50 border-slate-800 p-4 flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Spent Month
          </span>
          <span className="text-2xl font-mono font-bold text-white">
            ${totalSpent.toLocaleString()}
          </span>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-white font-display">Recent Activity</h3>
          <span className="text-xs text-slate-500 font-medium bg-slate-800 px-2 py-1 rounded-full">
            {transactions?.length || 0} Total
          </span>
        </div>

        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-card/30 rounded-2xl border border-dashed border-slate-800">
              <p>No transactions yet.</p>
              <p className="text-xs mt-1">Tap + to add one.</p>
            </div>
          ) : (
            recentTransactions.map((t) => {
              const category = CATEGORIES.find(c => c.id === t.category);
              return (
                <div 
                  key={t.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl shadow-inner border border-slate-700/50">
                      {category?.icon || "📦"}
                    </div>
                    <div>
                      <p className="font-medium text-white">{t.description || category?.name || "Expense"}</p>
                      <p className="text-xs text-slate-400">
                        {format(parseISO(t.date as unknown as string), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-white">
                    -${t.amount.toLocaleString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
