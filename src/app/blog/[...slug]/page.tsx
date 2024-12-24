"use client";

import { posts } from "#site/content";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { MDXContent } from "./_components/mdx-content";

interface Props {
  slug: string[];
}

export default async function BlogContentPage({
  params,
}: {
  params: Promise<Props>;
}) {
  const { slug } = await params;

  const post = posts.find(post => post.slugAsParams === slug.join("/"));

  if (!post) {
    redirect("/blog");
  }

  return (
    <motion.article
      className="container py-6 prose dark:prose-invert max-w-3xl mx-auto md:mt-20 mt-5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.h1
        className="text-center mb-2"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {post.title}
      </motion.h1>

      {post.description ? (
        <motion.p
          className="text-center text-xl mt-0 text-muted-foreground"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {post.description}
        </motion.p>
      ) : null}

      <hr className="my-4" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.6 }}
        viewport={{ once: true }}
      >
        <MDXContent code={post.body} />
      </motion.div>
    </motion.article>
  );
}
