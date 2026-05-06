import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Shield, ShieldOff, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { ProfileRow, AppRole } from "@/lib/types";
import { toast } from "sonner";

interface Row extends ProfileRow {
  roles: AppRole[];
}

export default function AdminRolesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { data: rolesData }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const map = new Map<string, AppRole[]>();
    (rolesData ?? []).forEach((r: { user_id: string; role: AppRole }) => {
      const list = map.get(r.user_id) ?? [];
      list.push(r.role);
      map.set(r.user_id, list);
    });
    setRows((profs ?? []).map((p: ProfileRow) => ({ ...p, roles: map.get(p.id) ?? [] })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (r: Row) => {
    const isAdmin = r.roles.includes("admin");
    setBusyId(r.id);
    const { error } = await supabase.rpc("admin_set_role", {
      _user_id: r.id, _role: "admin", _grant: !isAdmin,
    });
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(isAdmin ? "Permisos de admin retirados" : "Ahora es admin");
    load();
  };

  const filtered = rows.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (r.full_name ?? "").toLowerCase().includes(q) || (r.email ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-10">
      <Helmet><title>Roles — Admin Deluxe</title></Helmet>
      <PageHeader
        eyebrow="Roles"
        title={<>Permisos y <em className="italic">asesoras.</em></>}
        description="Asigna o retira el rol de administrador (asesoras con acceso al panel)."
        showAvatar={false}
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o correo" value={query}
          onChange={(e) => setQuery(e.target.value)} className="rounded-full pl-9" />
      </div>

      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((r) => {
              const isAdmin = r.roles.includes("admin");
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{r.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${
                    isAdmin ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                  }`}>
                    {isAdmin ? "Admin" : "Cliente"}
                  </span>
                  <Button size="sm" variant={isAdmin ? "outline" : "default"}
                    disabled={busyId === r.id}
                    onClick={() => toggleAdmin(r)}
                    className="rounded-full">
                    {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                     isAdmin ? <><ShieldOff className="h-3.5 w-3.5" /> Quitar admin</> :
                               <><Shield className="h-3.5 w-3.5" /> Hacer admin</>}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
