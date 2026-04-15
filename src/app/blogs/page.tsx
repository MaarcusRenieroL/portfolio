import { BlogClient } from "~/components/misc/blog-client";
import { getAllPosts } from "~/lib/blogs";

export default function BlogPage() {
  const posts = getAllPosts();

  return <BlogClient posts={posts} />;
}
