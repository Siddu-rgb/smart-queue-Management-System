import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Clock, Volume2, Maximize2, ChevronRight, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QueueDisplay() {
  const [tokens, setTokens] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBiz, setSelectedBiz] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    Promise.all([
      base44.entities.Token.list("-created_date", 100),
      base44.entities.Business.list("-created_date", 10),
    ]).then(([t, b]) => {
      setTokens(t);
      setBusinesses(b);
      if (b.length > 0) setSelectedBiz(b[0].id);
    });
  }, []);

  useEffect(() => {
    const unsub = base44.entities.Token.subscribe((event) => {
      if (event.type === "create") setTokens(prev => [event.data, ...prev]);
      else if (event.type === "update") setTokens(prev => prev.map(t => t.id === event.id ? event.data : t));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const bTokens = tokens.filter(t => t.business_id === selectedBiz);
  const serving = bTokens.filter(t => t.status === "called" || t.status === "serving");
  const waiting = bTokens.filter(t => t.status === "waiting").sort((a, b) => a.token_number - b.token_number);
  const nextUp = waiting.slice(0, 3);
  const business = businesses.find(b => b.id === selectedBiz);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  const formatTime = (d) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-space font-bold text-foreground">Queue Display</h1>
          <p className="text-sm text-muted-foreground mt-0.5">TV / Screen display for waiting area</p>
        </div>
        <div className="flex gap-2">
          {businesses.length > 1 && (
            <div className="flex gap-1 bg-muted rounded-xl p-1">
              {businesses.map(b => (
                <button key={b.id} onClick={() => setSelectedBiz(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedBiz === b.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                  {b.name}
                </button>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleFullscreen} className="gap-2">
            <Maximize2 className="w-4 h-4" /> Fullscreen
          </Button>
        </div>
      </div>

      {/* Display Board */}
      <div className="rounded-2xl overflow-hidden border border-border shadow-xl"
        style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a0533 50%, #0f0c29 100%)", minHeight: 520 }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-space font-bold text-sm">{business?.name || "SmartQueue"}</p>
              <p className="text-white/40 text-xs">{business?.type?.replace("_", " ") || "Queue Display"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
              <Wifi className="w-3.5 h-3.5" />
              <span>Live</span>
            </div>
            <p className="text-white/60 text-sm font-mono">{formatTime(time)}</p>
          </div>
        </div>

        <div className="p-8">
          {/* Now Serving */}
          <div className="mb-8">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-4 text-center">Now Serving</p>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(serving.length || 1, 3)}, 1fr)` }}>
              {serving.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <div className="w-20 h-20 rounded-full border-4 border-white/10 flex items-center justify-center mx-auto mb-3">
                    <Ticket className="w-10 h-10 text-white/20" />
                  </div>
                  <p className="text-white/30 text-sm">No tokens being served</p>
                </div>
              ) : (
                <AnimatePresence>
                  {serving.map(token => (
                    <motion.div key={token.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-2xl p-6 text-center"
                      style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(99,102,241,0.3) 100%)", border: "1px solid rgba(139,92,246,0.4)" }}>
                      <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Counter {token.counter_number || 1}</p>
                      <motion.p
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-6xl font-space font-black text-white leading-none"
                      >
                        {token.token_number}
                      </motion.p>
                      <p className="text-violet-300 text-sm mt-2 truncate">{token.customer_name}</p>
                      {token.service_type && <p className="text-white/40 text-xs mt-1">{token.service_type}</p>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Next Up */}
          {nextUp.length > 0 && (
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-3 text-center">Next in Queue</p>
              <div className="flex gap-3 justify-center flex-wrap">
                {nextUp.map((token, i) => (
                  <motion.div key={token.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <span className="text-2xl font-space font-bold text-white/80">#{token.token_number}</span>
                    <div>
                      <p className="text-white/60 text-xs">{token.customer_name}</p>
                      {token.service_type && <p className="text-white/30 text-xs">{token.service_type}</p>}
                    </div>
                    {i === 0 && <ChevronRight className="w-4 h-4 text-violet-400 ml-1" />}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Stats bar */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: "Waiting", value: waiting.length, color: "text-amber-400" },
              { label: "Serving", value: serving.length, color: "text-violet-400" },
              { label: "Avg Wait", value: `~${waiting.length * 15}m`, color: "text-sky-400" },
            ].map(s => (
              <div key={s.label} className="text-center py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                <p className={`text-2xl font-space font-bold ${s.color}`}>{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ticker */}
        <div className="px-8 py-3 border-t border-white/10 flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-violet-400 shrink-0" />
          <div className="text-white/40 text-xs overflow-hidden">
            <motion.p
              animate={{ x: [300, -1000] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="whitespace-nowrap"
            >
              🎉 Thank you for your patience · Token system powered by SmartQueue · Please keep your token safe · Kindly maintain silence in the waiting area
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}