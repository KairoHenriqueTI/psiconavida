import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Categorias from "./pages/Categorias.tsx";
import CategoriaPage from "./pages/CategoriaPage.tsx";
import Postagens from "./pages/Postagens.tsx";
import Sobre from "./pages/Sobre.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/admin/Login.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminPosts from "./pages/admin/Posts.tsx";
import PostEditor from "./pages/admin/PostEditor.tsx";
import AdminCategories from "./pages/admin/Categories.tsx";
import AdminSiteContent from "./pages/admin/SiteContent.tsx";
import AdminUsers from "./pages/admin/Users.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/categoria/:slug" element={<CategoriaPage />} />
            <Route path="/postagens" element={<Postagens />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/post/:slug" element={<BlogPost />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="posts/:id" element={<PostEditor />} />
              <Route path="categorias" element={<AdminCategories />} />
              <Route path="conteudo" element={<AdminSiteContent />} />
              <Route path="usuarios" element={<AdminUsers />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
