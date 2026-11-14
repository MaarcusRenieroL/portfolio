import type { Metadata } from "next";
import { BlogClient } from "~/components/site/blog-client";
import { getPosts } from "~/lib/data/blog";

export const metadata: Metadata = { title: "Writing", description: "What I learn while building: backend, systems, and the road to security and cloud." };

export default function BlogPage() {
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">Writing</h1>
        <p className="lead">What I learn while building: backend, systems, and the road to security and cloud.</p>
      </header>
      <BlogClient posts={getPosts()} />
    </div>
  );
}
