import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type SessionUser = { id?: string; name?: string | null; email?: string | null; role?: string } | null;

interface Session {
  user?: SessionUser;
  expires?: string;
}

interface AuthContextType {
  user: SessionUser | null;
  session: Session | null;
  loading: boolean;
  userRole: "admin" | "editor" | null;
  signIn: (email?: string, password?: string) => Promise<any> | void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "editor" | null>(null);

  const fetchRole = (u: SessionUser | null) => {
    const role = u?.role as "admin" | "editor" | undefined;
    setUserRole(role ?? null);
  };

  useEffect(() => {
    // Check session from NextAuth server (use relative paths to leverage Vite proxy)
    const API = '';
    let mounted = true;
    const getSession = async () => {
      try {
        const res = await fetch(`/api/auth/session`, { credentials: 'include' });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setSession(data || null);
          setUser(data?.user ?? null);
          fetchRole(data?.user ?? null);
        } else {
          setSession(null);
          setUser(null);
          setUserRole(null);
        }
      } catch (e) {
        setSession(null);
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    getSession();

    // refresh session on window focus
    const onFocus = () => getSession();
    window.addEventListener('focus', onFocus);
    return () => { mounted = false; window.removeEventListener('focus', onFocus); };
  }, []);

  const signIn = async (email?: string, password?: string) => {
    // use relative paths so Vite proxy forwards to backend and cookies are same-site
    if (!email || !password) {
      // redirect user to NextAuth sign-in page (email/magic link)
      window.location.href = `${API}/api/auth/signin`;
      return;
    }

    try {
      const csrfRes = await fetch(`/api/auth/csrf`, { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData?.csrfToken || '';

      // Create a form and submit it so the browser handles cookies correctly
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/api/auth/callback/credentials`;
      const makeInput = (name: string, value: string) => {
        const i = document.createElement('input');
        i.type = 'hidden';
        i.name = name;
        i.value = value;
        return i;
      };
      form.appendChild(makeInput('csrfToken', csrfToken));
      // ensure callback cookie/value points to frontend admin (override any stale cookie)
      try { document.cookie = `next-auth.callback-url=${encodeURIComponent(window.location.origin + '/admin')}; path=/`; } catch (e) {}
      form.appendChild(makeInput('callbackUrl', window.location.origin + '/admin'));
      form.appendChild(makeInput('email', email));
      form.appendChild(makeInput('password', password));
      document.body.appendChild(form);
      form.submit();
      return;
    } catch (e) {
      return { error: { message: 'Erro ao conectar ao servidor' } };
    }
  };

  const signOut = async () => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    await fetch(`${API}/api/auth/signout`, { method: 'POST', credentials: 'include' });
    setSession(null);
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
