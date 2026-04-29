import { useState, useEffect } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Email ou senha incorretos.",
  AccessDenied: "Acesso negado.",
  OAuthSignin: "Erro ao conectar com provedor.",
  OAuthCallback: "Erro no callback do provedor.",
  OAuthCreateAccount: "Não foi possível criar conta.",
  EmailCreateAccount: "Não foi possível criar conta com email.",
  Callback: "Erro no callback de autenticação.",
  OAuthAccountNotLinked: "Email já está registrado com outro provedor.",
  EmailSignInError: "Erro ao enviar email de login.",
  CredentialsCallback: "Autorização falhou. Verifique as credenciais.",
  SessionCallback: "Erro ao processar sessão.",
  Default: "Erro ao autenticar. Tente novamente.",
};

export default function AdminLogin() {
  const { user, userRole, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Mostrar erro da URL quando componente carrega
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const message = ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.Default;
      toast.error(message);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (user && userRole) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!email || !password) {
      toast.error("Email e senha são obrigatórios.");
      return;
    }

    setSubmitting(true);
    const result = await signIn(email, password);
    if (result && result.error) {
      toast.error("Erro ao entrar: " + (result.error.message || JSON.stringify(result.error)));
      setSubmitting(false);
      return;
    }

    // Wait for session to be available (NextAuth may set cookie via redirect or Set-Cookie)
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    let attempts = 0;
    const waitForSession = async () => {
      while (attempts < 8) {
        try {
          const res = await fetch(`${API}/api/auth/session`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data && data.user) {
              toast.success('Bem-vindo(a)!');
              navigate('/admin');
              return;
            }
          }
        } catch (e) {
          console.error('Session check error:', e);
        }
        attempts += 1;
        await new Promise((r) => setTimeout(r, 500));
      }
      toast.error('Sessão não confirmada. Por favor, tente novamente.');
      setSubmitting(false);
    };
    waitForSession();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card p-8 rounded-2xl shadow-md border border-border">
        <h1 className="font-heading text-2xl text-foreground text-center mb-2">Psico CMS</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Acesse o painel de gestão de conteúdo
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-subtitle text-foreground block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
              placeholder="admin@psiconavida.com"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-sm font-subtitle text-foreground block mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
              placeholder="••••••••"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground font-subtitle text-sm py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Demo:</strong> admin@psiconavida.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
