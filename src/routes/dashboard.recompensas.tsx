import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Filter, Lock, ArrowUpRight, Loader2, Gift, ShoppingBag, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Reward } from "@/lib/types";
import { formatPoints } from "@/lib/format";
import { notifyRedemptionViaWhatsApp } from "@/lib/whatsapp";


export default function RewardsPage() {
  const { profile, user, refreshProfile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>("Todas");
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const userPoints = profile?.points_balance ?? 0;

  useEffect(() => {
    supabase
      .from("rewards")
      .select("*")
      .eq("active", true)
      .order("points_cost", { ascending: true })
      .then(({ data }) => {
        setRewards((data ?? []) as Reward[]);
        setLoading(false);
      });
  }, []);

  const categories = ["Todas", ...Array.from(new Set(rewards.map((r) => r.category).filter(Boolean) as string[]))];
  const filtered = activeCat === "Todas" ? rewards : rewards.filter((r) => r.category === activeCat);

  const handleRedeem = async (r: Reward) => {
    if (!user) return;
    if (userPoints < r.points_cost) return;
    setRedeemingId(r.id);
    const { data: tx, error } = await supabase
      .from("points_transactions")
      .insert({
        profile_id: user.id,
        amount: -r.points_cost,
        type: "canje",
        reason: r.title,
      })
      .select()
      .single();
    if (error) {
      setRedeemingId(null);
      toast.error(error.message);
      return;
    }
    // Crear el registro de canje (estado/pedido)
    await supabase.from("redemptions").insert({
      profile_id: user.id,
      reward_id: r.id,
      reward_title: r.title,
      points_cost: r.points_cost,
      transaction_id: tx?.id ?? null,
      status: "pendiente",
    });
    setRedeemingId(null);
    toast.success("¡Recompensa canjeada!", {
      description: `Sigue el estado en "Mis canjes". Te abriremos WhatsApp para avisarle al atelier.`,
    });
    // Notificar al atelier vía WhatsApp (link wa.me)
    await notifyRedemptionViaWhatsApp({
      clientName: profile?.full_name || profile?.email || "Cliente",
      clientPhone: profile?.phone,
      rewardTitle: r.title,
      points: r.points_cost,
    });
    refreshProfile();
  };


  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Recompensas — Puntos Deluxe</title>
      </Helmet>
      <PageHeader
        eyebrow="Recompensas"
        title={
          <>
            Canjea tus puntos por <em className="italic">momentos.</em>
          </>
        }
        description={`Tienes ${formatPoints(userPoints)} puntos disponibles.`}
      />

      <a
        href="https://floristeriadeluxe.com"
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/15 via-gold/10 to-primary/15 p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-pink md:p-6"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/30 blur-2xl transition-all duration-500 group-hover:scale-150" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-primary">¿Necesitas más puntos?</p>
            <p className="mt-0.5 font-serif text-lg font-semibold text-foreground">
              Compra en <em className="text-shimmer-gold">floristeriadeluxe.com</em>
            </p>
          </div>
        </div>
        <span className="relative hidden items-center gap-2 rounded-full bg-foreground px-5 py-2 text-xs font-medium text-background transition-colors group-hover:bg-primary group-hover:text-primary-foreground md:inline-flex">
          Ir a la tienda
          <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </a>

      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-center gap-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-ink font-serif text-2xl font-semibold text-primary-foreground">
            ✦
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Disponible para canjear
            </p>
            <p className="font-serif text-3xl font-semibold text-foreground">
              {formatPoints(userPoints)}{" "}
              <span className="text-base italic font-normal text-muted-foreground">puntos</span>
            </p>
          </div>
        </div>
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  activeCat === c
                    ? "bg-ink text-ink-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Gift className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-serif text-xl text-foreground">No hay recompensas aún</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Vuelve pronto, el atelier publicará nuevas opciones para canjear.
          </p>
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const affordable = r.points_cost <= userPoints;
            const isRedeeming = redeemingId === r.id;
            return (
              <article
                key={r.id}
                className={`group flex flex-col overflow-hidden rounded-3xl border bg-card transition-all hover:-translate-y-1 hover:shadow-card ${
                  affordable ? "border-border" : "border-border/50 opacity-80"
                }`}
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-muted">
                  {r.image_url ? (
                    <img
                      src={r.image_url}
                      alt={r.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
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
                  {!affordable && (
                    <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground backdrop-blur">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-xl font-semibold leading-tight text-foreground">
                    {r.title}
                  </h3>
                  {r.description && (
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.description}</p>
                  )}
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span>
                      <span className="font-serif text-2xl font-semibold text-foreground">
                        {formatPoints(r.points_cost)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">pts</span>
                    </span>
                    <Button
                      disabled={!affordable || isRedeeming}
                      onClick={() => handleRedeem(r)}
                      className={`rounded-full ${
                        affordable
                          ? "bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
                          : ""
                      }`}
                    >
                      {isRedeeming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : affordable ? (
                        <>
                          Canjear <ArrowUpRight className="ml-1 h-4 w-4" />
                        </>
                      ) : (
                        `Faltan ${formatPoints(r.points_cost - userPoints)}`
                      )}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
