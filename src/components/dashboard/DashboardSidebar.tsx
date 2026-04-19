import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  User,
  Gift,
  ShoppingBag,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import avatar from "@/assets/avatar-ana.jpg";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard", label: "Mi Perfil", icon: User, disabled: true },
  { to: "/dashboard", label: "Recompensas", icon: Gift, disabled: true },
  { to: "/dashboard", label: "Mis Compras", icon: ShoppingBag, disabled: true },
  { to: "/dashboard", label: "Soporte", icon: MessageCircle, disabled: true },
] as const;

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border/60 bg-sidebar lg:flex">
      <div className="flex items-center gap-3 px-6 py-8">
        <img
          src={avatar}
          alt="Ana"
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-primary-soft"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-serif text-base font-semibold text-sidebar-foreground">
            Botanique Luxe
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-gold-foreground/70">
            Nivel Oro
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item, idx) => {
            const isActive = idx === 0 && location.pathname === "/dashboard";
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={[
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  ].join(" ")}
                >
                  <item.icon className="h-4 w-4" strokeWidth={2} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-8">
        <button className="flex w-full items-center gap-3 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-accent">
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
