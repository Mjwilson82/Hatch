"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Star, BarChart, Search, MoreVertical, Download, Sparkles, Trash, Loader2 } from "lucide-react"
import type { Idea } from "@/types"
import { StarRating } from "@/components/star-rating"
import { getIdeas, deleteIdea } from "@/app/actions/idea-actions"
import { useToast } from "@/hooks/use-toast"

type IdeaRating = 1 | 2 | 3 | 4 | 5

interface IdeaListProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function IdeaList({ searchQuery, onSearchChange }: IdeaListProps) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchIdeas = async () => {
      setIsLoading(true)
      const result = await getIdeas()

      if (result.success) {
        setIdeas(result.data)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }

      setIsLoading(false)
    }

    fetchIdeas()
  }, [toast])

  const filteredIdeas = ideas.filter(
    (idea) =>
      idea.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)

    const result = await deleteIdea(id)

    if (result.success) {
      setIdeas(ideas.filter((idea) => idea.id !== id))
      toast({
        title: "Success",
        description: result.message,
      })
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }

    setDeletingId(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search ideas or tags..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {filteredIdeas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No ideas found. Start capturing your brilliant thoughts!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIdeas.map((idea) => (
            <Card key={idea.id} className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{idea.text}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/idea/${idea.id}`}>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </Link>
                      <Link href={`/nurture/${idea.id}`}>
                        <DropdownMenuItem>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Nurture with AI
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(idea.id)}
                        disabled={deletingId === idea.id}
                      >
                        {deletingId === idea.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{formatDate(idea.created_at)}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-1 mb-3">
                  {idea.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-brand-accent mr-1" />
                    <span className="text-sm font-medium mr-1">Excitement:</span>
                    <StarRating rating={idea.excitement as IdeaRating} readOnly />
                  </div>
                  <div className="flex items-center">
                    <BarChart className="h-4 w-4 text-brand-tertiary mr-1" />
                    <span className="text-sm font-medium mr-1">Difficulty:</span>
                    <StarRating rating={idea.difficulty as IdeaRating} readOnly />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Link href={`/idea/${idea.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

