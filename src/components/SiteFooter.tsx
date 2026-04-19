import { Sprout } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-10 text-center">
        <Sprout className="h-5 w-5 text-primary" />
        <p className="text-xs text-muted-foreground">
          © 2024 Botanique Luxe · El Atelier de las Flores
        </p>
      </div>
    </footer>
  );
}
