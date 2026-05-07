import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Gift, Trash2, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { formatDateTime, formatPoints } from "@/lib/format";
import { toast } from "sonner";

type Status = "pendiente" | "en_proceso" | "listo" | "entregado" | "cancelado";

interface Row {
  id: string;
  profile_id: string;
  reward_title: string;
  points_cost: number;
  status: Status;
  estimated_delivery: string | null;
  notes: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string | null; phone: string | null; address: string | null } | null;
}

const statusLabels: Record<Status, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  listo: "Listo para entrega",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
const statusColors: Record<Status, string> = {
  pendiente: "bg-gold/20 text-gold-foreground",
  en_proceso: "bg-blush text-blush-foreground",
  listo: "bg-forest/20 text-forest",
  entregado: "bg-secondary text-muted-foreground",
  cancelado: "bg-terracotta/20 text-terracotta",
};

export default function AdminCanjesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("redemptions")
      .select("id, profile_id, reward_title, points_cost, status, estimated_delivery, notes, created_at, profiles(full_name,email,phone,address)")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRow = async (id: string, patch: Partial<Row>) => {
    const { error } = await supabase.from("redemptions").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este canje del registro? (no devuelve puntos)")) return;
    const { error } = await supabase.from("redemptions").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Canje eliminado");
    load();
  };

  return (
    <div className="flex flex-col gap-10">
      <Helmet><title>Canjes — Admin Deluxe</title></Helmet>
      <PageHeader
        eyebrow="Canjes"
        title={<>Pedidos de <em className="italic">recompensas.</em></>}
        description="Gestiona el estado y la fecha estimada de entrega de cada canje."
        showAvatar={false}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Gift className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-serif text-xl text-foreground">Sin canjes aún</p>
          <p className="mt-2 text-sm text-muted-foreground">Cuando un cliente canjee aparecerá aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <article key={r.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-serif text-xl font-semibold text-foreground">{r.reward_title}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.profiles?.full_name ?? "Cliente"} · {r.profiles?.email ?? "—"}
                  </p>
                  {(r.profiles?.phone || r.profiles?.address) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.profiles?.phone ?? ""}{r.profiles?.phone && r.profiles?.address ? " · " : ""}{r.profiles?.address ?? ""}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(r.created_at)} · −{formatPoints(r.points_cost)} pts
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${statusColors[r.status]}`}>
                  {statusLabels[r.status]}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-xs">Estado</Label>
                  <select
                    value={r.status}
                    onChange={(e) => updateRow(r.id, { status: e.target.value as Status })}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    {(Object.keys(statusLabels) as Status[]).map((s) => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Entrega estimada</Label>
                  <Input type="date" value={r.estimated_delivery ?? ""}
                    onChange={(e) => updateRow(r.id, { estimated_delivery: e.target.value || null })}
                    className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Nota</Label>
                  <Input value={r.notes ?? ""}
                    onBlur={(e) => updateRow(r.id, { notes: e.target.value || null })}
                    onChange={(e) => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, notes: e.target.value } : x))}
                    placeholder="Información extra" className="mt-1.5" />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                {r.profiles?.phone && (
                  <a
                    href={`https://wa.me/${r.profiles.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hola ${r.profiles?.full_name ?? ""}, te escribimos de Floristería Deluxe sobre tu canje "${r.reward_title}". Estado actual: ${statusLabels[r.status]}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-forest/90"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                )}
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}
                  className="rounded-full text-terracotta hover:bg-terracotta/10">
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
