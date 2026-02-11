import { Link, useLocation } from "wouter";
import { Home, History, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateTransaction } from "@/hooks/use-financial-data";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transaction-form";
import { useState } from "react";

export function BottomNav() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-background to-background/95 backdrop-blur-md border-t border-white/5">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          
          {/* Dashboard Link */}
          <Link href="/">
            <div className={cn(
              "flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 cursor-pointer",
              isActive("/") ? "text-primary bg-primary/10" : "text-slate-400 hover:text-slate-200"
            )}>
              <Home className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Home</span>
            </div>
          </Link>

          {/* Add Button - Floating */}
          <div className="relative -top-6">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-105 transition-all duration-300 border-4 border-background">
                  <Plus className="w-8 h-8" strokeWidth={3} />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border-slate-700 text-slate-100 p-0 overflow-hidden rounded-2xl">
                <TransactionForm onSuccess={() => setIsOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* History Link */}
          <Link href="/history">
            <div className={cn(
              "flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 cursor-pointer",
              isActive("/history") ? "text-primary bg-primary/10" : "text-slate-400 hover:text-slate-200"
            )}>
              <History className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">History</span>
            </div>
          </Link>

        </div>
      </div>
      
      {/* Spacer for content above nav */}
      <div className="h-24" />
    </>
  );
}
