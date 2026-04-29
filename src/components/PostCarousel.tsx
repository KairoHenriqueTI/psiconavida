import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PostCard from "@/components/PostCard";
import type { BlogPost } from "@/lib/types";

interface PostCarouselProps {
  posts: BlogPost[];
  /** Breakpoint where it switches to grid. Default: "lg" */
  gridBreakpoint?: "md" | "lg";
  gridCols?: 2 | 3;
  /** Show 2 cols on tablet (md) even when gridBreakpoint is "lg" */
  tabletCols?: number;
}

const PostCarousel = ({ posts, gridBreakpoint = "lg", gridCols = 3, tabletCols }: PostCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector("div")?.offsetWidth || 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth - 24 : cardWidth + 24,
      behavior: "smooth",
    });
  };

  const bpHidden = gridBreakpoint === "md" ? "md:hidden" : "lg:hidden";
  
  let gridClass: string;
  let minWClass: string;

  if (tabletCols && gridBreakpoint === "lg") {
    // Tablet shows tabletCols grid, desktop shows gridCols grid
    gridClass = `md:grid md:grid-cols-${tabletCols} lg:grid-cols-${gridCols} md:overflow-visible`;
    minWClass = "min-w-full md:min-w-0";
  } else if (gridBreakpoint === "md") {
    gridClass = `md:grid ${gridCols === 2 ? "md:grid-cols-2" : "md:grid-cols-3"} md:overflow-visible`;
    minWClass = "min-w-full md:min-w-0";
  } else {
    gridClass = `lg:grid ${gridCols === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"} lg:overflow-visible`;
    minWClass = "min-w-full lg:min-w-0";
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={`flex ${gridClass} gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide`}
      >
        {posts.map((post, index) => (
          <div
            key={post.id}
            className={`${minWClass} snap-start h-auto md:h-full${
              tabletCols && gridBreakpoint === "lg" && index >= tabletCols
                ? " hidden lg:block"
                : ""
            }`}
          >
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* Arrows below */}
      <div className={`flex justify-center gap-4 mt-4 ${bpHidden}`}>
        <button
          onClick={() => scroll("left")}
          className="w-9 h-9 rounded-full bg-card shadow-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="w-9 h-9 rounded-full bg-card shadow-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Próximo"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PostCarousel;
