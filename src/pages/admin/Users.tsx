import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminUsers() {
  const { userRole } = useAuth();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor">("editor");

  const { data: roles, isLoading } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/user-roles`);
      if (!res.ok) throw new Error('Failed to load users');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/api/user-roles/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to remove role');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Acesso removido");
    },
  });

  if (userRole !== "admin") {
    return <p className="text-muted-foreground">Acesso restrito a administradores.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-foreground">Gestão de Usuários</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-subtitle px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> Novo usuário
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <p className="text-sm text-muted-foreground mb-4">
          Para adicionar um novo editor, primeiro crie a conta do usuário no banco e depois adicione o papel aqui inserindo o User ID.
        </p>

        {showAdd && (
          <div className="border border-border rounded-lg p-4 mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-subtitle text-sm text-foreground">Adicionar Papel</h3>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground">
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="text-sm font-subtitle text-foreground block mb-1.5">User ID</label>
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="UUID do usuário"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-subtitle text-foreground block mb-1.5">Papel</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "admin" | "editor")}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              onClick={async () => {
                if (!newEmail.trim()) return;
                const res = await fetch(`${API}/api/user-roles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: newEmail.trim(), role: newRole }), credentials: 'include' });
                if (!res.ok) {
                  const e = await res.json().catch(() => ({}));
                  toast.error(e?.error || 'Falha ao adicionar papel');
                  return;
                }
                toast.success("Papel adicionado!");
                qc.invalidateQueries({ queryKey: ["admin-user-roles"] });
                setShowAdd(false);
                setNewEmail("");
              }}
              className="bg-primary text-primary-foreground text-sm font-subtitle px-4 py-2 rounded-lg"
            >
              Adicionar
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-subtitle text-muted-foreground">User ID</th>
                <th className="text-left px-4 py-3 font-subtitle text-muted-foreground">Papel</th>
                <th className="text-right px-4 py-3 font-subtitle text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {roles?.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground font-mono text-xs">{r.user_id}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{r.role}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm("Remover este acesso?")) deleteMutation.mutate(r.id);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!roles || roles.length === 0) && (
            <p className="text-center text-muted-foreground py-8 text-sm">Nenhum usuário com papel definido.</p>
          )}
        </div>
      )}
    </div>
  );
}
