import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchSiteContent } from "@/lib/cms";
import authorImgFallback from "@/assets/author.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import { ArrowRight } from "lucide-react";

const scientificArticles = [
  {
    title: "A importância do autoconhecimento na saúde mental contemporânea",
    journal: "Revista Brasileira de Psicologia",
    year: "2025",
    url: "https://example.com/artigo-1",
  },
  {
    title: "Relações interpessoais e bem-estar emocional: uma revisão integrativa",
    journal: "Psicologia: Ciência e Profissão",
    year: "2025",
    url: "https://example.com/artigo-2",
  },
];

const Sobre = () => {
  const { data: aboutPage } = useQuery({
    queryKey: ["site-content", "about_page"],
    queryFn: () => fetchSiteContent("about_page"),
  });

  const { data: newsletter } = useQuery({
    queryKey: ["site-content", "newsletter"],
    queryFn: () => fetchSiteContent("newsletter"),
  });

  const { data: ethicalNotice } = useQuery({
    queryKey: ["site-content", "ethical_notice"],
    queryFn: () => fetchSiteContent("ethical_notice"),
  });

  const authorImg = aboutPage?.author_image || authorImgFallback;
  const newsletterBg = newsletter?.image || heroBg;

  return (
    <>
      <Header />
      <main>
        {/* Sobre a autora */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-5 gap-10 items-start">
              <div className="md:col-span-2 flex flex-col items-center">
                <img
                  src={authorImg}
                  alt="Autora do Psico na Vida"
                  className="w-full max-w-xs aspect-square object-cover rounded-organic shadow-md"
                />
              </div>

              <div className="md:col-span-3 space-y-6">
                <h2 className="font-heading text-3xl text-foreground">
                  {aboutPage?.author_name || "Quem está por trás da Psico na Vida?"}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {aboutPage?.author_bio || "A Psiconavida nasceu do desejo de tornar a psicologia acessível, prática e emocionalmente significativa no cotidiano das pessoas."}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {aboutPage?.intro || "Sou estudante e apaixonada por psicologia, e criei este espaço para compartilhar reflexões, conteúdos e ferramentas que conectam teoria e vida real."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Missão, Visão e Valores */}
        <section className="py-16 bg-secondary">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <h3 className="font-heading text-xl text-secondary-foreground">
                  {aboutPage?.mission_title || "Missão"}
                </h3>
                <p className="text-secondary-foreground/70 text-sm leading-relaxed">
                  {aboutPage?.mission_text || "Inspirar pessoas a integrarem o saber psicológico às suas decisões, relações e forma de existir."}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-xl text-secondary-foreground">Visão</h3>
                <p className="text-secondary-foreground/70 text-sm leading-relaxed">
                  Ser referência em conteúdo de psicologia acessível, criando uma comunidade que valoriza o autoconhecimento e o cuidado emocional no dia a dia.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-xl text-secondary-foreground">Valores</h3>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {["Bem-estar", "Acolhimento", "Humanização", "Clareza", "Equilíbrio", "Conexão", "Leveza"].map((v) => (
                    <span key={v} className="bg-secondary-foreground/10 text-secondary-foreground text-xs font-subtitle px-3 py-1.5 rounded-organic">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proposta de Valor */}
        <section className="py-16">
          <div className="container text-center space-y-8">
            <h3 className="font-heading text-2xl text-foreground">Proposta de Valor</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto">
              A proposta de valor da Psiconavida é tornar a psicologia acessível, prática e emocionalmente significativa no cotidiano das pessoas.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              <div className="bg-card p-6 rounded-organic text-center shadow-sm">
                <h4 className="font-subtitle text-xs uppercase tracking-wider text-primary mb-2">Acessibilidade</h4>
                <p className="text-muted-foreground text-xs">Linguagem clara, sem jargões técnicos</p>
              </div>
              <div className="bg-card p-6 rounded-organic text-center shadow-sm">
                <h4 className="font-subtitle text-xs uppercase tracking-wider text-primary mb-2">Integração</h4>
                <p className="text-muted-foreground text-xs">Storytelling e experiências reais</p>
              </div>
              <div className="bg-card p-6 rounded-organic text-center shadow-sm">
                <h4 className="font-subtitle text-xs uppercase tracking-wider text-primary mb-2">Cotidiano</h4>
                <p className="text-muted-foreground text-xs">Psicologia aplicada a temas práticos</p>
              </div>
            </div>
          </div>
        </section>

        {/* Publicações Científicas */}
        <section className="py-16 bg-accent/30">
          <div className="container space-y-8">
            <h3 className="font-heading text-2xl text-foreground text-center">Publicações Científicas</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto text-center">
              Artigos publicados em revistas científicas, conectando pesquisa acadêmica à prática do autoconhecimento.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {scientificArticles.map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card p-6 rounded-organic shadow-sm hover:shadow-md transition-shadow block space-y-2"
                >
                  <h4 className="font-heading text-base text-foreground leading-snug">{article.title}</h4>
                  <p className="text-muted-foreground text-xs">
                    {article.journal} · {article.year}
                  </p>
                  <span className="inline-flex items-center gap-1 text-primary text-xs font-subtitle hover:underline">
                    Ler artigo completo <ArrowRight size={12} />
                  </span>
                </a>
              ))}
            </div>
            <div className="text-center">
              <a
                href="http://lattes.cnpq.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-subtitle text-primary hover:underline transition-colors"
              >
                Ver todas no Currículo Lattes <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="relative py-20 overflow-hidden">
          <img src={newsletterBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-secondary/85" />
          <div className="container relative z-10 max-w-3xl text-center space-y-6">
            <h2 className="font-heading text-3xl text-secondary-foreground">
              {newsletter?.title || "Newsletter Psiconavida"}
            </h2>
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              {newsletter?.description || ""}
            </p>
            <a
              href={newsletter?.button_url || "https://www.linkedin.com/newsletters/psiconavida"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-card text-foreground font-subtitle text-sm px-8 py-3 rounded-organic hover:bg-card/90 transition-colors shadow-md"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect width="4" height="12" x="2" y="9"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
              {newsletter?.button_text || "Assinar no LinkedIn"}
            </a>
            <p className="text-secondary-foreground/60 text-xs">
              {newsletter?.footer_text || "Publicações semanais · Gratuito"}
            </p>
          </div>
        </section>

        {/* Aviso Ético */}
        <section className="py-10 bg-accent/30">
          <div className="container max-w-3xl">
            <p className="text-xs text-accent-foreground/70 font-body leading-relaxed text-center">
              <strong className="text-accent-foreground">Aviso:</strong>{" "}
              {ethicalNotice?.text || "O conteúdo deste site tem caráter informativo e educativo. Não substitui o acompanhamento de um profissional de saúde mental. Se você sente que precisa de apoio, procure um psicólogo."}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Sobre;
