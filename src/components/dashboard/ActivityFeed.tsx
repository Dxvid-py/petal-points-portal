import { ShoppingCart, Gift, Award } from "lucide-react";

const activities = [
  {
    icon: ShoppingCart,
    title: "Compra: Ramo Silvestre",
    meta: "Hace 2 días · +150 puntos",
    tone: "blush" as const,
  },
  {
    icon: Gift,
    title: "Canje: Envío Gratis",
    meta: "12 Oct 2023 · -500 puntos",
    tone: "sage" as const,
  },
  {
    icon: Award,
    title: "Bono: Aniversario",
    meta: "01 Oct 2023 · +100 puntos",
    tone: "gold" as const,
  },
];

const toneStyles: Record<string, string> = {
  blush: "bg-blush text-blush-foreground",
  sage: "bg-primary-soft text-forest",
  gold: "bg-gold/30 text-gold-foreground",
};

export function ActivityFeed() {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-soft">
      <div className="flex items-baseline justify-between">
        <h3 className="font-serif text-xl font-semibold text-foreground">
          Actividad reciente
        </h3>
        <button className="text-xs font-medium text-primary underline-offset-4 hover:underline">
          Ver todo
        </button>
      </div>
      <ul className="mt-5 space-y-4">
        {activities.map((a) => (
          <li key={a.title} className="flex items-start gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneStyles[a.tone]}`}
            >
              <a.icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{a.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{a.meta}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
