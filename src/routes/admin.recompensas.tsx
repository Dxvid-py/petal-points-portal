import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Loader2, Pencil, Trash2, Gift } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import type { Reward } from "@/lib/types";
import { formatPoints } from "@/lib/format";
import { toast } from "sonner";

const empty: Omit<Reward, "id"> = {
  title: "",
  description: "",
  points_cost: 100,
  image_url: "",
  category: "",
  active: true,
};

export default function AdminRecompensasPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reward | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("rewards")
      .select("*")
      .order("points_cost", { ascending: true });
    setRewards((data ?? []) as Reward[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (r: Reward) => {
    setEditing(r);
    setForm({
      title: r.title,
      description: r.description ?? "",
      points_cost: r.points_cost,
      image_url: r.image_url ?? "",
      category: r.category ?? "",
      active: r.active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    if (!form.points_cost || form.points_cost <= 0) {
      toast.error("Define un costo en puntos válido");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      points_cost: Number(form.points_cost),
      image_url: form.image_url?.trim() || null,
      category: form.category?.trim() || null,
      active: form.active,
    };
    const { error } = editing
      ? await supabase.from("rewards").update(payload).eq("id", editing.id)
      : await supabase.from("rewards").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Recompensa actualizada" : "Recompensa creada");
    setOpen(false);
    load();
  };

  const remove = async (r: Reward) => {
    if (!confirm(`¿Eliminar "${r.title}"?`)) return;
    const { error } = await supabase.from("rewards").delete().eq("id", r.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Recompensa eliminada");
    load();
  };

  const toggleActive = async (r: Reward) => {
    const { error } = await supabase
      .from("rewards")
      .update({ active: !r.active })
      .eq("id", r.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    load();
  };

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Recompensas — Admin Deluxe</title>
      </Helmet>
      <PageHeader
        eyebrow="Recompensas"
        title={
          <>
            Catálogo del <em className="italic">club.</em>
          </>
        }
        description="Crea, edita y desactiva las recompensas que pueden canjear los clientes."
        showAvatar={false}
      />

      <div className="flex justify-end">
        <Button onClick={openNew} className="rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground">
          <Plus className="h-4 w-4" /> Nueva recompensa
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : rewards.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Gift className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-serif text-xl text-foreground">Aún sin recompensas</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea la primera recompensa para que tus clientes puedan canjear puntos.
          </p>
        </div>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((r) => (
            <article
              key={r.id}
              className={`overflow-hidden rounded-3xl border bg-card shadow-soft transition-all ${
                r.active ? "border-border" : "border-border/40 opacity-70"
              }`}
            >
              <div className="relative aspect-[5/4] bg-muted">
                {r.image_url ? (
                  <img src={r.image_url} alt={r.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-bone">
                    <Gift className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                {r.category && (
                  <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground backdrop-blur">
                    {r.category}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg font-semibold text-foreground">{r.title}</h3>
                {r.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="font-serif text-lg text-foreground">
                    {formatPoints(r.points_cost)} <span className="text-xs text-muted-foreground">pts</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch checked={r.active} onCheckedChange={() => toggleActive(r)} />
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(r)}>
                      <Trash2 className="h-3.5 w-3.5 text-terracotta" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? "Editar recompensa" : "Nueva recompensa"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="desc">Descripción</Label>
              <Textarea
                id="desc"
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1.5"
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cost">Costo en puntos *</Label>
                <Input
                  id="cost"
                  type="number"
                  min="1"
                  value={form.points_cost}
                  onChange={(e) => setForm({ ...form, points_cost: Number(e.target.value) })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="cat">Categoría</Label>
                <Input
                  id="cat"
                  value={form.category ?? ""}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Flores, Aseo..."
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="img">URL de imagen</Label>
              <Input
                id="img"
                value={form.image_url ?? ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
                className="mt-1.5"
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-secondary/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Activa</p>
                <p className="text-xs text-muted-foreground">Visible para los clientes</p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-primary text-primary-foreground hover:bg-gold"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
