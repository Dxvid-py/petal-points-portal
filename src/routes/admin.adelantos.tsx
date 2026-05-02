import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Lock, Loader2, Plus, Trash2, Check, Wallet } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { formatCOP, formatDate } from "@/lib/format";
import type { Advance } from "@/lib/types";
import { toast } from "sonner";

const ADELANTOS_PIN = "0011";
const SESSION_KEY = "adelantos_unlocked";

export default function AdminAdelantosPage() {
  const [unlocked, setUnlocked] = useState(
    typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1",
  );
  const [pin, setPin] = useState("");

  // data
  const [rows, setRows] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  // form
  const [employeeName, setEmployeeName] = useState("");
  const [amount, setAmount] = useState("");
  const [advanceDate, setAdvanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("advances")
      .select("*")
      .order("advance_date", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Advance[]);
    setLoading(false);
  };

  useEffect(() => {
    if (unlocked) load();
  }, [unlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADELANTOS_PIN) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
      setPin("");
    } else {
      toast.error("PIN incorrecto");
      setPin("");
    }
  };

  const handleCreate = async () => {
    if (!employeeName.trim() || !amount || Number(amount) <= 0) {
      toast.error("Nombre y monto son obligatorios");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("advances").insert({
      employee_name: employeeName.trim(),
      amount: Number(amount),
      advance_date: advanceDate,
      note: note.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Adelanto registrado");
    setEmployeeName("");
    setAmount("");
    setNote("");
    setAdvanceDate(new Date().toISOString().slice(0, 10));
    setCreateOpen(false);
    load();
  };

  const togglePaid = async (a: Advance) => {
    const { error } = await supabase
      .from("advances")
      .update({
        paid: !a.paid,
        paid_at: !a.paid ? new Date().toISOString() : null,
      })
      .eq("id", a.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este adelanto? Esta acción no se puede deshacer.")) return;
    const { error } = await supabase.from("advances").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Adelanto eliminado");
    load();
  };

  // Agrupar por empleado
  const grouped = rows.reduce<Record<string, Advance[]>>((acc, r) => {
    (acc[r.employee_name] = acc[r.employee_name] || []).push(r);
    return acc;
  }, {});

  const totalGeneral = rows.reduce((s, r) => s + Number(r.amount), 0);
  const totalPendiente = rows
    .filter((r) => !r.paid)
    .reduce((s, r) => s + Number(r.amount), 0);

  // ===== Pantalla de PIN =====
  if (!unlocked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Helmet>
          <title>Adelantos — Bloqueado</title>
        </Helmet>
        <form
          onSubmit={handleUnlock}
          className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-soft"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-ink text-white">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-center font-serif text-2xl font-semibold text-foreground">
            Sección protegida
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Ingresa el PIN para acceder a Adelantos.
          </p>
          <div className="mt-6">
            <Label htmlFor="pin">PIN</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              maxLength={4}
              className="mt-1.5 text-center font-serif text-2xl tracking-[0.5em]"
              placeholder="• • • •"
            />
          </div>
          <Button
            type="submit"
            className="mt-5 w-full rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
          >
            Desbloquear
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Adelantos — Admin Deluxe</title>
      </Helmet>
      <PageHeader
        eyebrow="Adelantos"
        title={
          <>
            Control de <em className="italic">adelantos.</em>
          </>
        }
        description="Registra los adelantos que haces a empleados y márcalos como pagados cuando llegue la quincena o el mes."
        showAvatar={false}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Total registrado
          </p>
          <p className="mt-3 font-serif text-3xl font-semibold text-foreground">
            {formatCOP(totalGeneral)}
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.24em] text-terracotta">
            Pendiente por descontar
          </p>
          <p className="mt-3 font-serif text-3xl font-semibold text-terracotta">
            {formatCOP(totalPendiente)}
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Empleados activos
          </p>
          <p className="mt-3 font-serif text-3xl font-semibold text-foreground">
            {Object.keys(grouped).length}
          </p>
        </article>
      </section>

      <div className="flex justify-end">
        <Button
          onClick={() => setCreateOpen(true)}
          className="rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
        >
          <Plus className="h-4 w-4" /> Nuevo adelanto
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Wallet className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-serif text-xl text-foreground">Sin adelantos aún</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cuando registres uno aparecerá aquí agrupado por empleado.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([name, items]) => {
            const total = items.reduce((s, r) => s + Number(r.amount), 0);
            const pending = items
              .filter((r) => !r.paid)
              .reduce((s, r) => s + Number(r.amount), 0);
            return (
              <section
                key={name}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
              >
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 px-6 py-4">
                  <div>
                    <p className="font-serif text-lg font-semibold text-foreground">
                      {name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {items.length} adelanto{items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-xl font-semibold text-foreground">
                      {formatCOP(total)}
                    </p>
                    <p className="text-xs text-terracotta">
                      Pendiente: {formatCOP(pending)}
                    </p>
                  </div>
                </header>
                <ul className="divide-y divide-border">
                  {items.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center gap-4 px-6 py-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">
                          {formatCOP(Number(a.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(a.advance_date)}
                          {a.note ? ` · ${a.note}` : ""}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${
                          a.paid
                            ? "bg-forest/20 text-forest"
                            : "bg-terracotta/20 text-terracotta"
                        }`}
                      >
                        {a.paid ? "Pagado" : "Pendiente"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePaid(a)}
                        className="rounded-full"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {a.paid ? "Marcar pendiente" : "Marcar pagado"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(a.id)}
                        className="rounded-full text-terracotta hover:bg-terracotta/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Nuevo adelanto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="emp">Nombre del empleado *</Label>
              <Input
                id="emp"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="María López"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="amt">Monto (COP) *</Label>
              <Input
                id="amt"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="dt">Fecha</Label>
              <Input
                id="dt"
                type="date"
                value={advanceDate}
                onChange={(e) => setAdvanceDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="nt">Nota (opcional)</Label>
              <Input
                id="nt"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Adelanto quincena"
                className="mt-1.5"
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="w-full rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar adelanto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
