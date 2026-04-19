import { Leaf } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-sage text-primary-foreground shadow-soft transition-transform group-hover:rotate-6">
        <Leaf className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
          Botanique Luxe
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Atelier Floral
        </span>
      </span>
    </Link>
  );
}
