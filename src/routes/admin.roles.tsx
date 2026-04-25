import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, Loader2, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import type { ProfileRow, AppRole } from "@/lib/types";
import { toast } from "sonner";

interface Row extends ProfileRow {
  roles: AppRole[];
}

const ALL_ROLES: AppRole[] = ["admin", "asesora", "cliente"];

export default function AdminRolesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

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
    setRows(
      (profs ?? []).map((p: ProfileRow) => ({ ...p, roles: map.get(p.id) ?? [] })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Rol ${role} asignado`);
    load();
  };

  const removeRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Rol ${role} retirado`);
    load();
  };

  const filtered = rows.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (r.full_name ?? "").toLowerCase().includes(q) ||
      (r.email ?? "").toLowerCase().includes(q) ||
      (r.nit_id ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Roles — Admin Deluxe</title>
      </Helmet>
      <PageHeader
        eyebrow="Roles del equipo"
        title={
          <>
            Permisos del <em className="italic">atelier.</em>
          </>
        }
        description="Asigna asesoras y administradores. Los clientes tienen rol por defecto."
        showAvatar={false}
      />

      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-sm text-foreground">
        <p className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 text-gold" />
          Cómo funcionan los roles
        </p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>• <strong>admin</strong>: gestiona todo (clientes, recompensas, galería, roles).</li>
          <li>• <strong>asesora</strong>: puede cargar puntos a clientes desde su panel.</li>
          <li>• <strong>cliente</strong>: ve su balance, historial y puede canjear recompensas.</li>
        </ul>
      </div>

      <Input
        placeholder="Buscar usuario por nombre, correo o NIT"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md rounded-full"
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <section className="space-y-3">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{r.full_name || "Sin nombre"}</p>
                <p className="text-xs text-muted-foreground">
                  {r.email} · {r.nit_id ?? "Sin NIT"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {r.roles.map((role) => (
                  <span
                    key={role}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      role === "admin"
                        ? "bg-gold/20 text-gold-foreground"
                        : role === "asesora"
                          ? "bg-blush text-blush-foreground"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {role}
                    <button
                      onClick={() => removeRole(r.id, role)}
                      className="opacity-60 hover:opacity-100"
                      title="Quitar rol"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                {ALL_ROLES.filter((role) => !r.roles.includes(role)).map((role) => (
                  <Button
                    key={role}
                    size="sm"
                    variant="outline"
                    onClick={() => addRole(r.id, role)}
                    className="h-7 rounded-full text-[11px]"
                  >
                    <Plus className="h-3 w-3" /> {role}
                  </Button>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
