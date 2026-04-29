import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import StatCard from "../components/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import { TrendingUp, Clock, Users, Star, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ["hsl(262,83%,58%)", "hsl(199,89%,48%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)"];

const weekData = [
  { day: "Mon", served: 42, avg_wait: 18, rating: 4.2 },
  { day: "Tue", served: 55, avg_wait: 22, rating: 4.4 },
  { day: "Wed", served: 38, avg_wait: 14, rating: 4.1 },
  { day: "Thu", served: 61, avg_wait: 25, rating: 4.5 },
  { day: "Fri", served: 74, avg_wait: 31, rating: 4.3 },
  { day: "Sat", served: 89, avg_wait: 38, rating: 4.6 },
  { day: "Sun", served: 33, avg_wait: 12, rating: 4.7 },
];

const serviceData = [
  { name: "Haircut", value: 35 },
  { name: "Consultation", value: 28 },
  { name: "Medicine", value: 20 },
  { name: "Repair", value: 12 },
  { name: "Others", value: 5 },
];

const peakData = [
  { h: "8am", load: 30 }, { h: "9am", load: 55 }, { h: "10am", load: 80 },
  { h: "11am", load: 95 }, { h: "12pm", load: 65 }, { h: "1pm", load: 40 },
  { h: "2pm", load: 60 }, { h: "3pm", load: 88 }, { h: "4pm", load: 75 },
  { h: "5pm", load: 50 }, { h: "6pm", load: 35 }, { h: "7pm", load: 20 },
];

export default function Analytics() {
  const [tokens, setTokens] = useState([]);
  const [range, setRange] = useState("week");

  useEffect(() => {
    base44.entities.Token.list("-created_date", 200).then(setTokens);
  }, []);

  const completed = tokens.filter(t => t.status === "completed").length;
  const skipped = tokens.filter(t => t.status === "skipped").length;
  const cancelled = tokens.filter(t => t.status === "cancelled").length;
  const avgWait = 22;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-space font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Performance insights & trends</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {["today", "week", "month"].map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${range === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {r}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Completed" value={completed} subtitle="Tokens served" icon={Users} color="success" trend={8} delay={0} />
        <StatCard title="Avg Wait" value={`${avgWait}m`} subtitle="Per customer" icon={Clock} color="info" trend={-5} delay={0.05} />
        <StatCard title="Skipped" value={skipped} subtitle="No-shows" icon={TrendingUp} color="warning" delay={0.1} />
        <StatCard title="Satisfaction" value="4.5★" subtitle="Avg rating" icon={Star} color="primary" trend={3} delay={0.15} />
      </div>

      {/* Main charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly served */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h2 className="font-space font-semibold text-foreground text-sm mb-4">Customers Served (This Week)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="served" fill="hsl(262,83%,58%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Service breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h2 className="font-space font-semibold text-foreground text-sm mb-4">Service Breakdown</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={serviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {serviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {serviceData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground flex-1">{s.name}</span>
                <span className="font-medium text-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Peak hours + Avg wait */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h2 className="font-space font-semibold text-foreground text-sm mb-4">Peak Hours Analysis</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={peakData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38,92%,50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38,92%,50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="h" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="load" stroke="hsl(38,92%,50%)" strokeWidth={2} fill="url(#peakGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h2 className="font-space font-semibold text-foreground text-sm mb-4">Avg Wait Time Trend</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weekData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="avg_wait" stroke="hsl(199,89%,48%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(199,89%,48%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Predictions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="font-space font-semibold text-foreground text-sm">AI Prediction Engine</h2>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">Powered by AI</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Expected peak today", value: "11am – 1pm", note: "Prepare 2 extra counters", color: "warning" },
            { label: "Predicted no-shows", value: "~8 tokens", note: "Based on historical data", color: "danger" },
            { label: "Recommended staff", value: "4 members", note: "For optimal performance", color: "success" },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-lg font-space font-bold text-foreground mt-1">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}