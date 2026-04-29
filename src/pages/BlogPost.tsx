import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import authorImgFallback from "@/assets/author.jpg";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { fetchPostBySlug, fetchPublishedPosts, fetchSiteContent } from "@/lib/cms";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["public-post", slug],
    queryFn: () => fetchPostBySlug(slug || ""),
    enabled: !!slug,
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ["public-posts"],
    queryFn: fetchPublishedPosts,
  });

  const { data: ethicalNotice } = useQuery({
    queryKey: ["site-content", "ethical_notice"],
    queryFn: () => fetchSiteContent("ethical_notice"),
  });

  const { data: aboutPreview } = useQuery({
    queryKey: ["site-content", "about_preview"],
    queryFn: () => fetchSiteContent("about_preview"),
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="py-16">
          <div className="container text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="py-16">
          <div className="container text-center">
            <h1 className="font-heading text-3xl text-foreground mb-4">Publicação não encontrada</h1>
            <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const formattedDate = new Date(post.date).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const relatedPosts = allPosts.filter((p) => p.categorySlug === post.categorySlug && p.id !== post.id).slice(0, 3);
  const authorImg = aboutPreview?.image_author || authorImgFallback;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Person", name: "Psico na Vida" },
    publisher: { "@type": "Organization", name: "Psico na Vida" },
  };

  return (
    <>
      <Header />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Hero Banner */}
        <div className="relative aspect-[4/3] sm:aspect-[21/9] md:aspect-[21/5] overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0">
            <div className="container py-6 md:py-12">
              <Link
                to={`/categoria/${post.categorySlug}`}
                className="text-xs font-subtitle uppercase tracking-wider text-card/80 hover:text-card transition-colors"
              >
                {post.category}
              </Link>
              <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl text-card mt-2 max-w-3xl">
                {post.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-card/70 mt-3">
                <time dateTime={post.date}>{formattedDate}</time>
                <span>·</span>
                <span>{post.readTime} de leitura</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <article className="py-12">
          <div className="container">
            <div
              className="prose prose-lg max-w-none font-body text-foreground
                [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4
                [&_p]:text-muted-foreground [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-4
                [&_strong]:text-foreground
                [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-primary"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author bio */}
            <div className="mt-12 flex items-center gap-4">
              <img
                src={authorImg}
                alt="Autora do Psico na Vida"
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
              <div>
                <p className="text-sm font-subtitle text-foreground">Psico na Vida</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Psicóloga apaixonada por tornar a psicologia acessível e presente no cotidiano.
                </p>
              </div>
            </div>

            {/* Aviso ético */}
            <div className="mt-8 p-6 bg-accent rounded-organic">
              <p className="text-xs text-accent-foreground/70 font-body leading-relaxed">
                <strong className="text-accent-foreground">Aviso:</strong>{" "}
                {ethicalNotice?.text || "O conteúdo deste blog tem caráter informativo e educativo. Não substitui o acompanhamento de um profissional de saúde mental. Se você sente que precisa de apoio, procure um psicólogo."}
              </p>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 bg-card">
            <div className="container">
              <h2 className="font-heading text-2xl text-foreground mb-6">Leia também</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
