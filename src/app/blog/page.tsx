import { BlogCard } from "./_components/blog-card";
import { Header } from "~/components/header";
import { BLOGS } from "~/lib/constants";

export default function BlogPage() {
  return (
    <div>
      <Header title="Blog" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {BLOGS.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  );
}
