import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { API_BASE } from "@/lib/apiBase";

const API = API_BASE;
import { Save, Loader2 } from "lucide-react";

interface SectionConfig {
  key: string;
  label: string;
  fields: FieldConfig[];
}

interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "image_desktop" | "image_mobile" | "lines" | "url";
}

const sections: SectionConfig[] = [
  {
    key: "hero",
    label: "Banner Principal (Hero)",
    fields: [
      { key: "title", label: "Título", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "text" },
      { key: "description", label: "Descrição", type: "textarea" },
      { key: "image_desktop", label: "Imagem Desktop", type: "image" },
      { key: "image_mobile", label: "Imagem Mobile", type: "image" },
    ],
  },
  {
    key: "about_preview",
    label: "Sobre o Projeto (Home)",
    fields: [
      { key: "title", label: "Título", type: "text" },
      { key: "description", label: "Descrição", type: "textarea" },
      { key: "quote", label: "Citação", type: "text" },
      { key: "image_author", label: "Imagem da Autora", type: "image" },
      { key: "image_secondary", label: "Imagem Secundária (Desktop)", type: "image" },
    ],
  },
  {
    key: "manifesto",
    label: "Manifesto",
    fields: [
      { key: "title", label: "Título", type: "text" },
      { key: "lines", label: "Versos (um por linha)", type: "lines" },
    ],
  },
  {
    key: "newsletter",
    label: "Newsletter",
    fields: [
      { key: "title", label: "Título", type: "text" },
      { key: "description", label: "Descrição", type: "textarea" },
      { key: "button_text", label: "Texto do Botão", type: "text" },
      { key: "button_url", label: "URL do Botão", type: "url" },
      { key: "footer_text", label: "Texto Rodapé", type: "text" },
      { key: "image", label: "Imagem de Fundo", type: "image" },
    ],
  },
  {
    key: "ethical_notice",
    label: "Aviso Ético",
    fields: [{ key: "text", label: "Texto", type: "textarea" }],
  },
  {
    key: "about_page",
    label: "Página Sobre",
    fields: [
      { key: "title", label: "Título", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "text" },
      { key: "intro", label: "Introdução", type: "textarea" },
      { key: "mission_title", label: "Título Missão", type: "text" },
      { key: "mission_text", label: "Texto Missão", type: "textarea" },
      { key: "author_name", label: "Seção Autora - Título", type: "text" },
      { key: "author_bio", label: "Bio da Autora", type: "textarea" },
      { key: "author_image", label: "Foto da Autora", type: "image" },
    ],
  },
];

function SectionEditor({ section }: { section: SectionConfig }) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["site-content", section.key],
    queryFn: async () => {
      const res = await fetch(`${API}/api/site-content`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load site content');
      const arr = await res.json();
      const entry = (arr || []).find((e: any) => e.key === section.key);
      if (!entry) return {};
      try {
        return typeof entry.value === 'string' ? JSON.parse(entry.value) : entry.value;
      } catch (e) {
        return entry.value;
      }
    },
  });

  const [form, setForm] = useState<Record<string, any>>({});
  const [initialized, setInitialized] = useState(false);

  if (data && !initialized) {
    setForm(data);
    setInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/api/site-content`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_key: section.key, content: form }),
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.error || 'Failed to save');
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-content", section.key] });
      toast.success(`${section.label} atualizado!`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <p className="text-muted-foreground text-sm py-4">Carregando...</p>;

  return (
    <div className="space-y-4">
      {section.fields.map((field) => {
        if (field.type === "image") {
          return (
            <ImageUpload
              key={field.key}
              label={field.label}
              value={form[field.key] || ""}
              onChange={(url) => updateField(field.key, url)}
              folder={`site/${section.key}`}
            />
          );
        }

        if (field.type === "lines") {
          const lines = Array.isArray(form[field.key]) ? form[field.key] : [];
          return (
            <div key={field.key}>
              <label className="text-sm font-subtitle text-foreground block mb-1.5">{field.label}</label>
              <textarea
                value={lines.join("\n")}
                onChange={(e) => updateField(field.key, e.target.value.split("\n"))}
                rows={6}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring resize-y"
              />
            </div>
          );
        }

        if (field.type === "textarea") {
          return (
            <div key={field.key}>
              <label className="text-sm font-subtitle text-foreground block mb-1.5">{field.label}</label>
              <textarea
                value={form[field.key] || ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring resize-y"
              />
            </div>
          );
        }

        return (
          <div key={field.key}>
            <label className="text-sm font-subtitle text-foreground block mb-1.5">{field.label}</label>
            <input
              value={form[field.key] || ""}
              onChange={(e) => updateField(field.key, e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        );
      })}

      <button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-subtitle px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Salvar
      </button>
    </div>
  );
}

export default function AdminSiteContent() {
  const [activeSection, setActiveSection] = useState(sections[0].key);

  return (
    <div>
      <h1 className="font-heading text-2xl text-foreground mb-6">Conteúdo do Site</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Section nav */}
        <div className="md:w-56 shrink-0">
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full text-left text-sm px-4 py-2.5 rounded-lg transition-colors ${
                  activeSection === s.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Editor */}
        <div className="flex-1 bg-card border border-border rounded-xl p-6">
          {sections
            .filter((s) => s.key === activeSection)
            .map((s) => (
              <SectionEditor key={s.key} section={s} />
            ))}
        </div>
      </div>
    </div>
  );
}
