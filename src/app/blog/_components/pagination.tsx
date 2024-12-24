"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { FC } from "react";
import { motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "~/components/ui/pagination";

interface Props {
  totalPages: number;
  className?: string;
}

export const QueryPagination: FC<Props> = ({ totalPages, className }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;

  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        {prevPage >= 1 ? (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PaginationItem>
              <PaginationPrevious href={createPageURL(prevPage)} />
            </PaginationItem>
          </motion.div>
        ) : null}

        {Array(totalPages)
          .fill("")
          .map((_, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1, // Staggered animation
              }}
              key={`page-button-${index}`}
            >
              <PaginationItem className="inline-block">
                <PaginationLink
                  isActive={currentPage === index + 1}
                  href={createPageURL(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            </motion.div>
          ))}

        {nextPage <= totalPages ? (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PaginationItem>
              <PaginationNext href={createPageURL(nextPage)} />
            </PaginationItem>
          </motion.div>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
};
