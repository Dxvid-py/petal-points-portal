import { Button } from "@/components/ui/button";

interface RewardCardProps {
  image: string;
  title: string;
  description: string;
  points: number;
  affordable?: boolean;
}

export function RewardCard({
  image,
  title,
  description,
  points,
  affordable = true,
}: RewardCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg font-semibold leading-tight text-foreground">
            {title}
          </h3>
          <span className="shrink-0 whitespace-nowrap font-serif text-base font-semibold text-gold-foreground">
            {points.toLocaleString()} pts
          </span>
        </div>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{description}</p>
        <Button
          variant="outline"
          disabled={!affordable}
          className="mt-5 rounded-full border-forest/30 text-forest hover:bg-primary-soft hover:text-forest"
        >
          {affordable ? "Canjear ahora" : "Puntos insuficientes"}
        </Button>
      </div>
    </article>
  );
}
