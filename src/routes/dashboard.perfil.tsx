import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Mail, Phone, IdCard, Sparkles, Loader2, Camera, Trash2, MapPin } from "lucide-react";
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setAddress(profile.address ?? "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: displayName,
        display_name: displayName,
        phone: phone || null,
        address: address || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      if (error.message.toLowerCase().includes("duplicate") || error.message.includes("23505")) {
        toast.error("Ese nombre ya está en uso por otra cuenta.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Perfil actualizado");
    refreshProfile();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("La imagen no puede pesar más de 3MB");
      return;
    }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const fileName = `${user.id}/avatar-${Date.now()}.${ext}`;

    // Quita la foto vieja si existe
    if (profile?.avatar_url) {
      try {
        const u = new URL(profile.avatar_url);
        const idx = u.pathname.indexOf("/avatars/");
        if (idx >= 0) {
          const oldPath = u.pathname.substring(idx + "/avatars/".length);
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      } catch {
        // ignore
      }
    }

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: false, contentType: file.type });

    if (upErr) {
      setUploadingAvatar(false);
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const { error: dbErr } = await supabase
      .from("profiles")
      .update({ avatar_url: pub.publicUrl })
      .eq("id", user.id);
    setUploadingAvatar(false);
    if (dbErr) {
      toast.error(dbErr.message);
      return;
    }
    toast.success("Foto actualizada");
    refreshProfile();
  };

  const handleAvatarRemove = async () => {
    if (!user || !profile?.avatar_url) return;
    if (!confirm("¿Quitar la foto de perfil?")) return;
    try {
      const u = new URL(profile.avatar_url);
      const idx = u.pathname.indexOf("/avatars/");
      if (idx >= 0) {
        const path = u.pathname.substring(idx + "/avatars/".length);
        await supabase.storage.from("avatars").remove([path]);
      }
    } catch {
      // ignore
    }
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    toast.success("Foto eliminada");
    refreshProfile();
  };

  const balance = profile?.points_balance ?? 0;
  const shownName = profile?.display_name ?? profile?.full_name ?? "Cliente Deluxe";

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
              <div className="relative">
                <Avatar name={shownName} url={profile?.avatar_url} size="xl" ring />
                <label className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-gold hover:text-gold-foreground">
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
              {profile?.avatar_url && (
                <button
                  onClick={handleAvatarRemove}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-terracotta"
                >
                  <Trash2 className="h-3 w-3" /> Quitar foto
                </button>
              )}
              <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">
                {shownName}
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
                  <p className="font-serif text-base font-semibold text-foreground capitalize">
                    {profile?.account_type ?? "—"}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Tipo de cuenta
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
                El nombre se usa para iniciar sesión, así que recuerda cómo lo escribiste.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="displayName">Nombre de la cuenta</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
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
              <div className="space-y-2 md:col-span-2">
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
                <Label htmlFor="address">
                  <MapPin className="mr-1.5 inline h-3 w-3" /> Dirección
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Cra 10 # 20-30, Cali"
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
