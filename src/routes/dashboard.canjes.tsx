import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Gift, Calendar } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { formatDate, formatDateTime, formatPoints } from "@/lib/format";

type Status = "pendiente" | "en_proceso" | "listo" | "entregado" | "cancelado";

interface Row {
  id: string;
  reward_title: string;
  points_cost: number;
  status: Status;
  estimated_delivery: string | null;
  notes: string | null;
  created_at: string;
}

const statusLabels: Record<Status, string> = {
  pendiente: "Pendiente",
  en_proceso: "En preparación",
  listo: "Listo para entrega",
  entregado: "Entregado ✓",
  cancelado: "Cancelado",
};
const statusColors: Record<Status, string> = {
  pendiente: "bg-gold/20 text-gold-foreground",
  en_proceso: "bg-blush text-blush-foreground",
  listo: "bg-forest/20 text-forest",
  entregado: "bg-secondary text-muted-foreground",
  cancelado: "bg-terracotta/20 text-terracotta",
};

export default function DashboardCanjesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("redemptions")
      .select("id, reward_title, points_cost, status, estimated_delivery, notes, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data ?? []) as Row[]);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="flex flex-col gap-10">
      <Helmet><title>Mis canjes — Puntos Deluxe</title></Helmet>
      <PageHeader
        eyebrow="Mis canjes"
        title={<>Estado de tus <em className="italic">recompensas.</em></>}
        description="Aquí ves el avance de los canjes que has solicitado y la fecha estimada de entrega."
      />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Gift className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-serif text-xl text-foreground">Aún no tienes canjes</p>
          <p className="mt-2 text-sm text-muted-foreground">Visita el catálogo para canjear tu primera recompensa.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-xl font-semibold text-foreground">{r.reward_title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Solicitado: {formatDateTime(r.created_at)} · −{formatPoints(r.points_cost)} pts
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${statusColors[r.status]}`}>
                  {statusLabels[r.status]}
                </span>
              </div>
              {r.estimated_delivery && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  Entrega estimada: <span className="font-medium">{formatDate(r.estimated_delivery)}</span>
                </p>
              )}
              {r.notes && <p className="mt-2 text-sm text-muted-foreground">📝 {r.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
