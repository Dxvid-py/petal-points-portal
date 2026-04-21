import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Filter, Lock, ArrowUpRight, Check } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import rewardDiscount from "@/assets/reward-discount.jpg";
import rewardShipping from "@/assets/reward-shipping.jpg";
import rewardSurprise from "@/assets/reward-surprise.jpg";
import rewardWorkshop from "@/assets/reward-workshop.jpg";
import rewardGiftcard from "@/assets/reward-giftcard.jpg";

const USER_POINTS = 1250;

const categories = ["Todas", "Descuentos", "Envíos", "Experiencias", "Regalos"] as const;

const rewards = [
  { image: rewardDiscount, title: "15% en tu próximo ramo", description: 'Aplica en la colección "Primavera Eterna".', points: 400, category: "Descuentos", expires: "31 Dic 2024" },
  { image: rewardShipping, title: "Envío nacional cortesía", description: "Envío programado a cualquier ciudad del país.", points: 600, category: "Envíos", expires: "Sin vencimiento" },
  { image: rewardGiftcard, title: "Tarjeta regalo con sello", description: "Una tarjeta lacrada para regalar en cualquier ocasión.", points: 800, category: "Regalos", expires: "31 Dic 2024" },
  { image: rewardSurprise, title: "Ramo sorpresa del atelier", description: "Composición única diseñada por nuestros floristas.", points: 1000, category: "Regalos", expires: "31 Mar 2025" },
  { image: rewardWorkshop, title: "Taller botánico privado", description: "Una sesión 1:1 con nuestra florista principal.", points: 1500, category: "Experiencias", expires: "30 Jun 2025" },
  { image: rewardDiscount, title: "30% en decoración de evento", description: "Para tu próximo evento corporativo o íntimo.", points: 2200, category: "Descuentos", expires: "31 Dic 2024" },
];

export default function RewardsPage() {
  const [activeCat, setActiveCat] = useState<(typeof categories)[number]>("Todas");
  const [redeemed, setRedeemed] = useState<string[]>([]);

  const filtered =
    activeCat === "Todas" ? rewards : rewards.filter((r) => r.category === activeCat);

  const handleRedeem = (title: string, points: number) => {
    setRedeemed((p) => [...p, title]);
    toast.success("¡Recompensa canjeada!", {
      description: `${title} · −${points} puntos. Recibirás un correo con los detalles.`,
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Recompensas — Botanique Luxe</title>
        <meta name="description" content="Catálogo de recompensas exclusivas del Club Botanique Luxe." />
      </Helmet>
      <PageHeader
        eyebrow="Recompensas"
        title={
          <>
            Canjea tus puntos por <em className="italic">momentos.</em>
          </>
        }
        description={`Tienes ${USER_POINTS.toLocaleString()} puntos disponibles para gastar en experiencias del atelier.`}
      />

      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-center gap-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-ink font-serif text-2xl font-semibold text-primary-foreground">
            ✦
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Disponible para canjear</p>
            <p className="font-serif text-3xl font-semibold text-foreground">
              {USER_POINTS.toLocaleString()}{" "}
              <span className="text-base italic font-normal text-muted-foreground">puntos</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                activeCat === c ? "bg-ink text-ink-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => {
          const affordable = r.points <= USER_POINTS;
          const isRedeemed = redeemed.includes(r.title);
          return (
            <article
              key={r.title}
              className={`group flex flex-col overflow-hidden rounded-3xl border bg-card transition-all hover:-translate-y-1 hover:shadow-card ${
                affordable ? "border-border" : "border-border/50 opacity-80"
              }`}
            >
              <div className="relative aspect-[5/4] overflow-hidden bg-muted">
                <img
                  src={r.image}
                  alt={r.title}
                  loading="lazy"
                  width={800}
                  height={640}
                  className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${!affordable ? "grayscale" : ""}`}
                />
                <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground backdrop-blur">
                  {r.category}
                </span>
                {!affordable && (
                  <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground backdrop-blur">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-serif text-xl font-semibold leading-tight text-foreground">{r.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.description}</p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Vence: {r.expires}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span>
                    <span className="font-serif text-2xl font-semibold text-foreground">
                      {r.points.toLocaleString()}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">pts</span>
                  </span>
                  {isRedeemed ? (
                    <Button disabled variant="outline" className="rounded-full border-forest/40 text-forest">
                      <Check className="mr-1 h-4 w-4" /> Canjeado
                    </Button>
                  ) : (
                    <Button
                      disabled={!affordable}
                      onClick={() => handleRedeem(r.title, r.points)}
                      className={`rounded-full ${
                        affordable ? "bg-terracotta text-terracotta-foreground hover:bg-terracotta/90" : ""
                      }`}
                    >
                      {affordable ? (
                        <>
                          Canjear <ArrowUpRight className="ml-1 h-4 w-4" />
                        </>
                      ) : (
                        `Faltan ${(r.points - USER_POINTS).toLocaleString()} pts`
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
