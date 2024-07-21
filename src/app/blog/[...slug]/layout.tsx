import Link from "next/link";
import { ReactNode } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Button } from "~/components/ui/button";

export default function BlogPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Link href="/blog">
        <Button variant="outline" className="space-x-4">
          <FaArrowLeft className="h-4 w-4" />
          <p>Back</p>
        </Button>
      </Link>
      {children}
    </div>
  );
}
