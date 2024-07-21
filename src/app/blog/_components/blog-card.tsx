import Link from "next/link";
import { FC } from "react";
import { Blog } from "~/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import Image from "next/image";

type Props = {
  blog: Blog;
};

export const BlogCard: FC<Props> = ({ blog }) => {
  const url = blog.title.toLowerCase().split(" ").join("-");
  return (
    <Link href={url}>
      <Card className="rounded-2xl">
        <Image
          src={blog.imageUrl}
          alt={blog.title}
          height={100}
          width={100}
          className="h-64 w-full rounded-2xl object-cover"
        />
        <CardHeader>
          <CardTitle>{blog.title}</CardTitle>
          <CardDescription>{blog.date}</CardDescription>
        </CardHeader>
        <CardContent>{blog.description}</CardContent>
      </Card>
    </Link>
  );
};
