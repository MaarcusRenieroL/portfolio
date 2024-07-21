import { BlogCard } from "./_components/blog-card";
import { Header } from "~/components/header";
import { posts } from "#site/content";
import { QueryPagination } from "./_components/pagination";

interface Props {
  searchParams: {
    page?: string;
  };
}

const POSTS_PER_PAGE = 4;

export default function BlogPage({ searchParams }: Props) {
  posts.sort((a, b) => {
    if (a.date > b.date) {
      return -1;
    }

    if (b.date > a.date) {
      return 1;
    }

    return 0;
  });

  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const displayPosts = posts.slice(
    POSTS_PER_PAGE * (currentPage - 1),
    POSTS_PER_PAGE * currentPage,
  );

  return (
    <div>
      <Header title="Blog" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayPosts.map((blog) => (
          <BlogCard key={blog.slug} blog={blog} />
        ))}
      </div>
      <QueryPagination totalPages={totalPages} className="justify-end mt-4" />
    </div>
  );
}
