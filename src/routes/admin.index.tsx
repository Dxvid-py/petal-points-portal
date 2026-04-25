import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Users, Gift, History, Image as ImageIcon, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatPoints, formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/PageHeader";

interface Stats {
  clients: number;
  rewards: number;
  gallery: number;
  transactions: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
}

interface RecentTx {
  id: string;
  amount: number;
  type: string;
  reason: string | null;
  created_at: string;
  profile_id: string;
  profiles: { full_name: string | null; nit_id: string | null } | null;
}

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentTx[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("rewards").select("id", { count: "exact", head: true }),
      supabase.from("gallery_items").select("id", { count: "exact", head: true }),
      supabase.from("points_transactions").select("amount"),
      supabase
        .from("points_transactions")
        .select("id, amount, type, reason, created_at, profile_id, profiles(full_name, nit_id)")
        .order("created_at", { ascending: false })
        .limit(8),
    ]).then(([c, r, g, allTx, recentTx]) => {
      const txs = (allTx.data ?? []) as { amount: number }[];
      const issued = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const redeemed = Math.abs(txs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));
      setStats({
        clients: c.count ?? 0,
        rewards: r.count ?? 0,
        gallery: g.count ?? 0,
        transactions: txs.length,
        totalPointsIssued: issued,
        totalPointsRedeemed: redeemed,
      });
      setRecent((recentTx.data ?? []) as unknown as RecentTx[]);
    });
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { label: "Clientes registrados", value: stats.clients, icon: Users, to: "/admin/clientes", color: "bg-primary-soft text-forest" },
    { label: "Recompensas activas", value: stats.rewards, icon: Gift, to: "/admin/recompensas", color: "bg-blush text-blush-foreground" },
    { label: "Fotos en galería", value: stats.gallery, icon: ImageIcon, to: "/admin/galeria", color: "bg-gold/30 text-gold-foreground" },
    { label: "Transacciones", value: stats.transactions, icon: History, to: "/admin/transacciones", color: "bg-secondary text-foreground" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Panel Admin — Puntos Deluxe</title>
      </Helmet>
      <PageHeader
        eyebrow="Panel administrador"
        title={
          <>
            Floristería Deluxe <em className="italic">en cifras.</em>
          </>
        }
        description="Vista general del programa de fidelización."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="group rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-full ${c.color}`}>
              <c.icon className="h-4 w-4" />
            </span>
            <p className="mt-4 font-serif text-3xl font-semibold text-foreground">
              {formatPoints(c.value)}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {c.label}
            </p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-gradient-ink p-6 text-primary-foreground shadow-ink">
          <p className="text-[10px] uppercase tracking-[0.24em] text-primary-foreground/60">
            Puntos emitidos
          </p>
          <p className="mt-3 font-serif text-4xl font-semibold">
            +{formatPoints(stats.totalPointsIssued)}
          </p>
          <p className="mt-2 text-xs text-primary-foreground/70">Histórico total</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.24em] text-terracotta">Canjeados</p>
          <p className="mt-3 font-serif text-4xl font-semibold text-terracotta">
            {formatPoints(stats.totalPointsRedeemed)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">En recompensas</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">En circulación</p>
          <p className="mt-3 font-serif text-4xl font-semibold text-forest">
            {formatPoints(stats.totalPointsIssued - stats.totalPointsRedeemed)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Pendientes por canjear</p>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-baseline justify-between">
          <h3 className="font-serif text-2xl font-semibold text-foreground">
            Movimientos recientes
          </h3>
          <Link to="/admin/transacciones" className="text-xs text-muted-foreground hover:text-foreground">
            Ver todo →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Aún no hay movimientos registrados.</p>
        ) : (
          <ul className="mt-5 divide-y divide-border/60">
            {recent.map((tx) => {
              const positive = tx.amount > 0;
              return (
                <li key={tx.id} className="flex items-center gap-4 py-4">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      positive ? "bg-primary-soft text-forest" : "bg-blush text-blush-foreground"
                    }`}
                  >
                    {positive ? <TrendingUp className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {tx.profiles?.full_name ?? "Cliente"}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {tx.profiles?.nit_id ?? "—"}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.reason ?? tx.type} · {formatDateTime(tx.created_at)}
                    </p>
                  </div>
                  <span
                    className={`font-serif text-base font-semibold ${
                      positive ? "text-forest" : "text-terracotta"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {tx.amount}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
