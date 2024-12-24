import { Header } from "~/components/header";
import { posts } from "#site/content";
import { QueryPagination } from "./_components/pagination";
import BlogList from "./_components/blog-list";

interface Props {
  searchParams: {
    page?: string;
  };
}

const POSTS_PER_PAGE = 4;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Props>;
}) {
  posts.sort((a, b) => {
    if (a.date > b.date) {
      return -1;
    }

    if (b.date > a.date) {
      return 1;
    }

    return 0;
  });

  const {
    searchParams: { page },
  } = await searchParams;

  const currentPage = Number(page) || 1;
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const displayPosts = posts.slice(
    POSTS_PER_PAGE * (currentPage - 1),
    POSTS_PER_PAGE * currentPage
  );

  return (
    <div>
      <Header title="Blog" />

      <BlogList posts={displayPosts} />

      <QueryPagination totalPages={totalPages} className="justify-end mt-4" />
    </div>
  );
}
