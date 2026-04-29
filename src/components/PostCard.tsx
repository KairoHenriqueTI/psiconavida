import { Link } from "react-router-dom";
import type { BlogPost } from "@/lib/types";

interface PostCardProps {
  post: BlogPost;
  featured?: boolean;
}

const PostCard = ({ post, featured = false }: PostCardProps) => {
  const formattedDate = new Date(post.date).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (featured) {
    return (
      <Link to={`/post/${post.slug}`} className="group block">
        <article className="grid md:grid-cols-2 gap-6 bg-card rounded-organic overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <span className="text-xs font-subtitle uppercase tracking-wider text-primary mb-2">
              {post.category}
            </span>
            <h2 className="font-heading text-2xl md:text-3xl text-foreground group-hover:text-primary transition-colors mb-3">
              {post.title}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <time dateTime={post.date}>{formattedDate}</time>
              <span>·</span>
              <span>{post.readTime} de leitura</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/post/${post.slug}`} className="group block h-full">
      <article className="bg-card rounded-organic overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <span className="text-xs font-subtitle uppercase tracking-wider text-primary mb-2">
            {post.category}
          </span>
          <h3 className="font-heading text-lg text-foreground group-hover:text-primary transition-colors mb-2 flex-1">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <time dateTime={post.date}>{formattedDate}</time>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default PostCard;
