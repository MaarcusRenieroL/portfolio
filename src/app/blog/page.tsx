import { BlogCard } from "./_components/blog-card";
import { Header } from "~/components/header";
import { posts } from "#site/content";

export default function BlogPage() {
  posts.sort((a, b) => {
    if (a.date > b.date) {
      return -1;
    }

    if (b.date > a.date) {
      return 1;
    }

    return 0;
  });

  return (
    <div>
      <Header title="Blog" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {posts.map((blog) => (
          <BlogCard key={blog.slug} blog={blog} />
        ))}
      </div>
    </div>
  );
}
