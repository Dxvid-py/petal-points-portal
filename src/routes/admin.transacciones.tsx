import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search, Loader2, History, TrendingUp, Gift } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { formatDateTime, formatPoints } from "@/lib/format";

interface TxRow {
  id: string;
  amount: number;
  type: string;
  reason: string | null;
  created_at: string;
  profile_id: string;
  profiles: { full_name: string | null; nit_id: string | null; email: string | null } | null;
}

export default function AdminTransaccionesPage() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");

  useEffect(() => {
    supabase
      .from("points_transactions")
      .select("id, amount, type, reason, created_at, profile_id, profiles(full_name, nit_id, email)")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setRows((data ?? []) as unknown as TxRow[]);
        setLoading(false);
      });
  }, []);

  const filtered = rows.filter((r) => {
    const q = query.toLowerCase();
    const matchesQ =
      !q ||
      (r.profiles?.full_name ?? "").toLowerCase().includes(q) ||
      (r.profiles?.nit_id ?? "").toLowerCase().includes(q) ||
      (r.reason ?? "").toLowerCase().includes(q);
    const matchesF =
      filter === "all" || (filter === "in" ? r.amount > 0 : r.amount < 0);
    return matchesQ && matchesF;
  });

  const totalIn = rows.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const totalOut = Math.abs(rows.filter((r) => r.amount < 0).reduce((s, r) => s + r.amount, 0));

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Transacciones — Admin Deluxe</title>
      </Helmet>
      <PageHeader
        eyebrow="Transacciones"
        title={
          <>
            Todos los <em className="italic">movimientos.</em>
          </>
        }
        description="Historial completo de cargas y canjes del programa."
        showAvatar={false}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Emitidos</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-forest">+{formatPoints(totalIn)}</p>
        </article>
        <article className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Canjeados</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-terracotta">{formatPoints(totalOut)}</p>
        </article>
        <article className="rounded-3xl bg-gradient-ink p-6 text-primary-foreground shadow-ink">
          <p className="text-[10px] uppercase tracking-[0.24em] text-primary-foreground/60">Total movimientos</p>
          <p className="mt-2 font-serif text-3xl font-semibold">{rows.length}</p>
        </article>
      </section>

      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente, NIT o motivo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-full pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { k: "all", label: "Todos" },
              { k: "in", label: "Cargas" },
              { k: "out", label: "Canjes" },
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
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-serif text-lg text-foreground">Sin transacciones</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((tx) => {
              const positive = tx.amount > 0;
              const Icon = positive ? TrendingUp : Gift;
              return (
                <li key={tx.id} className="flex items-center gap-4 px-6 py-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      positive ? "bg-primary-soft text-forest" : "bg-blush text-blush-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {tx.profiles?.full_name ?? "Cliente"}{" "}
                      <span className="ml-1 font-mono text-[11px] text-muted-foreground">
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
