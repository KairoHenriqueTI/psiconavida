import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import brainTreeSymbol from "@/assets/brain-tree-symbol.png";

const Footer = () => {
  return (
    <footer className="bg-primary py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <img src={brainTreeSymbol} alt="Símbolo Psico na Vida" className="h-full max-h-[180px] w-auto invert" />
            
          </div>
          <div>
            <h4 className="font-subtitle text-sm uppercase tracking-wider text-primary-foreground/80 mb-4">Navegação</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Início</Link></li>
              <li><Link to="/postagens" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Publicações</Link></li>
              <li><Link to="/categorias" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Categorias</Link></li>
              <li><Link to="/sobre" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Sobre a Autora</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-subtitle text-sm uppercase tracking-wider text-primary-foreground/80 mb-4">Contato</h4>
            <div className="space-y-3">
              <a
                href="https://www.instagram.com/psiconavida"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
                
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                @psiconavida
              </a>
              <a
                href="https://www.linkedin.com/in/psiconavida"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
                
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                LinkedIn
              </a>
              <a
                href="http://lattes.cnpq.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
                
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
                Currículo Lattes
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/50 text-xs">
            © 2026 Psico na Vida. Todos os direitos reservados. O conteúdo deste blog não substitui acompanhamento profissional.
          </p>
        </div>
      </div>
    </footer>);

};

export default Footer;