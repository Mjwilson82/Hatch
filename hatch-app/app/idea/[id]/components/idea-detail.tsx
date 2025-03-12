"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, BarChart, Calendar, ArrowLeft, Sparkles, Download, Trash, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StarRating } from "@/components/star-rating"
import type { Idea } from "@/types"
import { useToast } from "@/hooks/use-toast"

// Mock data for demonstration
const mockIdeas: Record<string, Idea> = {
  "1": {
    id: "1",
    text: "Create a mobile app that helps people track their daily water intake with gamification elements",
    excitement: 5,
    difficulty: 3,
    createdAt: new Date(2023, 5, 15).toISOString(),
    tags: ["Health", "Mobile", "Gamification"],
  },
  "2": {
    id: "2",
    text: "Design a sustainable packaging solution for food delivery services",
    excitement: 4,
    difficulty: 4,
    createdAt: new Date(2023, 6, 22).toISOString(),
    tags: ["Sustainability", "Design", "Food"],
  },
  "3": {
    id: "3",
    text: "Build a browser extension that summarizes long articles using AI",
    excitement: 5,
    difficulty: 2,
    createdAt: new Date(2023, 7, 10).toISOString(),
    tags: ["AI", "Productivity", "Browser Extension"],
  },
  "4": {
    id: "4",
    text: "Create a community garden planning tool that helps urban neighborhoods organize shared spaces",
    excitement: 3,
    difficulty: 3,
    createdAt: new Date(2023, 8, 5).toISOString(),
    tags: ["Community", "Urban Planning", "Gardening"],
  },
}

interface IdeaDetailProps {
  id: string
}

export function IdeaDetail({ id }: IdeaDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // In a real implementation, this would fetch the idea from an API
  const idea = mockIdeas[id]

  if (!idea) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Idea Not Found</h2>
        <p className="text-muted-foreground mb-4">The idea you're looking for doesn't exist or has been deleted.</p>
        <Link href="/dashboard">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    // Simulate API call to delete the idea
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success!",
        description: "Your idea has been deleted",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete your idea. Please try again.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)

    // Simulate API call to export the idea
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to export your ideas",
      })

      setIsExporting(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export your idea. Please try again.",
        variant: "destructive",
      })
      setIsExporting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{idea.text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-brand-accent mr-2" />
                <span className="font-medium">Excitement:</span>
              </div>
              <StarRating rating={idea.excitement} readOnly size="lg" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <BarChart className="h-5 w-5 text-brand-tertiary mr-2" />
                <span className="font-medium">Difficulty:</span>
              </div>
              <StarRating rating={idea.difficulty} readOnly size="lg" />
            </div>
          </div>

          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Created on {formatDate(idea.createdAt)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Link href={`/nurture/${idea.id}`} className="w-full sm:w-auto">
            <Button className="w-full bg-brand-primary hover:bg-brand-primary/90">
              <Sparkles className="mr-2 h-4 w-4" />
              Nurture with AI
            </Button>
          </Link>

          <Button variant="outline" className="w-full sm:w-auto" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto" disabled={isDeleting}>
                {isDeleting ? (
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
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your idea.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  )
}

