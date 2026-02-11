import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, PieChart } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthLanding() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col relative overflow-hidden">
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900">F</div>
          <span className="font-display font-bold text-xl tracking-tight">FLUX</span>
        </div>
        <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={handleLogin}>
          Log In
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-display font-bold leading-[1.1] tracking-tight text-white">
              Master your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                daily reality.
              </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-sm">
              Stop guessing. Flux calculates your real daily budget instantly based on your income, debts, and fixed costs.
            </p>
          </div>

          <div className="grid gap-4">
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="h-14 text-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all duration-300 rounded-xl"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <p className="text-xs text-center text-slate-500 mt-4">
              Secure authentication via Replit • No credit card required
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-12 border-t border-slate-800/50">
            <Feature icon={<Zap className="w-6 h-6 text-yellow-400" />} title="Instant Daily Budget" desc="Know exactly what you can spend today." />
            <Feature icon={<PieChart className="w-6 h-6 text-purple-400" />} title="Smart Math" desc="We deduct fixed costs & debt automatically." />
            <Feature icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />} title="Private & Secure" desc="Your data is yours. Encrypted and safe." />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-400 leading-snug">{desc}</p>
      </div>
    </div>
  );
}
