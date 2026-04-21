import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, User, Gift, ShoppingBag, MessageCircle } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Inicio", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/perfil", label: "Perfil", icon: User },
  { to: "/dashboard/recompensas", label: "Premios", icon: Gift },
  { to: "/dashboard/compras", label: "Compras", icon: ShoppingBag },
  { to: "/dashboard/soporte", label: "Soporte", icon: MessageCircle },
] as const;

export function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-2xl items-center justify-between px-2 py-2">
        {items.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname === item.to ||
              location.pathname.startsWith(item.to + "/");
          return (
            <li key={item.label} className="flex-1">
              <Link
                to={item.to}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.75} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
