import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import TokenCard from "../components/TokenCard";
import { motion } from "framer-motion";
import {
  Users, Ticket, Clock, TrendingUp, ArrowRight, Plus,
  Activity, CheckCircle2, XCircle, SkipForward
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const hourlyData = [
  { h: "8am", tokens: 4 }, { h: "9am", tokens: 11 }, { h: "10am", tokens: 18 },
  { h: "11am", tokens: 22 }, { h: "12pm", tokens: 15 }, { h: "1pm", tokens: 9 },
  { h: "2pm", tokens: 14 }, { h: "3pm", tokens: 20 }, { h: "4pm", tokens: 17 },
  { h: "5pm", tokens: 12 }, { h: "6pm", tokens: 8 }, { h: "7pm", tokens: 5 },
];

export default function Overview() {
  const [tokens, setTokens] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Token.list("-created_date", 20),
      base44.entities.Business.list("-created_date", 5),
    ]).then(([t, b]) => {
      setTokens(t);
      setBusinesses(b);
      setLoading(false);
    });
  }, []);

  const waiting = tokens.filter(t => t.status === "waiting").length;
  const serving = tokens.filter(t => t.status === "serving" || t.status === "called").length;
  const completed = tokens.filter(t => t.status === "completed").length;
  const totalToday = tokens.length;

  const recentActive = tokens.filter(t => ["waiting", "called", "serving"].includes(t.status)).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-space font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back — here's what's happening today</p>
        </div>
        <Link to="/live-queue">
          <Button className="gradient-primary text-white border-0 shadow-md shadow-violet-500/25 gap-2">
            <Plus className="w-4 h-4" /> New Token
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Waiting" value={waiting} subtitle="In queue now" icon={Ticket} color="warning" delay={0} />
        <StatCard title="Serving" value={serving} subtitle="Currently active" icon={Activity} color="primary" delay={0.05} />
        <StatCard title="Completed" value={completed} subtitle="Today" icon={CheckCircle2} color="success" delay={0.1} trend={12} />
        <StatCard title="Total Today" value={totalToday} subtitle="All tokens" icon={Users} color="info" delay={0.15} />
      </div>

      {/* Chart + Active queue */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-space font-semibold text-foreground text-sm">Hourly Traffic Today</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Token generation per hour</p>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={hourlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262,83%,58%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(262,83%,58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="h" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="tokens" stroke="hsl(262,83%,58%)" strokeWidth={2} fill="url(#tokenGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Active tokens */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-space font-semibold text-foreground text-sm">Active Queue</h2>
            <Link to="/live-queue" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
              ))
            ) : recentActive.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No active tokens</p>
              </div>
            ) : (
              recentActive.map(token => (
                <TokenCard key={token.id} token={token} compact />
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Business list */}
      {businesses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-space font-semibold text-foreground text-sm">Your Businesses</h2>
            <Link to="/settings" className="text-xs text-primary hover:underline">Manage</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {businesses.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
                  {b.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{b.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{b.type?.replace("_", " ")}</p>
                </div>
                <span className={`ml-auto w-2 h-2 rounded-full ${b.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}