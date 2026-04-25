import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Mail, Phone, MapPin, IdCard, Sparkles, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Avatar } from "@/components/dashboard/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatPoints } from "@/lib/format";

export default function ProfilePage() {
  const { profile, user, refreshProfile, roles } = useAuth();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [parroquiaCode, setParroquiaCode] = useState(profile?.parroquia_code ?? "");

  // Sincroniza si profile llega después
  if (profile && fullName === "" && profile.full_name) {
    setFullName(profile.full_name);
    setPhone(profile.phone ?? "");
    setParroquiaCode(profile.parroquia_code ?? "");
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        parroquia_code: parroquiaCode || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Perfil actualizado");
    refreshProfile();
  };

  const balance = profile?.points_balance ?? 0;
  const displayName = profile?.full_name ?? "Cliente Deluxe";

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Mi Perfil — Puntos Deluxe</title>
      </Helmet>
      <PageHeader
        eyebrow="Mi perfil"
        title={
          <>
            Tus datos, <em className="italic">tu estilo.</em>
          </>
        }
        description="Mantén tu información actualizada para que la asesora pueda cargar tus puntos al instante."
        showAvatar={false}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <div className="bg-gradient-ink h-28" />
            <div className="-mt-12 flex flex-col items-center px-6 pb-6 text-center">
              <Avatar name={displayName} size="xl" ring />
              <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">
                {displayName}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1 text-xs uppercase tracking-[0.22em] text-gold-foreground">
                <Sparkles className="h-3 w-3" /> Club Deluxe
              </p>
              <p className="mt-3 font-serif text-3xl font-semibold text-shimmer-gold">
                {formatPoints(balance)} <span className="text-sm font-normal text-muted-foreground">pts</span>
              </p>

              <div className="mt-5 grid w-full grid-cols-2 gap-2 border-t border-border pt-4 text-center">
                <div>
                  <p className="font-serif text-base font-semibold text-foreground">
                    {profile?.nit_id ?? "—"}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    NIT / Cédula
                  </p>
                </div>
                <div className="border-l border-border">
                  <p className="font-serif text-base font-semibold text-foreground">
                    {profile?.parroquia_code ?? "—"}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Parroquia
                  </p>
                </div>
              </div>
            </div>
          </div>

          {roles.length > 0 && (
            <div className="mt-6 rounded-3xl border border-gold/30 bg-gold/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Tus roles</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {roles.map((r) => (
                  <span
                    key={r}
                    className="rounded-full bg-card px-3 py-1 text-xs font-medium capitalize text-foreground"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-6 lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6 rounded-3xl border border-border bg-card p-7 shadow-soft">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-foreground">
                Información personal
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Estos datos se usan para identificarte cuando compras en tienda física.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="mr-1.5 inline h-3 w-3" /> Correo
                </Label>
                <Input id="email" type="email" value={profile?.email ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nit">
                  <IdCard className="mr-1.5 inline h-3 w-3" /> NIT / Cédula
                </Label>
                <Input id="nit" value={profile?.nit_id ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="mr-1.5 inline h-3 w-3" /> Teléfono
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 300 000 0000"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="parroquia">
                  <MapPin className="mr-1.5 inline h-3 w-3" /> Código de Parroquia
                </Label>
                <Input
                  id="parroquia"
                  value={parroquiaCode}
                  onChange={(e) => setParroquiaCode(e.target.value)}
                  placeholder="PARR-001"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-gold hover:text-gold-foreground"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
