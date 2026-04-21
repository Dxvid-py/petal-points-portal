import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search, Download, Package, Truck, Check, Clock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "Entregado" | "En camino" | "Preparando";

const statusStyle: Record<Status, { color: string; icon: typeof Check }> = {
  Entregado: { color: "bg-primary-soft text-forest", icon: Check },
  "En camino": { color: "bg-blush text-blush-foreground", icon: Truck },
  Preparando: { color: "bg-gold/30 text-gold-foreground", icon: Clock },
};

const orders = [
  { id: "BL-2024-1042", date: "18 Oct 2024", item: "Ramo silvestre · Edición otoño", items: 1, total: 145000, points: 150, status: "Entregado" as Status },
  { id: "BL-2024-1031", date: "02 Oct 2024", item: "Centro de mesa otoñal + jarrón", items: 2, total: 220000, points: 220, status: "Entregado" as Status },
  { id: "BL-2024-1018", date: "15 Sep 2024", item: "Suscripción mensual · Septiembre", items: 1, total: 180000, points: 180, status: "Entregado" as Status },
  { id: "BL-2024-1009", date: "28 Ago 2024", item: "Decoración íntima cumpleaños", items: 5, total: 480000, points: 480, status: "Entregado" as Status },
  { id: "BL-2024-1051", date: "21 Oct 2024", item: "Peonías importadas (preventa)", items: 1, total: 95000, points: 95, status: "Preparando" as Status },
  { id: "BL-2024-1048", date: "20 Oct 2024", item: "Tulipanes blancos premium", items: 1, total: 75000, points: 75, status: "En camino" as Status },
];

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export default function PurchasesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Status | "Todas">("Todas");

  const filtered = orders.filter((o) => {
    const matchesQuery =
      query === "" ||
      o.item.toLowerCase().includes(query.toLowerCase()) ||
      o.id.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "Todas" || o.status === filter;
    return matchesQuery && matchesFilter;
  });

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const totalPoints = orders.reduce((s, o) => s + o.points, 0);

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Mis Compras — Botanique Luxe</title>
        <meta name="description" content="Historial completo de tus compras y pedidos en Botanique Luxe." />
      </Helmet>
      <PageHeader
        eyebrow="Mis compras"
        title={
          <>
            Tu historia <em className="italic">floral.</em>
          </>
        }
        description="Cada pedido, sus puntos y su estado — todo en un solo lugar."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Total invertido</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-foreground">{formatCOP(totalSpent)}</p>
          <p className="mt-1 text-xs text-muted-foreground">En los últimos 12 meses</p>
        </article>
        <article className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Pedidos</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-foreground">{orders.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">+3 este trimestre</p>
        </article>
        <article className="rounded-3xl bg-gradient-ink p-6 text-primary-foreground shadow-ink">
          <p className="text-[10px] uppercase tracking-[0.24em] text-primary-foreground/60">Puntos generados</p>
          <p className="mt-2 font-serif text-3xl font-semibold">+{totalPoints.toLocaleString()}</p>
          <p className="mt-1 text-xs text-primary-foreground/70">Acumulados</p>
        </article>
      </section>

      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar pedido o producto"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-full pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["Todas", "Entregado", "En camino", "Preparando"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                filter === s ? "bg-ink text-ink-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <th className="px-6 py-4 font-medium">Pedido</th>
                <th className="px-6 py-4 font-medium">Detalle</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Puntos</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const Style = statusStyle[o.status];
                return (
                  <tr
                    key={o.id}
                    className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/30"
                  >
                    <td className="px-6 py-5">
                      <p className="font-mono text-xs text-muted-foreground">{o.id}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{o.date}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-medium text-foreground">{o.item}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.items} {o.items === 1 ? "artículo" : "artículos"}
                      </p>
                    </td>
                    <td className="px-6 py-5 font-serif text-base text-foreground">{formatCOP(o.total)}</td>
                    <td className="px-6 py-5">
                      <span className="font-serif text-base text-forest">+{o.points}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${Style.color}`}
                      >
                        <Style.icon className="h-3 w-3" />
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul className="divide-y divide-border md:hidden">
          {filtered.map((o) => {
            const Style = statusStyle[o.status];
            return (
              <li key={o.id} className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{o.item}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{o.id} · {o.date}</p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${Style.color}`}
                  >
                    <Style.icon className="h-3 w-3" />
                    {o.status}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="font-serif text-lg text-foreground">{formatCOP(o.total)}</span>
                  <span className="font-serif text-base text-forest">+{o.points} pts</span>
                </div>
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-serif text-lg text-foreground">Sin resultados</p>
            <p className="mt-1 text-sm text-muted-foreground">Prueba con otra búsqueda o filtro.</p>
          </div>
        )}
      </section>
    </div>
  );
}
