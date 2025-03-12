"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { IdeaRating } from "@/types"

interface StarRatingProps {
  rating: IdeaRating
  onChange?: (rating: IdeaRating) => void
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
  label?: string
}

export function StarRating({ rating, onChange, readOnly = false, size = "md", label }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const handleClick = (index: number) => {
    if (readOnly) return
    onChange?.((index + 1) as IdeaRating)
  }

  return (
    <div className="flex items-center">
      {label && <span className="mr-2 text-sm">{label}</span>}
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          const isActive = hoverRating !== null ? index < hoverRating : index < rating

          return (
            <Star
              key={index}
              className={cn(
                sizeClasses[size],
                "cursor-pointer transition-colors",
                isActive ? "text-brand-accent fill-brand-accent" : "text-muted-foreground",
                !readOnly && "hover:text-brand-accent",
              )}
              onClick={() => handleClick(index)}
              onMouseEnter={() => !readOnly && setHoverRating(index + 1)}
              onMouseLeave={() => !readOnly && setHoverRating(null)}
            />
          )
        })}
      </div>
    </div>
  )
}

