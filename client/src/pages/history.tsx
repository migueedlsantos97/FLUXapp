import { useTransactions } from "@/hooks/use-financial-data";
import { CATEGORIES } from "@shared/schema";
import { Loader2, Calendar } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
import { useLocation } from "wouter";

export default function HistoryPage() {
  const { data: transactions, isLoading } = useTransactions();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Group transactions by date
  const sortedTransactions = [...(transactions || [])].sort((a, b) => 
    new Date(b.date as unknown as string).getTime() - new Date(a.date as unknown as string).getTime()
  );

  const grouped: Record<string, typeof sortedTransactions> = {};
  sortedTransactions.forEach(t => {
    const dateKey = format(parseISO(t.date as unknown as string), "yyyy-MM-dd");
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(t);
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-white">History</h1>
        <div className="text-xs text-slate-400 font-mono">
          TOTAL: ${sortedTransactions.reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
        </div>
      </div>

      {Object.entries(grouped).length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl grayscale opacity-50">
            💸
          </div>
          <h3 className="text-lg font-medium text-slate-300">No History Yet</h3>
          <p className="text-slate-500 text-sm mt-1">Start spending to see records here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dateKey, items]) => (
            <div key={dateKey} className="space-y-3">
              <div className="sticky top-20 z-10 bg-background/95 backdrop-blur py-2 border-b border-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  {format(parseISO(dateKey), "EEEE, MMMM d")}
                </h3>
              </div>

              {items.map((t) => {
                const category = CATEGORIES.find(c => c.id === t.category);
                return (
                  <div 
                    key={t.id} 
                    className="group flex items-center justify-between p-4 rounded-2xl bg-card/40 border border-slate-800/50 hover:bg-card hover:border-slate-700 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-200">
                        {category?.icon || "📦"}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">{category?.name}</p>
                        {t.description && (
                          <p className="text-sm text-slate-400">{t.description}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">
                          {format(parseISO(t.date as unknown as string), "h:mm a")}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xl text-white tracking-tight">
                      -${t.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
