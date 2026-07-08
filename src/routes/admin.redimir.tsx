import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Search, UserCheck, Gift, Send } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { ProfileRow, Reward } from "@/lib/types";
import { formatPoints } from "@/lib/format";
import { notifyRedemptionViaWhatsApp } from "@/lib/whatsapp";

export default function AdminRedimirPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<ProfileRow[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customPoints, setCustomPoints] = useState<number>(0);
  const [useCustom, setUseCustom] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("rewards").select("*").eq("active", true).order("points_cost"),
    ]).then(([p, r]) => {
      setClients((p.data ?? []) as ProfileRow[]);
      setRewards((r.data ?? []) as Reward[]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!query) return clients.slice(0, 20);
    const q = query.toLowerCase();
    return clients.filter(c =>
      (c.full_name ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().includes(q)
    ).slice(0, 20);
  }, [query, clients]);

  const client = clients.find(c => c.id === selectedClientId) ?? null;
  const reward = rewards.find(r => r.id === selectedRewardId) ?? null;
  const finalTitle = useCustom ? customTitle : (reward?.title ?? "");
  const finalPoints = useCustom ? customPoints : (reward?.points_cost ?? 0);
  const canSubmit = !!client && finalTitle.length > 0 && finalPoints > 0 && client.points_balance >= finalPoints;

  const submit = async () => {
    if (!client || !canSubmit) return;
    setSubmitting(true);
    const { data: tx, error } = await supabase.from("points_transactions").insert({
      profile_id: client.id,
      amount: -finalPoints,
      type: "canje",
      reason: `${finalTitle} (canje presencial)`,
      created_by: user?.id ?? null,
    }).select().single();

    if (error) { setSubmitting(false); toast.error(error.message); return; }

    await supabase.from("redemptions").insert({
      profile_id: client.id,
      reward_id: useCustom ? null : (reward?.id ?? null),
      reward_title: finalTitle,
      points_cost: finalPoints,
      transaction_id: tx?.id ?? null,
      status: "entregado",
      notes: "Canje realizado presencialmente en el atelier.",
    });

    setSubmitting(false);
    toast.success("Redención registrada");

    await notifyRedemptionViaWhatsApp({
      clientName: client.full_name || client.email || "Cliente",
      clientPhone: client.phone,
      rewardTitle: finalTitle,
      points: finalPoints,
      manual: true,
    });

    // reset
    setSelectedClientId(null);
    setSelectedRewardId(null);
    setCustomTitle("");
    setCustomPoints(0);
    setUseCustom(false);
    // reload balance
    const { data: p } = await supabase.from("profiles").select("*").order("full_name");
    setClients((p ?? []) as ProfileRow[]);
  };

  return (
    <div className="flex flex-col gap-10">
      <Helmet><title>Redimir presencial — Admin Deluxe</title></Helmet>
      <PageHeader
        eyebrow="Redimir presencial"
        title={<>Canjes en el <em className="italic">atelier.</em></>}
        description="Registra una redención cuando el cliente viene físicamente a la tienda."
        showAvatar={false}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Cliente */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-serif text-xl font-semibold">1. Selecciona cliente</h3>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, correo o teléfono" value={query}
                onChange={(e) => setQuery(e.target.value)} className="rounded-full pl-9" />
            </div>
            <ul className="mt-4 max-h-96 divide-y divide-border overflow-y-auto rounded-2xl border border-border">
              {filtered.map(c => (
                <li key={c.id}>
                  <button onClick={() => setSelectedClientId(c.id)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                      selectedClientId === c.id ? "bg-primary/10" : "hover:bg-secondary"
                    }`}>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.full_name || "Sin nombre"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.email ?? "—"}{c.phone ? ` · ${c.phone}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold">
                      {formatPoints(c.points_balance ?? 0)} pts
                    </span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">Sin resultados</li>
              )}
            </ul>
          </section>

          {/* Recompensa + confirmación */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-serif text-xl font-semibold">2. Elige la recompensa</h3>

            <div className="mt-4 flex items-center gap-3 text-xs">
              <button onClick={() => setUseCustom(false)}
                className={`rounded-full px-4 py-1.5 font-medium transition ${!useCustom ? "bg-ink text-ink-foreground" : "bg-secondary text-muted-foreground"}`}>
                Del catálogo
              </button>
              <button onClick={() => setUseCustom(true)}
                className={`rounded-full px-4 py-1.5 font-medium transition ${useCustom ? "bg-ink text-ink-foreground" : "bg-secondary text-muted-foreground"}`}>
                Recompensa libre
              </button>
            </div>

            {!useCustom ? (
              <select value={selectedRewardId ?? ""} onChange={(e) => setSelectedRewardId(e.target.value || null)}
                className="mt-4 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="">— Selecciona una recompensa —</option>
                {rewards.map(r => (
                  <option key={r.id} value={r.id}>{r.title} — {formatPoints(r.points_cost)} pts</option>
                ))}
              </select>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <Label>Título</Label>
                  <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ej: Ramo primaveral" className="mt-1.5" />
                </div>
                <div>
                  <Label>Puntos a descontar</Label>
                  <Input type="number" min={1} value={customPoints || ""}
                    onChange={(e) => setCustomPoints(parseInt(e.target.value) || 0)} className="mt-1.5" />
                </div>
              </div>
            )}

            {client && (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs uppercase tracking-wider text-primary">Resumen</p>
                <p className="mt-1 font-medium">{client.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  Saldo: {formatPoints(client.points_balance ?? 0)} pts · A descontar: {formatPoints(finalPoints)} pts
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nuevo saldo: <strong className={client.points_balance < finalPoints ? "text-destructive" : "text-forest"}>
                    {formatPoints((client.points_balance ?? 0) - finalPoints)} pts
                  </strong>
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button disabled={!canSubmit || submitting} onClick={submit}
                className="rounded-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Registrar redención</>}
              </Button>
            </div>

            {client && client.points_balance < finalPoints && finalPoints > 0 && (
              <p className="mt-2 text-right text-xs text-destructive">
                Saldo insuficiente. Faltan {formatPoints(finalPoints - client.points_balance)} pts.
              </p>
            )}
          </section>
        </div>
      )}

      {!loading && !clients.length && (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <UserCheck className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Aún no hay clientes registrados.</p>
        </div>
      )}
      {!loading && !rewards.length && (
        <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <Gift className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-xs text-muted-foreground">Tip: crea recompensas en el catálogo, o usa "Recompensa libre".</p>
        </div>
      )}
    </div>
  );
}
