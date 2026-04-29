import { Link } from "react-router-dom";
import type { Category } from "@/lib/types";
import placeholder from "@/assets/tree-symbol.png";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link to={`/categoria/${category.slug}`} className="group block">
      <article className="relative rounded-organic overflow-hidden aspect-[16/9] shadow-sm hover:shadow-lg transition-shadow">
        <img
          src={category.image || placeholder}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-heading text-xl text-card mb-1">
            {category.name}
          </h3>
          <p className="text-card/80 text-sm font-body">
            {category.description}
          </p>
          <span className="text-card/60 text-xs mt-2 inline-block">
            {category.postCount} publicações
          </span>
        </div>
      </article>
    </Link>
  );
};

export default CategoryCard;
