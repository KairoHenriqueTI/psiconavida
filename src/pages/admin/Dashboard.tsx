import { useQuery } from "@tanstack/react-query";
import { FileText, FolderOpen, Eye } from "lucide-react";

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const safeError = "Não foi possível carregar os dados do dashboard.";

export default function AdminDashboard() {
  const { data: posts } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/posts`);
      if (!res.ok) throw new Error(safeError);
      return res.json();
    },
  });
  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/categories`);
      if (!res.ok) throw new Error(safeError);
      return res.json();
    },
  });

  const postCount = (posts || []).length;
  const publishedCount = (posts || []).filter((p: any) => p.published).length;
  const categoryCount = (categories || []).length;

  const cards = [
    { label: "Total de Publicações", value: postCount ?? 0, icon: FileText },
    { label: "Publicadas", value: publishedCount ?? 0, icon: Eye },
    { label: "Categorias", value: categoryCount ?? 0, icon: FolderOpen },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl text-foreground mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <c.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-heading text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
