import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Gift, Lock, Filter, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Reward } from "@/lib/types";
import { formatPoints } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function CatalogoPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>("Todas");

  useEffect(() => {
    supabase.from("rewards").select("*").eq("active", true).order("points_cost")
      .then(({ data }) => { setRewards((data ?? []) as Reward[]); setLoading(false); });
  }, []);

  const categories = ["Todas", ...Array.from(new Set(rewards.map(r => r.category).filter(Boolean) as string[]))];
  const filtered = activeCat === "Todas" ? rewards : rewards.filter(r => r.category === activeCat);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>Catálogo — Puntos Deluxe</title>
        <meta name="description" content="Todas las recompensas del club Puntos Deluxe: flores premium, servicios y bonos exclusivos." />
      </Helmet>
      <SiteHeader />

      <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-primary backdrop-blur">
            <Gift className="h-3 w-3" /> Catálogo completo
          </span>
          <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight text-foreground md:text-6xl">
            Todo lo que puedes <em className="text-shimmer-gold">canjear</em>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Explora nuestro catálogo Deluxe. {user ? "Ya puedes canjear desde tu cuenta." : "Crea tu cuenta gratis para empezar a canjear."}
          </p>
          {!user && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-primary px-7 text-primary-foreground hover:bg-gold hover:text-gold-foreground">
                <Link to="/auth?mode=signup">Crear cuenta gratis <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-primary/40 px-7 hover:bg-primary/10">
                <Link to="/auth">Iniciar sesión</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCat(c)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  activeCat === c ? "bg-ink text-ink-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}>{c}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Gift className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-serif text-xl">Sin recompensas por ahora</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((r, i) => (
              <motion.article key={r.id}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 8) * 0.05 }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-pink">
                <div className="relative aspect-[5/4] overflow-hidden bg-muted">
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.title} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-bone">
                      <Gift className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  {r.category && (
                    <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] backdrop-blur">
                      {r.category}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-xl font-semibold leading-tight">{r.title}</h3>
                  {r.description && <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.description}</p>}
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span>
                      <span className="font-serif text-2xl font-semibold">{formatPoints(r.points_cost)}</span>
                      <span className="ml-1 text-xs text-muted-foreground">pts</span>
                    </span>
                    {user ? (
                      <Button asChild size="sm" className="rounded-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90">
                        <Link to="/dashboard/recompensas">Canjear <ArrowRight className="ml-1 h-4 w-4" /></Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link to="/auth"><Lock className="mr-1 h-3.5 w-3.5" /> Inicia sesión</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
