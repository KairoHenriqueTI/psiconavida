import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCarousel from "@/components/PostCarousel";
import { fetchCategories, fetchPostsByCategory } from "@/lib/cms";

const Categorias = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: fetchCategories,
  });

  const filteredCategories = activeFilter
    ? categories.filter((c) => c.slug === activeFilter)
    : categories;

  return (
    <>
      <Header />
      <main>
        <section className="py-16">
          <div className="container">
            <h1 className="font-heading text-4xl text-foreground mb-4">Categorias</h1>
            <p className="text-muted-foreground text-sm mb-8 max-w-2xl">
              Explore nossos conteúdos organizados por tema. Cada categoria traz reflexões, dicas e conhecimentos para integrar a psicologia à sua vida.
            </p>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => setActiveFilter(null)}
                className={`text-xs font-subtitle px-4 py-2 rounded-organic transition-colors ${
                  activeFilter === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveFilter(cat.slug)}
                  className={`text-xs font-subtitle px-4 py-2 rounded-organic transition-colors ${
                    activeFilter === cat.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="space-y-16">
              {filteredCategories.map((cat) => (
                <CategorySection key={cat.slug} slug={cat.slug} name={cat.name} description={cat.description} image={cat.image} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

function CategorySection({ slug, name, description, image }: { slug: string; name: string; description: string; image: string }) {
  const { data: catPosts = [] } = useQuery({
    queryKey: ["public-posts-category", slug],
    queryFn: () => fetchPostsByCategory(slug),
  });

  const displayPosts = catPosts.slice(0, 6);

  return (
    <div>
      {/* Category Banner - hidden on mobile */}
      {image && (
        <div className="hidden md:block relative rounded-organic overflow-hidden aspect-[21/6] mb-8">
          <img src={image} alt={name} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent" />
          <div className="absolute inset-0 flex items-center p-8 md:p-12">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl text-card mb-2">{name}</h2>
              <p className="text-card/80 text-sm max-w-md">{description}</p>
            </div>
          </div>
        </div>
      )}
      {/* Mobile title */}
      <div className={image ? "md:hidden mb-6" : "mb-6"}>
        <h2 className="font-heading text-2xl text-foreground">{name}</h2>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>

      {displayPosts.length > 0 && (
        <PostCarousel posts={displayPosts} gridBreakpoint="lg" gridCols={3} tabletCols={2} />
      )}

      {catPosts.length > 0 && (
        <div className="mt-6">
          <Link
            to={`/postagens?categoria=${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-subtitle text-primary hover:underline transition-colors"
          >
            Ver todas as publicações <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default Categorias;
