import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search, Package, Loader2, TrendingUp, Gift } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { PointsTransaction } from "@/lib/types";
import { formatDateTime, formatPoints } from "@/lib/format";

export default function PurchasesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const [txs, setTxs] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("points_transactions")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTxs((data ?? []) as PointsTransaction[]);
        setLoading(false);
      });
  }, [user]);

  const filtered = txs.filter((t) => {
    const matchesQ =
      query === "" ||
      (t.reason ?? "").toLowerCase().includes(query.toLowerCase()) ||
      t.type.toLowerCase().includes(query.toLowerCase());
    const matchesF =
      filter === "all" || (filter === "in" ? t.amount > 0 : t.amount < 0);
    return matchesQ && matchesF;
  });

  const totalIn = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = Math.abs(txs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Mis movimientos — Puntos Deluxe</title>
      </Helmet>
      <PageHeader
        eyebrow="Mis movimientos"
        title={
          <>
            Tu historial <em className="italic">de puntos.</em>
          </>
        }
        description="Cada compra que has registrado y cada recompensa que has canjeado."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Puntos ganados
          </p>
          <p className="mt-2 font-serif text-3xl font-semibold text-forest">
            +{formatPoints(totalIn)}
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Canjeados</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-terracotta">
            {formatPoints(totalOut)}
          </p>
        </article>
        <article className="rounded-3xl bg-gradient-ink p-6 text-primary-foreground shadow-ink">
          <p className="text-[10px] uppercase tracking-[0.24em] text-primary-foreground/60">
            Movimientos
          </p>
          <p className="mt-2 font-serif text-3xl font-semibold">{txs.length}</p>
        </article>
      </section>

      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por motivo o tipo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-full pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { k: "all", label: "Todos" },
              { k: "in", label: "Ganados" },
              { k: "out", label: "Canjeados" },
            ] as const
          ).map((s) => (
            <button
              key={s.k}
              onClick={() => setFilter(s.k)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                filter === s.k
                  ? "bg-ink text-ink-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-serif text-lg text-foreground">Sin movimientos aún</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuando hagas una compra, tu asesora cargará los puntos aquí.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((tx) => {
              const positive = tx.amount > 0;
              const Icon = positive ? TrendingUp : Gift;
              return (
                <li key={tx.id} className="flex items-center gap-4 px-6 py-5">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      positive ? "bg-primary-soft text-forest" : "bg-blush text-blush-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {tx.reason ?? (positive ? "Carga de puntos" : "Canje de recompensa")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(tx.created_at)} · {tx.type}
                    </p>
                  </div>
                  <span
                    className={`font-serif text-lg font-semibold ${
                      positive ? "text-forest" : "text-terracotta"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {tx.amount} pts
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
