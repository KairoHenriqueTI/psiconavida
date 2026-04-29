import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { fetchPublishedPosts, fetchCategories } from "@/lib/cms";

const Postagens = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("categoria") || "";
  const initialSearch = searchParams.get("busca") || "";

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const { data: posts = [] } = useQuery({
    queryKey: ["public-posts"],
    queryFn: fetchPublishedPosts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: fetchCategories,
  });

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (activeCategory) {
      result = result.filter((p) => p.categorySlug === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.categorySlug.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      );
    }

    return result;
  }, [posts, activeCategory, searchQuery]);

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set("categoria", slug);
    } else {
      params.delete("categoria");
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <>
      <Header />
      <main>
        <section className="py-16">
          <div className="container">
            <h1 className="font-heading text-4xl text-foreground mb-4">Publicações</h1>
            <p className="text-muted-foreground text-sm mb-8 max-w-2xl">
              Todas as publicações do Psico na Vida, organizadas das mais recentes para as mais antigas.
            </p>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, categoria ou conteúdo..."
                className="w-full max-w-md bg-card border border-border rounded-organic px-5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring font-body"
              />
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => handleCategoryChange("")}
                className={`text-xs font-subtitle px-4 py-2 rounded-organic transition-colors ${
                  activeCategory === ""
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`text-xs font-subtitle px-4 py-2 rounded-organic transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Posts grid */}
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                Nenhuma publicação encontrada.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Postagens;
