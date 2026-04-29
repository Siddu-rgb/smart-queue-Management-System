import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import TokenCard from "../components/TokenCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, Ticket, Users, Play, Pause,
  RefreshCw, ChevronDown, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "waiting", label: "Waiting" },
  { key: "called", label: "Called" },
  { key: "serving", label: "Serving" },
  { key: "completed", label: "Completed" },
];

export default function LiveQueue() {
  const [tokens, setTokens] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [showNewToken, setShowNewToken] = useState(false);
  const [queuePaused, setQueuePaused] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", service_type: "", priority: "normal", counter_number: 1 });

  const fetchData = async () => {
    setLoading(true);
    const [t, b, s] = await Promise.all([
      base44.entities.Token.list("-created_date", 50),
      base44.entities.Business.list("-created_date", 20),
      base44.entities.Service.list("-created_date", 50),
    ]);
    setTokens(t);
    setBusinesses(b);
    setServices(s);
    if (b.length > 0 && !selectedBusiness) setSelectedBusiness(b[0].id);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const unsub = base44.entities.Token.subscribe((event) => {
      if (event.type === "create") setTokens(prev => [event.data, ...prev]);
      else if (event.type === "update") setTokens(prev => prev.map(t => t.id === event.id ? event.data : t));
      else if (event.type === "delete") setTokens(prev => prev.filter(t => t.id !== event.id));
    });
    return unsub;
  }, []);

  const filtered = tokens.filter(t => {
    const matchTab = activeTab === "all" || t.status === activeTab;
    const matchSearch = !search || t.customer_name?.toLowerCase().includes(search.toLowerCase()) || String(t.token_number).includes(search);
    const matchBiz = !selectedBusiness || t.business_id === selectedBusiness;
    return matchTab && matchSearch && matchBiz;
  });

  const nextTokenNumber = () => {
    const bTokens = tokens.filter(t => t.business_id === selectedBusiness);
    return bTokens.length > 0 ? Math.max(...bTokens.map(t => t.token_number)) + 1 : 1;
  };

  const handleCreate = async () => {
    if (!form.customer_name) { toast.error("Customer name required"); return; }
    const token = await base44.entities.Token.create({
      ...form,
      token_number: nextTokenNumber(),
      business_id: selectedBusiness,
      status: "waiting",
      estimated_wait: (tokens.filter(t => t.status === "waiting" && t.business_id === selectedBusiness).length) * 15,
    });
    setShowNewToken(false);
    setForm({ customer_name: "", customer_phone: "", service_type: "", priority: "normal", counter_number: 1 });
    toast.success(`Token #${token.token_number} created`);
  };

  const handleCall = async (token) => {
    await base44.entities.Token.update(token.id, { status: "called", called_at: new Date().toISOString() });
    toast.info(`Token #${token.token_number} called`);
  };

  const handleComplete = async (token) => {
    await base44.entities.Token.update(token.id, { status: "completed", served_at: new Date().toISOString() });
    toast.success(`Token #${token.token_number} completed`);
  };

  const handleSkip = async (token) => {
    await base44.entities.Token.update(token.id, { status: "skipped" });
    toast.warning(`Token #${token.token_number} skipped`);
  };

  const handleCancel = async (token) => {
    await base44.entities.Token.update(token.id, { status: "cancelled" });
  };

  const waitingCount = tokens.filter(t => t.status === "waiting" && t.business_id === selectedBusiness).length;
  const bizServices = services.filter(s => s.business_id === selectedBusiness);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-space font-bold text-foreground">Live Queue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {waitingCount} waiting · {queuePaused ? "Queue paused" : "Queue active"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={queuePaused ? "text-emerald-600 border-emerald-300" : "text-amber-600 border-amber-300"}
            onClick={() => { setQueuePaused(!queuePaused); toast(queuePaused ? "Queue resumed" : "Queue paused"); }}
          >
            {queuePaused ? <Play className="w-4 h-4 mr-1.5" /> : <Pause className="w-4 h-4 mr-1.5" />}
            {queuePaused ? "Resume" : "Pause"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button className="gradient-primary text-white border-0 shadow-sm gap-2" size="sm" onClick={() => setShowNewToken(true)}>
            <Plus className="w-4 h-4" /> New Token
          </Button>
        </div>
      </div>

      {/* Business selector */}
      {businesses.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {businesses.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBusiness(b.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                selectedBusiness === b.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name or token…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.key !== "all" && (
                <span className="ml-1 text-xs">
                  ({tokens.filter(t => t.status === tab.key && (!selectedBusiness || t.business_id === selectedBusiness)).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Token grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No tokens found</p>
          <p className="text-xs text-muted-foreground mt-1">Create a new token to get started</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((token, i) => (
              <motion.div key={token.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} exit={{ opacity: 0, scale: 0.95 }}>
                <TokenCard token={token} onCall={handleCall} onComplete={handleComplete} onSkip={handleSkip} onCancel={handleCancel} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* New Token Dialog */}
      <Dialog open={showNewToken} onOpenChange={setShowNewToken}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-space">Generate New Token</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Token Number</label>
              <div className="h-10 px-3 rounded-lg bg-muted flex items-center text-sm font-bold text-primary">
                #{selectedBusiness ? nextTokenNumber() : "—"}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Customer Name *</label>
              <Input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="Full name" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number</label>
              <Input value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Service</label>
              <Select value={form.service_type} onValueChange={v => setForm(f => ({ ...f, service_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>
                  {bizServices.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Counter</label>
                <Input type="number" min={1} value={form.counter_number} onChange={e => setForm(f => ({ ...f, counter_number: Number(e.target.value) }))} />
              </div>
            </div>
            <Button className="w-full gradient-primary text-white border-0" onClick={handleCreate}>
              <Ticket className="w-4 h-4 mr-2" /> Generate Token
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}