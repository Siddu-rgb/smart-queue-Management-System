import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  Building2, Plus, Edit2, Trash2, Save, Clock, Users,
  MapPin, Phone, Mail, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const BIZ_TYPES = ["salon", "clinic", "pharmacy", "repair_shop", "store", "other"];

export default function Settings() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "", type: "salon", address: "", city: "", phone: "", email: "",
    opening_time: "09:00", closing_time: "18:00", avg_service_time: 15,
    max_capacity: 50, counters: 1
  });

  useEffect(() => {
    base44.entities.Business.list("-created_date", 20).then(b => {
      setBusinesses(b); setLoading(false);
    });
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", type: "salon", address: "", city: "", phone: "", email: "", opening_time: "09:00", closing_time: "18:00", avg_service_time: 15, max_capacity: 50, counters: 1 });
    setShowDialog(true);
  };

  const openEdit = (b) => {```
    setEditing(b);
    setForm({ name: b.name, type: b.type, address: b.address, city: b.city, phone: b.phone, email: b.email, opening_time: b.opening_time || "09:00", closing_time: b.closing_time || "18:00", avg_service_time: b.avg_service_time || 15, max_capacity: b.max_capacity || 50, counters: b.counters || 1 });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error("Business name required"); return; }
    if (editing) {
      await base44.entities.Business.update(editing.id, { ...form, is_active: true });
      setBusinesses(prev => prev.map(b => b.id === editing.id ? { ...b, ...form } : b));
      toast.success("Business updated");
    } else {
      const b = await base44.entities.Business.create({ ...form, is_active: true, subscription_plan: "free" });
      setBusinesses(prev => [b, ...prev]);
      toast.success("Business added");
    }
    setShowDialog(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Business.delete(id);
    setBusinesses(prev => prev.filter(b => b.id !== id));
    toast.success("Business removed");
  };

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-space font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your business locations</p>
        </div>
        <Button className="gradient-primary text-white border-0 gap-2" onClick={openNew}>
          <Plus className="w-4 h-4" /> Add Business
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No businesses registered</p>
          <Button variant="outline" className="mt-3" onClick={openNew}>Register your first business</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white text-lg font-bold">
                    {b.name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-space font-semibold text-foreground">{b.name}</h2>
                    <p className="text-xs text-muted-foreground capitalize">{b.type?.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => openEdit(b)}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-destructive hover:text-destructive" onClick={() => handleDelete(b.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: MapPin, label: b.address || "No address", sub: b.city },
                  { icon: Phone, label: b.phone || "No phone" },
                  { icon: Clock, label: `${b.opening_time || "09:00"} – ${b.closing_time || "18:00"}` },
                  { icon: Hash, label: `${b.counters || 1} counter(s)`, sub: `${b.avg_service_time || 15}m avg service` },
                ].map((item, j) => (
                  <div key={j} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/50">
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-foreground">{item.label}</p>
                      {item.sub && <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-space">{editing ? "Edit Business" : "Register Business"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Business Name *</label>
                <Input value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. Sharma Salon" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
                <Select value={form.type} onValueChange={v => f("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BIZ_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">City</label>
                <Input value={form.city} onChange={e => f("city", e.target.value)} placeholder="Mumbai" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</label>
                <Input value={form.address} onChange={e => f("address", e.target.value)} placeholder="Shop address" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
                <Input value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <Input value={form.email} onChange={e => f("email", e.target.value)} placeholder="business@email.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Opening Time</label>
                <Input type="time" value={form.opening_time} onChange={e => f("opening_time", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Closing Time</label>
                <Input type="time" value={form.closing_time} onChange={e => f("closing_time", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Avg Service (min)</label>
                <Input type="number" min={1} value={form.avg_service_time} onChange={e => f("avg_service_time", Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Counters</label>
                <Input type="number" min={1} value={form.counters} onChange={e => f("counters", Number(e.target.value))} />
              </div>
            </div>
            <Button className="w-full gradient-primary text-white border-0 gap-2" onClick={handleSave}>
              <Save className="w-4 h-4" /> {editing ? "Save Changes" : "Register Business"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}