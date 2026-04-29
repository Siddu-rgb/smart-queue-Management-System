import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = "primary", delay = 0 }) {
  const colorMap = {
    primary: "from-violet-500 to-indigo-500",
    success: "from-emerald-500 to-teal-500",
    warning: "from-amber-500 to-orange-500",
    danger: "from-rose-500 to-pink-500",
    info: "from-sky-500 to-cyan-500",
  };

  const bgMap = {
    primary: "bg-violet-50 dark:bg-violet-500/10",
    success: "bg-emerald-50 dark:bg-emerald-500/10",
    warning: "bg-amber-50 dark:bg-amber-500/10",
    danger: "bg-rose-50 dark:bg-rose-500/10",
    info: "bg-sky-50 dark:bg-sky-500/10",
  };

  const textMap = {
    primary: "text-violet-600 dark:text-violet-400",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-rose-600 dark:text-rose-400",
    info: "text-sky-600 dark:text-sky-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="mt-1.5 text-3xl font-space font-bold text-foreground">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          {trend !== undefined && (
            <p className={cn("mt-1.5 text-xs font-medium", trend >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs yesterday
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-3 rounded-xl", bgMap[color])}>
            <Icon className={cn("w-5 h-5", textMap[color])} />
          </div>
        )}
      </div>
    </motion.div>
  );
}