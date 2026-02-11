import { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useFinancialProfile } from "@/hooks/use-financial-data";
import { Loader2, LogOut, User } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isLoggingOut } = useAuth();
  const { data: profile } = useFinancialProfile();

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-display font-bold text-white text-lg">F</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">FLUX</span>
        </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="w-9 h-9 border-2 border-slate-700 transition-colors hover:border-primary">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="bg-slate-800 text-slate-300">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-slate-700 text-slate-200">
              <div className="flex items-center justify-start gap-2 p-2 border-b border-slate-700/50 mb-2">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              
              <DropdownMenuItem 
                className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                onClick={() => logout()}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
      
      {/* Spacer for header */}
      <div className="h-20" />

      {/* Main Content */}
      <main className="container max-w-md mx-auto px-4 animate-fade-in">
        {children}
      </main>

      {/* Navigation */}
      <BottomNav />
    </div>
  );
}
