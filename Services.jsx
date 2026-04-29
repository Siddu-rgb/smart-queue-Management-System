import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Briefcase, Clock, DollarSign, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Services() {
  const [services, setServices] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedBiz, setSelectedBiz] = useState("");
  const [form, setForm] = useState({ name: "", duration: 15, price: 0, description: "" });

  useEffect(() => {
    Promise.all([
      base44.entities.Service.list("-created_date", 100),
      base44.entities.Business.list("-created_date", 20),
    ]).then(([s, b]) => {
      setServices(s);
      setBusinesses(b);
      if (b.length > 0) setSelectedBiz(b[0].id);
      setLoading(false);
    });
  }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", duration: 15, price: 0, description: "" }); setShowDialog(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, duration: s.duration, price: s.price, description: s.description }); setShowDialog(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error("Service name required"); return; }
    if (editing) {
      await base44.entities.Service.update(editing.id, form);
      setServices(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
      toast.success("Service updated");
    } else {
      const s = await base44.entities.Service.create({ ...form, business_id: selectedBiz, is_active: true });
      setServices(prev => [s, ...prev]);
      toast.success("Service added");
    }
    setShowDialog(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Service.delete(id);
    setServices(prev => prev.filter(s => s.id !== id));
    toast.success("Service deleted");
  };

  const handleToggle = async (s) => {
    await base44.entities.Service.update(s.id, { is_active: !s.is_active });
    setServices(prev => prev.map(x => x.id === s.id ? { ...x, is_active: !s.is_active } : x));
  };

  const filtered = services.filter(s => s.business_id === selectedBiz);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-space font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your service catalog</p>
        </div>
        <Button className="gradient-primary text-white border-0 gap-2" onClick={openNew}>
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      {businesses.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {businesses.map(b => (
            <button key={b.id} onClick={() => setSelectedBiz(b.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${selectedBiz === b.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}>
              {b.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No services yet</p>
          <Button variant="outline" className="mt-3" onClick={openNew}>Add your first service</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleToggle(s)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    {s.is_active
                      ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                      : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Trash2 className="w-4 h-4 text-destructive/70" />
                  </button>
                </div>
              </div>
              <h3 className="mt-3 font-semibold text-foreground">{s.name}</h3>
              {s.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>}
              <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration}m</span>
                {s.price > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />₹{s.price}</span>}
                <span className={`ml-auto font-medium ${s.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {s.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-space">{editing ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Service Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Haircut, Consultation…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Duration (min)</label>
                <Input type="number" min={1} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Price (₹)</label>
                <Input type="number" min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" />
            </div>
            <Button className="w-full gradient-primary text-white border-0" onClick={handleSave}>
              {editing ? "Save Changes" : "Add Service"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}