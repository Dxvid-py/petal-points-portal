import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Upload, Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import type { GalleryItem } from "@/lib/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

export default function AdminGaleriaPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("gallery_items")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as GalleryItem[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede pesar más de 5MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("galeria")
      .upload(fileName, file, { upsert: false });

    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }

    const { data: pub } = supabase.storage.from("galeria").getPublicUrl(fileName);

    const { error: dbErr } = await supabase.from("gallery_items").insert({
      image_url: pub.publicUrl,
      caption: caption.trim() || null,
    });

    setUploading(false);
    if (dbErr) {
      toast.error(dbErr.message);
      return;
    }
    toast.success("Imagen agregada a la galería");
    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
    load();
  };

  const remove = async (item: GalleryItem) => {
    if (!confirm("¿Eliminar esta imagen?")) return;

    // Extraer el path del bucket desde la URL pública
    const url = new URL(item.image_url);
    const idx = url.pathname.indexOf("/galeria/");
    if (idx >= 0) {
      const path = url.pathname.substring(idx + "/galeria/".length);
      await supabase.storage.from("galeria").remove([path]);
    }
    const { error } = await supabase.from("gallery_items").delete().eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Imagen eliminada");
    load();
  };

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Galería — Admin Deluxe</title>
      </Helmet>
      <PageHeader
        eyebrow="Galería"
        title={
          <>
            Inspiración del <em className="italic">atelier.</em>
          </>
        }
        description="Sube fotos para mostrar el trabajo de Floristería Deluxe en la página principal."
        showAvatar={false}
      />

      <section className="rounded-3xl border border-dashed border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Pie de foto (opcional)
            </label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ramo silvestre · Otoño"
              className="mt-2"
            />
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              id="upload"
            />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Subir imagen
                </>
              )}
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Máximo 5MB · formatos JPG, PNG, WebP
        </p>
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-serif text-xl text-foreground">Galería vacía</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Sube tu primera imagen para empezar a llenar el atelier.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
            >
              <div className="relative aspect-square">
                <img
                  src={item.image_url}
                  alt={item.caption ?? "Galería"}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => remove(item)}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-terracotta opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-foreground">
                  {item.caption ?? "Sin descripción"}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {formatDate(item.created_at)}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
