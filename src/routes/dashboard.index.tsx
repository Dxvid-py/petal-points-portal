import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles, ShoppingBag, Gift, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PointsTransaction, Reward } from "@/lib/types";
import { formatPoints, formatDate, formatCOP } from "@/lib/format";
import { POINTS_PER_COP } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function DashboardHome() {
  const { profile, user } = useAuth();
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [topRewards, setTopRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase
        .from("points_transactions")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("rewards")
        .select("*")
        .eq("active", true)
        .order("points_cost", { ascending: true })
        .limit(3),
    ]).then(([txRes, rwRes]) => {
      setTransactions((txRes.data ?? []) as PointsTransaction[]);
      setTopRewards((rwRes.data ?? []) as Reward[]);
      setLoading(false);
    });
  }, [user]);

  const balance = profile?.points_balance ?? 0;
  const greeting =
    profile?.display_name?.trim() ||
    profile?.full_name?.trim() ||
    profile?.email?.split("@")[0] ||
    "amiga";
  const equivalent = balance * POINTS_PER_COP;

  const totalEarned = transactions
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const totalRedeemed = Math.abs(
    transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0),
  );

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Mi Atelier — Puntos Deluxe</title>
      </Helmet>
      <PageHeader
        eyebrow="Mi atelier"
        title={
          <>
            Hola, <em className="italic">{greeting}</em>.<br />
            Bienvenida al club.
          </>
        }
        description={`Tu balance equivale a ${formatCOP(equivalent)} en compras realizadas con nosotros.`}
      />

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-ink p-8 text-white shadow-ink lg:col-span-3 md:p-10">
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white">
                <Sparkles className="h-3 w-3" />
                Club Deluxe
              </span>
            </div>

            <h2 className="mt-8 font-serif text-7xl font-light leading-none tracking-tight text-white md:text-8xl">
              {formatPoints(balance)}
              <span className="ml-3 align-top font-serif text-base italic font-normal text-white/70">
                puntos
              </span>
            </h2>

            <p className="mt-6 max-w-md text-sm text-white/85">
              Equivale a{" "}
              <span className="font-serif text-base text-white">{formatCOP(equivalent)}</span>{" "}
              en compras realizadas. Cada $1.760 COP se convierte en 1 punto.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-terracotta px-6 text-terracotta-foreground hover:bg-terracotta/90"
              >
                <Link to="/dashboard/recompensas">
                  Canjear puntos
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/dashboard/perfil">Ver mi perfil</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:col-span-2">
          <article className="flex items-start justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Puntos ganados
              </p>
              <p className="mt-3 font-serif text-4xl font-semibold text-foreground">
                +{formatPoints(totalEarned)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Histórico</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-forest">
              <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </article>
          <article className="flex items-start justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Canjeados
              </p>
              <p className="mt-3 font-serif text-4xl font-semibold text-foreground">
                {formatPoints(totalRedeemed)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Recompensas obtenidas</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blush text-blush-foreground">
              <Gift className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </article>
          <article className="flex items-start justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Movimientos
              </p>
              <p className="mt-3 font-serif text-4xl font-semibold text-foreground">
                {transactions.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Recientes</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/30 text-gold-foreground">
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </article>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-terracotta">Movimientos</p>
              <h3 className="mt-1 font-serif text-2xl font-semibold text-foreground">
                Actividad reciente
              </h3>
            </div>
            <Link to="/dashboard/compras" className="text-xs text-muted-foreground hover:text-foreground">
              Ver todo →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center">
              <p className="font-serif text-lg text-foreground">Aún sin movimientos</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cuando hagas tu primera compra, una asesora cargará tus puntos aquí.
              </p>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-border/60">
              {transactions.map((tx) => {
                const positive = tx.amount > 0;
                return (
                  <li key={tx.id} className="flex items-center gap-4 py-4">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        positive ? "bg-primary-soft text-forest" : "bg-blush text-blush-foreground"
                      }`}
                    >
                      {positive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <Gift className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {tx.reason ?? (positive ? "Compra registrada" : "Canje de recompensa")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.created_at)} · {tx.type}
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
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.24em] text-terracotta">Disponibles</p>
          <h3 className="mt-1 font-serif text-2xl font-semibold text-foreground">Recompensas</h3>

          {topRewards.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Aún no hay recompensas activas.
            </p>
          ) : (
            <ul className="mt-5 space-y-4">
              {topRewards.map((r) => {
                const affordable = balance >= r.points_cost;
                return (
                  <li key={r.id} className="rounded-2xl bg-secondary/40 p-3">
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-serif text-base text-foreground">
                        {formatPoints(r.points_cost)} pts
                      </span>
                      <span
                        className={`text-xs ${affordable ? "text-forest" : "text-muted-foreground"}`}
                      >
                        {affordable ? "Disponible" : `Faltan ${r.points_cost - balance}`}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <Button
            asChild
            variant="outline"
            className="mt-5 w-full rounded-full border-gold/40 text-foreground hover:bg-gold/10"
          >
            <Link to="/dashboard/recompensas">Ver catálogo</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
