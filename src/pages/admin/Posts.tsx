import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminPosts() {
  const qc = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/posts`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/api/posts/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete post');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Publicação excluída");
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const res = await fetch(`${API}/api/posts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !published }), credentials: 'include' });
      if (!res.ok) throw new Error('Failed to toggle publish');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-foreground">Publicações</h1>
        <Link
          to="/admin/posts/novo"
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-subtitle px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> Nova publicação
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-subtitle text-muted-foreground">Título</th>
                  <th className="text-left px-4 py-3 font-subtitle text-muted-foreground hidden lg:table-cell">Autor</th>
                  <th className="text-left px-4 py-3 font-subtitle text-muted-foreground hidden md:table-cell">Categoria</th>
                  <th className="text-left px-4 py-3 font-subtitle text-muted-foreground hidden md:table-cell">Data</th>
                  <th className="text-center px-4 py-3 font-subtitle text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-subtitle text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {posts?.map((post) => (
                  <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-foreground font-medium">{post.title}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {post.author?.name || post.author?.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {(post.category as any)?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {new Date(post.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePublish.mutate({ id: post.id, published: post.published })}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          post.published
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {post.published ? <Eye size={12} /> : <EyeOff size={12} />}
                        {post.published ? "Publicado" : "Rascunho"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          to={`/admin/posts/${post.id}`}
                          className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm("Excluir esta publicação?")) deleteMutation.mutate(post.id);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!posts || posts.length === 0) && (
            <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma publicação ainda.</p>
          )}
        </div>
      )}
    </div>
  );
}
