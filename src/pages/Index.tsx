import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import PostCarousel from "@/components/PostCarousel";
import CategoryCard from "@/components/CategoryCard";
import { fetchPublishedPosts, fetchCategories, fetchSiteContent } from "@/lib/cms";
import heroBgFallback from "@/assets/hero-bg.jpg";
import authorImgFallback from "@/assets/author.jpg";

const Index = () => {
  const { data: posts = [] } = useQuery({
    queryKey: ["public-posts"],
    queryFn: fetchPublishedPosts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: fetchCategories,
  });

  const { data: hero } = useQuery({
    queryKey: ["site-content", "hero"],
    queryFn: () => fetchSiteContent("hero"),
  });

  const { data: aboutPreview } = useQuery({
    queryKey: ["site-content", "about_preview"],
    queryFn: () => fetchSiteContent("about_preview"),
  });

  const { data: manifesto } = useQuery({
    queryKey: ["site-content", "manifesto"],
    queryFn: () => fetchSiteContent("manifesto"),
  });

  const { data: newsletter } = useQuery({
    queryKey: ["site-content", "newsletter"],
    queryFn: () => fetchSiteContent("newsletter"),
  });

  const { data: ethicalNotice } = useQuery({
    queryKey: ["site-content", "ethical_notice"],
    queryFn: () => fetchSiteContent("ethical_notice"),
  });

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 4);

  const heroDesktop = hero?.image_desktop || heroBgFallback;
  const heroMobile = hero?.image_mobile || hero?.image_desktop || heroBgFallback;
  const authorImg = aboutPreview?.image_author || authorImgFallback;
  const secondaryImg = aboutPreview?.image_secondary || heroBgFallback;
  const newsletterBg = newsletter?.image || heroBgFallback;

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[50vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
          <img src={heroDesktop} alt="" className="absolute inset-0 w-full h-full object-cover hidden md:block" />
          <img src={heroMobile} alt="" className="absolute inset-0 w-full h-full object-cover md:hidden" />
          <div className="absolute inset-0 bg-foreground/30" />
          <div className="relative z-10 container text-center">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl text-card mb-4 animate-fade-in-up">
              {hero?.title || "Psico na Vida"}
            </h1>
            <p className="font-body text-base sm:text-lg md:text-xl text-card/90 max-w-2xl mx-auto mb-6" style={{ animationDelay: "0.2s" }}>
              {hero?.subtitle || "Psicologia que cabe no seu dia a dia. Respire psicologia."}
            </p>
            <p className="font-body text-xs sm:text-sm text-card/70 max-w-xl mx-auto">
              {hero?.description || ""}
            </p>
          </div>
        </section>

        {/* About Preview */}
        <section className="py-16 bg-accent relative overflow-hidden">
          <div className="container relative z-10">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="hidden lg:grid grid-cols-2 gap-4">
                  <img
                    src={authorImg}
                    alt="Autora do Psico na Vida"
                    className="w-full aspect-square object-cover rounded-organic shadow-md"
                  />
                  <img
                    src={secondaryImg}
                    alt="Psico na Vida"
                    className="w-full aspect-square object-cover rounded-organic shadow-md"
                  />
                </div>
                <img
                  src={authorImg}
                  alt="Autora do Psico na Vida"
                  className="lg:hidden w-full h-64 md:h-80 object-cover rounded-organic shadow-md"
                />
              </div>
              <div>
                <h2 className="font-heading text-3xl text-foreground mb-4">
                  {aboutPreview?.title || "Sobre o Projeto"}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {aboutPreview?.description || ""}
                </p>
                <blockquote className="border-l-4 border-primary pl-4 italic text-primary font-heading text-lg">
                  "{aboutPreview?.quote || ""}"
                </blockquote>
                {/* debug removed */}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-16">
            <div className="container">
              <h2 className="font-heading text-3xl text-foreground mb-8">Destaque</h2>
              <PostCard post={featuredPost} featured />
            </div>
          </section>
        )}

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <section className="py-16 bg-card">
            <div className="container">
              <h2 className="font-heading text-3xl text-foreground mb-8">Publicações Recentes</h2>
              <PostCarousel posts={recentPosts} gridBreakpoint="lg" gridCols={3} tabletCols={2} />
              <div className="mt-8">
                <Link
                  to="/postagens"
                  className="inline-flex items-center gap-1.5 text-sm font-subtitle text-primary hover:underline transition-colors"
                >
                  Ver todas <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section className="py-16">
            <div className="container">
              <h2 className="font-heading text-3xl text-foreground mb-8">Categorias</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {categories.map((cat) => (
                  <CategoryCard key={cat.slug} category={cat} />
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to="/categorias"
                  className="inline-flex items-center gap-1.5 text-sm font-subtitle text-primary hover:underline transition-colors"
                >
                  Ver todas <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Manifesto */}
        <section className="py-16 bg-secondary">
          <div className="container max-w-3xl text-center">
            <h2 className="font-heading text-3xl text-secondary-foreground mb-6">
              {manifesto?.title || "Manifesto"}
            </h2>
            <div className="font-heading text-lg text-secondary-foreground/80 leading-relaxed space-y-2">
              {(manifesto?.lines || [
                "Na Psiconavida, a vida respira saber,",
                "A psicologia é ponte, é jeito de viver.",
                "Nos gestos pequenos, no modo de escutar,",
                "Há ciência, cuidado e o ato de cuidar.",
                "É ética em prática, presença no dia,",
                "É palavra que abraça, é clareza que guia.",
              ]).map((line: string, i: number) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="relative py-20 overflow-hidden">
          <img src={newsletterBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/60" />
          <div className="container relative z-10 max-w-3xl text-center space-y-6">
            <h2 className="font-heading text-3xl text-card">
              {newsletter?.title || "Newsletter Psiconavida"}
            </h2>
            <p className="text-card/80 text-sm leading-relaxed">
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
            <p className="text-card/60 text-xs">{newsletter?.footer_text || "Publicações semanais · Gratuito"}</p>
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

export default Index;
