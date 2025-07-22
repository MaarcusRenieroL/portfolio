"use client"

import { Button } from "../ui/button"
import Link from "next/link"
import { useState } from "react"

export const Blog = () => {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="flex flex-col w-full gap-6">
      <h1 className="text-4xl font-bold">blog</h1>
      <div className="flex flex-col w-full gap-4">
        <p>posts coming soon...</p>
      </div>
      <div className="flex items-center justify-end w-full">
        <Link href="/blog">
          <Button
            size="sm"
            variant={hovered ? "default" : "outline"}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ transition: 'all 0.2s' }}
          >
            View all
          </Button>
        </Link>
      </div>
    </div>
  )
}
