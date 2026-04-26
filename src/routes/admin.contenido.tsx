import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Upload, Save, Video, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { fetchSiteContent, type SiteContentMap } from "@/lib/site-content";
import { SITE_KEYS } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AdminContenidoPage() {
  const { user } = useAuth();
  const [content, setContent] = useState<SiteContentMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);

  // Editable form state
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroCta, setHeroCta] = useState("");

  const load = async () => {
    setLoading(true);
    const map = await fetchSiteContent();
    setContent(map);
    setHeroTitle(map[SITE_KEYS.heroTitle]?.text ?? "");
    setHeroSubtitle(map[SITE_KEYS.heroSubtitle]?.text ?? "");
    setHeroCta(map[SITE_KEYS.heroCta]?.text ?? "");
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const upsertText = async (key: string, value: string) => {
    return supabase.from("site_content").upsert(
      { key, value_text: value, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  };

  const upsertUrl = async (key: string, value: string | null) => {
    return supabase.from("site_content").upsert(
      { key, value_url: value, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  };

  const handleSaveTexts = async () => {
    setSaving(true);
    const results = await Promise.all([
      upsertText(SITE_KEYS.heroTitle, heroTitle),
      upsertText(SITE_KEYS.heroSubtitle, heroSubtitle),
      upsertText(SITE_KEYS.heroCta, heroCta),
    ]);
    setSaving(false);
    const err = results.find((r) => r.error)?.error;
    if (err) {
      toast.error(err.message);
      return;
    }
    toast.success("Textos actualizados");
    load();
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("El video no puede pesar más de 50MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `hero-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("hero-media")
      .upload(fileName, file, { upsert: false, contentType: file.type });

    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("hero-media").getPublicUrl(fileName);
    const { error: dbErr } = await upsertUrl(SITE_KEYS.heroVideoUrl, pub.publicUrl);
    setUploading(false);
    if (videoRef.current) videoRef.current.value = "";
    if (dbErr) {
      toast.error(dbErr.message);
      return;
    }
    toast.success("Video actualizado");
    load();
  };

  const handleVideoRemove = async () => {
    if (!confirm("¿Quitar el video del hero?")) return;
    const url = content[SITE_KEYS.heroVideoUrl]?.url;
    if (url) {
      const u = new URL(url);
      const idx = u.pathname.indexOf("/hero-media/");
      if (idx >= 0) {
        const path = u.pathname.substring(idx + "/hero-media/".length);
        await supabase.storage.from("hero-media").remove([path]);
      }
    }
    await upsertUrl(SITE_KEYS.heroVideoUrl, null);
    toast.success("Video eliminado");
    load();
  };

  const currentVideoUrl = content[SITE_KEYS.heroVideoUrl]?.url;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Contenido — Admin Deluxe</title>
      </Helmet>
      <PageHeader
        eyebrow="Contenido"
        title={
          <>
            La página principal, <em className="italic">a tu manera.</em>
          </>
        }
        description="Edita los textos del hero y sube el video que aparece en la portada del sitio."
        showAvatar={false}
      />

      {/* Textos hero */}
      <section className="space-y-5 rounded-3xl border border-border bg-card p-7 shadow-soft">
        <h3 className="font-serif text-2xl font-semibold text-foreground">Textos del hero</h3>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="heroTitle">Título principal</Label>
            <Input
              id="heroTitle"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="heroSubtitle">Subtítulo / descripción</Label>
            <Textarea
              id="heroSubtitle"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="mt-1.5"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="heroCta">Texto del botón principal</Label>
            <Input
              id="heroCta"
              value={heroCta}
              onChange={(e) => setHeroCta(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSaveTexts}
            disabled={saving}
            className="rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Guardar textos</>}
          </Button>
        </div>
      </section>

      {/* Video hero */}
      <section className="space-y-5 rounded-3xl border border-border bg-card p-7 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-foreground">Video del hero</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Se reproduce en la sección "Vive la magia Deluxe" de la página principal.
            </p>
          </div>
        </div>

        {currentVideoUrl ? (
          <div className="space-y-4">
            <div className="relative aspect-[9/16] max-w-xs overflow-hidden rounded-2xl border border-border bg-foreground">
              <video
                src={currentVideoUrl}
                controls
                className="h-full w-full object-cover"
                playsInline
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => videoRef.current?.click()}
                disabled={uploading}
                variant="outline"
                className="rounded-full"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /> Reemplazar</>}
              </Button>
              <Button
                onClick={handleVideoRemove}
                variant="ghost"
                className="rounded-full text-terracotta hover:bg-terracotta/10 hover:text-terracotta"
              >
                <Trash2 className="h-4 w-4" /> Quitar video
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-10 text-center">
            <Video className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-serif text-lg text-foreground">Aún sin video</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sube un video vertical (formato Reel) para mostrarlo en la portada.
            </p>
            <Button
              onClick={() => videoRef.current?.click()}
              disabled={uploading}
              className="mt-5 rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /> Subir video</>}
            </Button>
          </div>
        )}

        <input
          ref={videoRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleVideoUpload}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground">
          Máximo 50MB · MP4 o WebM · Recomendado vertical 9:16
        </p>
      </section>
    </div>
  );
}
