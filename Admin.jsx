import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import StatCard from "../components/StatCard";
import {
  Building2, Users, Ticket, CreditCard, Shield, CheckCircle2,
  XCircle, AlertTriangle, Search, ToggleRight, ToggleLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TABS = ["Businesses", "Tokens", "Subscriptions"];

export default function Admin() {
  const [businesses, setBusinesses] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Businesses");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      base44.entities.Business.list("-created_date", 100),
      base44.entities.Token.list("-created_date", 100),
    ]).then(([b, t]) => {
      setBusinesses(b); setTokens(t); setLoading(false);
    });
  }, []);

  const handleToggleBiz = async (b) => {
    await base44.entities.Business.update(b.id, { is_active: !b.is_active });
    setBusinesses(prev => prev.map(x => x.id === b.id ? { ...x, is_active: !b.is_active } : x));
    toast.success(`Business ${!b.is_active ? "activated" : "deactivated"}`);
  };

  const filteredBiz = businesses.filter(b => !search || b.name?.toLowerCase().includes(search.toLowerCase()));
  const filteredTokens = tokens.filter(t => !search || t.customer_name?.toLowerCase().includes(search.toLowerCase()) || String(t.token_number).includes(search));

  const planCounts = { free: 0, starter: 0, pro: 0, enterprise: 0 };
  businesses.forEach(b => { if (planCounts[b.subscription_plan] !== undefined) planCounts[b.subscription_plan]++; });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl gradient-danger flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-space font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Platform-wide controls & oversight</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Businesses" value={businesses.length} icon={Building2} color="primary" delay={0} />
        <StatCard title="Active Businesses" value={businesses.filter(b => b.is_active).length} icon={CheckCircle2} color="success" delay={0.05} />
        <StatCard title="Total Tokens" value={tokens.length} icon={Ticket} color="info" delay={0.1} />
        <StatCard title="Pro+ Subscribers" value={planCounts.pro + planCounts.enterprise} icon={CreditCard} color="warning" delay={0.15} />
      </div>

      {/* Subscription breakdown */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <h2 className="font-space font-semibold text-sm text-foreground mb-4">Subscription Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(planCounts).map(([plan, count]) => (
            <div key={plan} className="p-3 rounded-xl bg-muted/50 border border-border text-center">
              <p className="text-xl font-space font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{plan}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : activeTab === "Businesses" ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Business</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Type</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Plan</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBiz.map(b => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {b.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{b.name}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">{b.city || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground capitalize">{b.type?.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      b.subscription_plan === "pro" ? "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400" :
                      b.subscription_plan === "enterprise" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                      b.subscription_plan === "starter" ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400" :
                      "bg-muted text-muted-foreground"
                    }`}>{b.subscription_plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${b.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${b.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {b.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleToggleBiz(b)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                      {b.is_active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBiz.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No businesses found</div>
          )}
        </div>
      ) : activeTab === "Tokens" ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Token</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Customer</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Service</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.slice(0, 30).map(t => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-space font-bold text-primary">#{t.token_number}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-foreground">{t.customer_name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      t.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                      t.status === "waiting" ? "bg-amber-50 text-amber-700" :
                      t.status === "cancelled" ? "bg-rose-50 text-rose-700" :
                      "bg-blue-50 text-blue-700"
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{t.service_type || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
                  {b.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.email || "—"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                  b.subscription_plan === "pro" ? "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400" :
                  b.subscription_plan === "enterprise" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                  b.subscription_plan === "starter" ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400" :
                  "bg-muted text-muted-foreground"
                }`}>{b.subscription_plan}</span>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info("Subscription management coming soon")}>
                  Manage
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}