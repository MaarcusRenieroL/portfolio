"use client";

import Link from "next/link";
import { FC } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "~/components/ui/button";
import { FaArrowRight, FaCalendarAlt } from "react-icons/fa";
import { z } from "velite";
import { posts } from "../../../../velite.config";
import Image from "next/image";

type Props = {
  blog: z.infer<typeof posts.schema>;
};

export const BlogCard: FC<Props> = ({ blog }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200, damping: 12 }}
      className="rounded-2xl"
    >
      <Card className="flex flex-col justify-between">
        <Image
          src={blog.imageUrl}
          alt={blog.slugAsParams}
          width={100}
          height={100}
          className="h-64 w-full object-cover rounded-2xl"
        />
        <CardHeader>
          <CardTitle>{blog.title}</CardTitle>
          <CardDescription className="flex space-x-2">
            <FaCalendarAlt className="h-4 w-4" />
            <span>{new Date(blog.date).toDateString()}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>{blog.description}</CardContent>
        <CardFooter className="w-full items-center justify-end">
          <Link href={`/blog/${blog.slugAsParams}`}>
            <Button variant="outline" className="space-x-4">
              <p>Read More</p>
              <FaArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
