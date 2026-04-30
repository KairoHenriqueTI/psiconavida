import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
}

export default function ImageUpload({ value, onChange, label, folder = "general" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/api/uploads`, { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      onChange(data.url);
      toast.success('Imagem enviada!');
    } catch (e: any) {
      toast.error('Erro ao enviar imagem: ' + (e.message || String(e)));
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-subtitle text-foreground">{label}</label>}
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-32 w-auto rounded-lg object-cover border border-border" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? "Enviando..." : "Enviar imagem"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
