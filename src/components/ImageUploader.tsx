import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ImageUploaderProps {
  bucket: string;
  /** path prefix opcional dentro del bucket (ej user.id) */
  pathPrefix?: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  /** maxMB */
  maxSizeMB?: number;
  className?: string;
  aspect?: "square" | "video" | "wide";
}

const aspectMap = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[5/4]",
};

export function ImageUploader({
  bucket,
  pathPrefix,
  value,
  onChange,
  maxSizeMB = 5,
  className = "",
  aspect = "wide",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`La imagen no puede pesar más de ${maxSizeMB}MB`);
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const fullPath = pathPrefix ? `${pathPrefix}/${fileName}` : fileName;

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, { upsert: false, contentType: file.type });

    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(fullPath);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    onChange(pub.publicUrl);
    toast.success("Imagen subida");
  };

  const handleRemove = async () => {
    if (!value) return;
    try {
      const u = new URL(value);
      const idx = u.pathname.indexOf(`/${bucket}/`);
      if (idx >= 0) {
        const path = u.pathname.substring(idx + bucket.length + 2);
        await supabase.storage.from(bucket).remove([path]);
      }
    } catch {
      // ignora si no es una URL del bucket
    }
    onChange(null);
  };

  return (
    <div className={className}>
      {value ? (
        <div className={`group relative overflow-hidden rounded-2xl border border-border bg-secondary/30 ${aspectMap[aspect]}`}>
          <img src={value} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-foreground/60 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-full"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Upload className="h-3.5 w-3.5" /> Cambiar</>}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              className="rounded-full"
            >
              <X className="h-3.5 w-3.5" /> Quitar
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={`flex w-full ${aspectMap[aspect]} flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/30 text-sm text-muted-foreground transition-colors hover:border-gold hover:bg-gold/5 hover:text-foreground`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <>
              <Upload className="h-6 w-6" />
              <span>Subir imagen</span>
              <span className="text-[10px]">Máx {maxSizeMB}MB</span>
            </>
          )}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
