"use client";

import { z } from "velite";
import { posts } from "../../../../velite.config";
import { BlogCard } from "./blog-card";
import { motion } from "framer-motion";

interface BlogListProps {
  posts: z.infer<typeof posts.schema>[];
}

const BlogList = ({ posts }: BlogListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {posts.map((blog, index) => (
          <motion.div
            key={blog.slug}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2, duration: 1.5 }}
          >
            <BlogCard blog={blog} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BlogList;
