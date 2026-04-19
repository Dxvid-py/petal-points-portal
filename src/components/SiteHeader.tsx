import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Logo />
        <nav className="hidden items-center gap-10 md:flex">
          <Link
            to="/"
            hash="historia"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Nuestra Historia
          </Link>
          <Link
            to="/"
            hash="servicios"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Servicios
          </Link>
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Club de Puntos
          </Link>
        </nav>
        <Button asChild className="rounded-full px-5">
          <Link to="/dashboard">Ingresar</Link>
        </Button>
      </div>
    </header>
  );
}
