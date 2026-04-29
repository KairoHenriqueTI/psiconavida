import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';


function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface CategoryForm {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

const empty: CategoryForm = { name: "", slug: "", description: "", image: "" };

export default function AdminCategories() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CategoryForm | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/categories`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (form: CategoryForm) => {
      const payload = { name: form.name, slug: form.slug, description: form.description, image: form.image };
      if (form.id) {
        const res = await fetch(`${API}/api/categories/${form.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
        if (!res.ok) throw new Error('Failed to update category');
      } else {
        const res = await fetch(`${API}/api/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e?.error || 'Failed to create category');
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      setEditing(null);
      toast.success("Categoria salva!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/api/categories/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete category');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria excluída");
    },
  });

  const updateField = (key: string, value: string) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      if (key === "name" && (!prev.id || prev.slug === slugify(prev.name))) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-foreground">Categorias</h1>
        {!editing && (
          <button
            onClick={() => setEditing({ ...empty })}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-subtitle px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> Nova categoria
          </button>
        )}
      </div>

      {editing && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg text-foreground">
              {editing.id ? "Editar Categoria" : "Nova Categoria"}
            </h2>
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-subtitle text-foreground block mb-1.5">Nome</label>
              <input
                value={editing.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-subtitle text-foreground block mb-1.5">Slug</label>
              <input
                value={editing.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-subtitle text-foreground block mb-1.5">Descrição</label>
            <textarea
              value={editing.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={2}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          </div>

          <ImageUpload
            label="Imagem"
            value={editing.image}
            onChange={(url) => updateField("image", url)}
            folder="categories"
          />

          <button
            onClick={() => saveMutation.mutate(editing)}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-subtitle px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save size={14} /> {saveMutation.isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        <div className="grid gap-4">
          {categories?.map((cat) => (
            <div key={cat.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              {cat.image && (
                <img src={cat.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-base text-foreground">{cat.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setEditing({
                      id: cat.id,
                      name: cat.name,
                      slug: cat.slug,
                      description: cat.description || "",
                      image: cat.image || "",
                    })
                  }
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Excluir categoria?")) deleteMutation.mutate(cat.id);
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {(!categories || categories.length === 0) && (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhuma categoria ainda.</p>
          )}
        </div>
      )}
    </div>
  );
}
