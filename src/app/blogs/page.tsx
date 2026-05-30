import { BlogClient } from "~/components/misc/blog-client";
import { getAllPosts } from "~/lib/blogs";

export default async function BlogPage() {
  const posts = getAllPosts();

  return <BlogClient posts={posts} />;
}
