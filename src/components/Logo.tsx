import { Link } from "react-router-dom";

interface LogoProps {
  to?: string;
  variant?: "default" | "light";
}

export function Logo({ to = "/", variant = "default" }: LogoProps) {
  const isLight = variant === "light";
  return (
    <Link to={to} className="group flex items-center gap-3">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-transform group-hover:rotate-6 ${
          isLight
            ? "border-sidebar-foreground/20 bg-sidebar-accent text-sidebar-primary"
            : "border-foreground/15 bg-card text-primary"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M12 3c2.5 3 4 6 4 9a4 4 0 0 1-8 0c0-3 1.5-6 4-9z" />
          <path d="M12 13v8" />
          <path d="M9 18c1.5 1 4.5 1 6 0" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-serif text-[1.05rem] font-semibold tracking-tight ${
            isLight ? "text-sidebar-foreground" : "text-foreground"
          }`}
        >
          Botanique <em className="italic font-normal">Luxe</em>
        </span>
        <span
          className={`mt-0.5 text-[9px] uppercase tracking-[0.28em] ${
            isLight ? "text-sidebar-foreground/50" : "text-muted-foreground"
          }`}
        >
          Atelier · Barranquilla
        </span>
      </span>
    </Link>
  );
}
