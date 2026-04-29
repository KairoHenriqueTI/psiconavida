import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { fetchCategoryBySlug, fetchPostsByCategory } from "@/lib/cms";

const CategoriaPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading: catLoading } = useQuery({
    queryKey: ["public-category", slug],
    queryFn: () => fetchCategoryBySlug(slug || ""),
    enabled: !!slug,
  });

  const { data: categoryPosts = [] } = useQuery({
    queryKey: ["public-posts-category", slug],
    queryFn: () => fetchPostsByCategory(slug || ""),
    enabled: !!slug,
  });

  if (catLoading) {
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

  if (!category) {
    return (
      <>
        <Header />
        <main className="py-16">
          <div className="container text-center">
            <h1 className="font-heading text-3xl text-foreground mb-4">Categoria não encontrada</h1>
            <Link to="/categorias" className="text-primary hover:underline">Ver todas as categorias</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        {/* Banner */}
        {category.image && (
          <div className="relative aspect-[21/6] overflow-hidden">
            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <h1 className="font-heading text-4xl md:text-5xl text-card mb-2">{category.name}</h1>
                <p className="text-card/80 text-sm max-w-md">{category.description}</p>
              </div>
            </div>
          </div>
        )}

        <section className="py-16">
          <div className="container">
            {!category.image && (
              <div className="mb-8">
                <h1 className="font-heading text-4xl text-foreground mb-2">{category.name}</h1>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </div>
            )}
            {categoryPosts.length > 0 ? (
              <div className="flex lg:grid lg:grid-cols-3 gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                {categoryPosts.map((post) => (
                  <div key={post.id} className="min-w-full md:min-w-[45%] lg:min-w-0 snap-start">
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center">Nenhuma publicação nesta categoria ainda.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CategoriaPage;
