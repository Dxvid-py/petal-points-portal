import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search, Loader2, User as UserIcon, Plus, UserPlus, Church, User } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { ProfileRow, AppRole, AccountType } from "@/lib/types";
import { formatPoints, formatDate, formatCOP } from "@/lib/format";
import { POINTS_PER_COP } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Row extends ProfileRow {
  roles: AppRole[];
}

export default function AdminClientesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Form para añadir puntos manualmente
  const [amountCop, setAmountCop] = useState("");
  const [reason, setReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  // Form crear cuenta
  const [newAccountType, setNewAccountType] = useState<AccountType>("parroquia");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNit, setNewNit] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPin, setNewPin] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { data: rolesData }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const rolesByUser = new Map<string, AppRole[]>();
    (rolesData ?? []).forEach((r: { user_id: string; role: AppRole }) => {
      const list = rolesByUser.get(r.user_id) ?? [];
      list.push(r.role);
      rolesByUser.set(r.user_id, list);
    });
    setRows(
      (profs ?? []).map((p: ProfileRow) => ({
        ...p,
        roles: rolesByUser.get(p.id) ?? [],
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (r.full_name ?? "").toLowerCase().includes(q) ||
      (r.nit_id ?? "").toLowerCase().includes(q) ||
      (r.email ?? "").toLowerCase().includes(q) ||
      (r.parroquia_code ?? "").toLowerCase().includes(q)
    );
  });

  const handleAddPoints = async () => {
    if (!selected) return;
    const cop = Number(amountCop);
    if (!cop || cop <= 0) {
      toast.error("Ingresa un monto en COP válido");
      return;
    }
    const points = Math.floor(cop / POINTS_PER_COP);
    if (points === 0) {
      toast.error(`Mínimo ${formatCOP(POINTS_PER_COP)} para generar 1 punto`);
      return;
    }
    setAdjusting(true);
    const { error } = await supabase.from("points_transactions").insert({
      profile_id: selected.id,
      amount: points,
      type: "compra",
      reason: reason || `Compra por ${formatCOP(cop)}`,
    });
    setAdjusting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`+${points} puntos cargados a ${selected.full_name}`);
    setAmountCop("");
    setReason("");
    setSelected(null);
    load();
  };

  const handleCreateAccount = async () => {
    if (!newDisplayName.trim() || !newEmail.trim() || !newPin.trim()) {
      toast.error("Nombre, correo y PIN son obligatorios");
      return;
    }
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      toast.error("El PIN debe ser exactamente 6 dígitos");
      return;
    }
    if (!newAddress.trim()) {
      toast.error("La dirección es obligatoria");
      return;
    }
    setCreating(true);

    // Guardar la sesión del admin para restaurarla después del signUp
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    const { error } = await supabase.auth.signUp({
      email: newEmail.trim(),
      password: newPin.trim(),
      options: {
        data: {
          full_name: newDisplayName.trim(),
          display_name: newDisplayName.trim(),
          account_type: newAccountType,
          nit: newNit.trim() || null,
          phone: newPhone.trim() || null,
          address: newAddress.trim() || null,
        },
      },
    });

    // Restaurar la sesión del admin (signUp logea al nuevo usuario)
    if (currentSession) {
      await supabase.auth.setSession({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
      });
    }

    setCreating(false);
    if (error) {
      if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")) {
        toast.error("Ese correo ya está registrado.");
      } else if (error.message.toLowerCase().includes("duplicate") || error.message.includes("23505")) {
        toast.error("Ese nombre ya está en uso. Usa una variación.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success(`Usuario creado: ${newDisplayName.trim()}`);
    setNewDisplayName("");
    setNewEmail("");
    setNewNit("");
    setNewPhone("");
    setNewAddress("");
    setNewPin("");
    setNewAccountType("parroquia");
    setCreateOpen(false);
    load();
  };

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Clientes — Admin Deluxe</title>
      </Helmet>
      <PageHeader
        eyebrow="Clientes"
        title={
          <>
            Tu base de <em className="italic">clientes Deluxe.</em>
          </>
        }
        description={`${rows.length} usuario${rows.length === 1 ? "" : "s"} registrados.`}
        showAvatar={false}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, NIT, correo o parroquia"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-full pl-9"
          />
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
        >
          <UserPlus className="h-4 w-4" /> Crear cuenta
        </Button>
      </div>

      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <UserIcon className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-serif text-lg text-foreground">Sin clientes</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {query ? "Ajusta tu búsqueda." : "Aún no se han registrado usuarios."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    <th className="px-6 py-4 font-medium">Cliente</th>
                    <th className="px-6 py-4 font-medium">NIT</th>
                    <th className="px-6 py-4 font-medium">Parroquia</th>
                    <th className="px-6 py-4 font-medium">Roles</th>
                    <th className="px-6 py-4 font-medium">Puntos</th>
                    <th className="px-6 py-4 font-medium">Registro</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-border/60 hover:bg-secondary/30">
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{r.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {r.nit_id ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {r.parroquia_code ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                              r.account_type === "parroquia"
                                ? "bg-gold/20 text-gold-foreground"
                                : "bg-blush text-blush-foreground"
                            }`}
                          >
                            {r.account_type === "parroquia" ? "Parroquia" : "Persona"}
                          </span>
                          {r.roles.includes("admin") && (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                              admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-serif text-base text-foreground">
                        {formatPoints(r.points_balance ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {r.created_at ? formatDate(r.created_at) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(r)}
                          className="rounded-full"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Cargar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-border md:hidden">
              {filtered.map((r) => (
                <li key={r.id} className="space-y-2 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{r.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                        NIT: {r.nit_id ?? "—"} · {r.parroquia_code ?? "Sin parroquia"}
                      </p>
                    </div>
                    <span className="font-serif text-lg text-foreground">
                      {formatPoints(r.points_balance ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/40 pt-2">
                    <div className="flex flex-wrap gap-1">
                      {r.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase text-muted-foreground"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(r)}
                      className="rounded-full"
                    >
                      <Plus className="h-3.5 w-3.5" /> Cargar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Dialog para cargar puntos manualmente desde admin */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Cargar puntos a {selected?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl bg-secondary/40 p-4">
              <p className="text-xs text-muted-foreground">Balance actual</p>
              <p className="font-serif text-2xl font-semibold text-foreground">
                {formatPoints(selected?.points_balance ?? 0)} pts
              </p>
            </div>
            <div>
              <Label htmlFor="cop">Monto de la compra (COP)</Label>
              <Input
                id="cop"
                type="number"
                min="0"
                value={amountCop}
                onChange={(e) => setAmountCop(e.target.value)}
                placeholder="100000"
                className="mt-1.5"
              />
              {amountCop && Number(amountCop) > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Genera <span className="font-semibold text-forest">+{Math.floor(Number(amountCop) / POINTS_PER_COP)} puntos</span>{" "}
                  ({formatCOP(POINTS_PER_COP)} = 1 punto)
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ramo aniversario"
                className="mt-1.5"
              />
            </div>
            <Button
              onClick={handleAddPoints}
              disabled={adjusting}
              className="w-full rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
            >
              {adjusting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cargar puntos"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog crear cuenta manualmente */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Crear nueva cuenta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de cuenta</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewAccountType("parroquia")}
                  className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-xs transition-all ${
                    newAccountType === "parroquia"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-secondary/40 text-muted-foreground"
                  }`}
                >
                  <Church className="h-5 w-5" /> Parroquia
                </button>
                <button
                  type="button"
                  onClick={() => setNewAccountType("persona")}
                  className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-xs transition-all ${
                    newAccountType === "persona"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-secondary/40 text-muted-foreground"
                  }`}
                >
                  <User className="h-5 w-5" /> Persona
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="newName">Nombre de la cuenta *</Label>
              <Input
                id="newName"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder={newAccountType === "parroquia" ? "Parroquia San José" : "María López"}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="newEmail">Correo *</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="contacto@correo.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="newAddress">Dirección *</Label>
              <Input
                id="newAddress"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Cra 10 # 20-30, Cali"
                className="mt-1.5"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="newNit">NIT / Cédula</Label>
                <Input id="newNit" value={newNit} onChange={(e) => setNewNit(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="newPhone">Teléfono</Label>
                <Input id="newPhone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="newPin">PIN (6 dígitos) *</Label>
              <Input
                id="newPin"
                type="text"
                inputMode="numeric"
                minLength={6}
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                className="mt-1.5 text-center tracking-[0.4em]"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Comparte este PIN con el cliente para que pueda iniciar sesión.
              </p>
            </div>
            <Button
              onClick={handleCreateAccount}
              disabled={creating}
              className="w-full rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear cuenta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
