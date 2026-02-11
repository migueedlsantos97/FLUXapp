import { motion } from "framer-motion";

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  currency?: string;
}

export function Gauge({ value, max, label, sublabel, currency = "$" }: GaugeProps) {
  // Clamp percentage between 0 and 100
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const circumference = 2 * Math.PI * 120; // Radius 120
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color logic based on percentage of budget remaining
  // High percentage (lots of budget left) = Green
  // Low percentage (running out) = Red
  // However, value here is "Daily Budget". 
  // If daily budget is high vs average needed, it's good.
  // Let's keep it simple: Primary color for positive, Red for negative/zero.
  const isDanger = value <= 0;
  const strokeColor = isDanger ? "#ef4444" : "#10b981";

  return (
    <div className="relative flex flex-col items-center justify-center p-8">
      {/* SVG Container */}
      <div className="relative w-64 h-64">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-800"
          />
          {/* Progress Circle */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="128"
            cy="128"
            r="120"
            stroke={strokeColor}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center"
          >
            <span className="text-sm font-medium text-slate-400 tracking-widest uppercase mb-1">
              {label}
            </span>
            <div className="flex items-start">
              <span className="text-2xl font-bold text-slate-500 mt-2 mr-1">{currency}</span>
              <span className={`text-5xl font-bold tracking-tighter ${isDanger ? 'text-red-500' : 'text-white'}`}>
                {Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            {sublabel && (
              <span className="mt-2 text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {sublabel}
              </span>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
