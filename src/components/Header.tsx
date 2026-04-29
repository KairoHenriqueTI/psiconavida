import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Menu } from "lucide-react";
import logo from "@/assets/logo.png";
import { posts, categories } from "@/lib/data";

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/postagens?busca=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img alt="Psico na Vida" className="h-12 w-auto" src="/lovable-uploads/8b164055-c976-4656-a946-58cbbd19ac61.png" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-8">
            <Link to="/" className="font-subtitle text-sm text-muted-foreground hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/postagens" className="font-subtitle text-sm text-muted-foreground hover:text-primary transition-colors">
              Publicações
            </Link>
            <Link to="/categorias" className="font-subtitle text-sm text-muted-foreground hover:text-primary transition-colors">
              Categorias
            </Link>
            <Link to="/sobre" className="font-subtitle text-sm text-muted-foreground hover:text-primary transition-colors">
              Sobre
            </Link>
          </nav>

          {/* Search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Buscar">
            
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Buscar">
            
            <Search size={18} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Menu">
            
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen &&
      <div className="border-t border-border bg-background">
          <div className="container py-3">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, categoria ou conteúdo..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
              autoFocus
              ref={(el) => {
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }} />
            
              <button type="submit" className="text-xs font-subtitle text-primary hover:underline">
                Buscar
              </button>
            </form>
          </div>
        </div>
      }

      {/* Mobile menu */}
      {mobileMenuOpen &&
      <div className="border-t border-border bg-background md:hidden">
          <nav className="container py-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-subtitle text-sm text-muted-foreground hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/postagens" onClick={() => setMobileMenuOpen(false)} className="font-subtitle text-sm text-muted-foreground hover:text-primary transition-colors">
              Publicações
            </Link>
            <Link to="/categorias" onClick={() => setMobileMenuOpen(false)} className="font-subtitle text-sm text-muted-foreground hover:text-primary transition-colors">
              Categorias
            </Link>
            <Link to="/sobre" onClick={() => setMobileMenuOpen(false)} className="font-subtitle text-sm text-muted-foreground hover:text-primary transition-colors">
              Sobre
            </Link>
          </nav>
        </div>
      }
    </header>);

};

export default Header;
