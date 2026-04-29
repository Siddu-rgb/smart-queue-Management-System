import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, UserCheck, Phone, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const ROLES = ["receptionist", "technician", "doctor", "manager"];

const roleColors = {
  receptionist: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  technician: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  doctor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  manager: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedBiz, setSelectedBiz] = useState("");
  const [form, setForm] = useState({ name: "", role: "receptionist", counter_number: 1, phone: "" });

  useEffect(() => {
    Promise.all([
      base44.entities.Staff.list("-created_date", 100),
      base44.entities.Business.list("-created_date", 20),
    ]).then(([s, b]) => {
      setStaff(s); setBusinesses(b);
      if (b.length > 0) setSelectedBiz(b[0].id);
      setLoading(false);
    });
  }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", role: "receptionist", counter_number: 1, phone: "" }); setShowDialog(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, role: s.role, counter_number: s.counter_number, phone: s.phone }); setShowDialog(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    if (editing) {
      await base44.entities.Staff.update(editing.id, form);
      setStaff(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
      toast.success("Staff updated");
    } else {
      const s = await base44.entities.Staff.create({ ...form, business_id: selectedBiz, is_active: true, tokens_served_today: 0 });
      setStaff(prev => [s, ...prev]);
      toast.success("Staff added");
    }
    setShowDialog(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Staff.delete(id);
    setStaff(prev => prev.filter(s => s.id !== id));
    toast.success("Staff removed");
  };

  const filtered = staff.filter(s => s.business_id === selectedBiz);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-space font-bold text-foreground">Staff Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage counters and team members</p>
        </div>
        <Button className="gradient-primary text-white border-0 gap-2" onClick={openNew}>
          <Plus className="w-4 h-4" /> Add Staff
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
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <UserCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No staff members yet</p>
          <Button variant="outline" className="mt-3" onClick={openNew}>Add first staff member</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-base">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{s.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleColors[s.role] || roleColors.receptionist}`}>
                      {s.role}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {s.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> {s.phone}
                  </p>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Hash className="w-3 h-3" /> Counter {s.counter_number}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-xs text-muted-foreground">Served today</span>
                  <span className="text-xs font-bold text-primary">{s.tokens_served_today || 0}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-space">{editing ? "Edit Staff" : "Add Staff Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Staff name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role</label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Counter No.</label>
                <Input type="number" min={1} value={form.counter_number} onChange={e => setForm(f => ({ ...f, counter_number: Number(e.target.value) }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
            </div>
            <Button className="w-full gradient-primary text-white border-0" onClick={handleSave}>
              {editing ? "Save Changes" : "Add Staff Member"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}