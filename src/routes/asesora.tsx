import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Search, Loader2, ArrowLeft, IdCard, Plus, LogOut, Calculator, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/dashboard/Avatar";
import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { POINTS_PER_COP, supabase } from "@/lib/supabase";
import type { ProfileRow } from "@/lib/types";
import { formatCOP, formatDate, formatPoints } from "@/lib/format";
import { toast } from "sonner";

export default function AsesoraPage() {
  return (
    <RoleGuard allow={["asesora", "admin"]}>
      <AsesoraInner />
    </RoleGuard>
  );
}

function AsesoraInner() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ProfileRow[]>([]);
  const [selected, setSelected] = useState<ProfileRow | null>(null);
  const [amountCop, setAmountCop] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastTx, setLastTx] = useState<{ name: string; points: number } | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setSelected(null);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .or(
        `nit_id.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`,
      )
      .order("full_name")
      .limit(20);
    setResults((data ?? []) as ProfileRow[]);
    setSearching(false);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    const cop = Number(amountCop);
    if (!cop || cop <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    const points = Math.floor(cop / POINTS_PER_COP);
    if (points === 0) {
      toast.error(`Mínimo ${formatCOP(POINTS_PER_COP)} para generar 1 punto`);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("points_transactions").insert({
      profile_id: selected.id,
      amount: points,
      type: "compra",
      reason: reason.trim() || `Compra por ${formatCOP(cop)}`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setLastTx({ name: selected.full_name, points });
    toast.success(`+${points} puntos cargados a ${selected.full_name}`);
    setAmountCop("");
    setReason("");
    setSelected(null);
    setResults([]);
    setQuery("");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const previewPoints = amountCop && Number(amountCop) > 0
    ? Math.floor(Number(amountCop) / POINTS_PER_COP)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-bone">
      <Helmet>
        <title>Panel Asesora — Puntos Deluxe</title>
      </Helmet>

      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={profile?.full_name ?? "A"} size="sm" />
              <div className="leading-tight">
                <p className="text-xs font-medium text-foreground">{profile?.full_name}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-blush-foreground">Asesora</p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 inline h-3 w-3" /> Inicio
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-terracotta"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-terracotta">Asesora Deluxe</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            Cargar puntos a un <em className="italic">cliente.</em>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Busca al cliente por NIT, nombre o correo. El sistema calcula los puntos automáticamente.
          </p>
        </div>

        {lastTx && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-forest/30 bg-primary-soft p-4 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-forest" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                Última carga: <span className="font-serif">+{lastTx.points} pts</span> a {lastTx.name}
              </p>
              <p className="text-xs text-muted-foreground">El balance se actualizó automáticamente.</p>
            </div>
            <button onClick={() => setLastTx(null)} className="text-xs text-muted-foreground">
              ✕
            </button>
          </div>
        )}

        {/* Buscar */}
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Buscar cliente
          </Label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="NIT, nombre o correo"
                className="rounded-full pl-9"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
            >
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
            </Button>
          </div>

          {results.length > 0 && !selected && (
            <ul className="mt-5 divide-y divide-border/60">
              {results.map((p) => (
                <li
                  key={p.id}
                  className="flex cursor-pointer items-center justify-between gap-3 py-3 transition-colors hover:bg-secondary/30 px-2 rounded-lg"
                  onClick={() => setSelected(p)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={p.full_name ?? "?"} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        <IdCard className="mr-1 inline h-3 w-3" />
                        {p.nit_id ?? "Sin NIT"}
                        {p.parroquia_code && ` · ${p.parroquia_code}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-serif text-base text-foreground">
                    {formatPoints(p.points_balance ?? 0)} pts
                  </span>
                </li>
              ))}
            </ul>
          )}

          {results.length === 0 && query && !searching && (
            <p className="mt-5 text-sm text-muted-foreground">Sin resultados para "{query}".</p>
          )}
        </section>

        {/* Carga */}
        {selected && (
          <section className="mt-6 rounded-3xl border border-primary/20 bg-card p-6 shadow-card animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={selected.full_name ?? "?"} size="md" ring />
                <div>
                  <p className="font-serif text-xl font-semibold text-foreground">
                    {selected.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selected.nit_id ?? "Sin NIT"} · {selected.email}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground">
                Cambiar cliente
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-secondary/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Balance actual
                </p>
                <p className="mt-1 font-serif text-2xl font-semibold text-foreground">
                  {formatPoints(selected.points_balance ?? 0)} pts
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-ink p-4 text-primary-foreground">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60">
                  Cliente desde
                </p>
                <p className="mt-1 font-serif text-2xl font-semibold">
                  {selected.created_at ? formatDate(selected.created_at) : "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="cop">Monto de la compra (COP)</Label>
                <Input
                  id="cop"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={amountCop}
                  onChange={(e) => setAmountCop(e.target.value)}
                  placeholder="100000"
                  className="mt-1.5 text-lg"
                />
                {previewPoints > 0 && (
                  <p className="mt-2 flex items-center gap-2 text-sm">
                    <Calculator className="h-3.5 w-3.5 text-gold" />
                    Generará{" "}
                    <span className="font-serif text-lg font-semibold text-forest">
                      +{previewPoints} puntos
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({formatCOP(POINTS_PER_COP)} = 1 pt)
                    </span>
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="reason">Motivo / Descripción (opcional)</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ramo aniversario · Decoración evento..."
                  className="mt-1.5"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting || previewPoints === 0}
                size="lg"
                className="w-full rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Cargar +{previewPoints} puntos
                  </>
                )}
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
