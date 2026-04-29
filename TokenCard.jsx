import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Clock, Star, SkipForward, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const statusConfig = {
  waiting: { label: "Waiting", class: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400" },
  called: { label: "Called", class: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400" },
  serving: { label: "Serving", class: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400" },
  completed: { label: "Completed", class: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400" },
  skipped: { label: "Skipped", class: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400" },
  cancelled: { label: "Cancelled", class: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400" },
};

const priorityConfig = {
  normal: null,
  vip: { label: "VIP", class: "bg-amber-500 text-white" },
  emergency: { label: "Emergency", class: "bg-red-500 text-white" },
};

export default function TokenCard({ token, onCall, onComplete, onSkip, onCancel, compact = false }) {
  const status = statusConfig[token.status] || statusConfig.waiting;
  const priority = priorityConfig[token.priority];

  return (
    <div className={cn(
      "bg-card border border-border rounded-xl transition-all hover:shadow-md",
      compact ? "p-3" : "p-4",
      token.status === "calling" && "ring-2 ring-violet-500/50 token-pulse"
    )}>
      <div className="flex items-start gap-3">
        {/* Token number badge */}
        <div className={cn(
          "flex-shrink-0 rounded-xl flex items-center justify-center font-space font-bold text-white shadow-sm",
          compact ? "w-10 h-10 text-sm" : "w-12 h-12 text-base",
          token.priority === "emergency" ? "gradient-danger" :
          token.priority === "vip" ? "gradient-warning" : "gradient-primary"
        )}>
          #{token.token_number}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground truncate">{token.customer_name}</span>
            {priority && (
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", priority.class)}>
                {priority.label}
              </span>
            )}
            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium ml-auto", status.class)}>
              {status.label}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {token.customer_phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> {token.customer_phone}
              </span>
            )}
            {token.service_type && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" /> {token.service_type}
              </span>
            )}
            {token.estimated_wait !== undefined && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> ~{token.estimated_wait}m wait
              </span>
            )}
            {token.counter_number && (
              <span>Counter {token.counter_number}</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {!compact && (token.status === "waiting" || token.status === "called") && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {token.status === "waiting" && onCall && (
            <Button size="sm" className="gradient-primary text-white border-0 text-xs h-7" onClick={() => onCall(token)}>
              <ArrowRight className="w-3 h-3 mr-1" /> Call
            </Button>
          )}
          {token.status === "called" && onComplete && (
            <Button size="sm" className="gradient-success text-white border-0 text-xs h-7" onClick={() => onComplete(token)}>
              <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
            </Button>
          )}
          {onSkip && (
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onSkip(token)}>
              <SkipForward className="w-3 h-3 mr-1" /> Skip
            </Button>
          )}
          {onCancel && (
            <Button size="sm" variant="outline" className="text-xs h-7 text-destructive hover:text-destructive" onClick={() => onCancel(token)}>
              <XCircle className="w-3 h-3 mr-1" /> Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}