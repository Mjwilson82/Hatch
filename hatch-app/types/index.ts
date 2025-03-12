export type IdeaRating = 1 | 2 | 3 | 4 | 5

export interface Idea {
  id: string
  text: string
  excitement: IdeaRating
  difficulty: IdeaRating
  createdAt: string
  tags: string[]
  category?: string
}

export interface User {
  id: string
  email: string
  isPremium: boolean
  ideaCount: number
}

