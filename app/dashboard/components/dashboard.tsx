"use client"

import { useState } from "react"
import { IdeaCapture } from "./idea-capture"
import { IdeaList } from "./idea-list"
import { PremiumBanner } from "./premium-banner"

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Ideas</h1>
      <PremiumBanner />
      <IdeaCapture />
      <IdeaList searchQuery={searchQuery} onSearchChange={setSearchQuery} />
    </div>
  )
}

