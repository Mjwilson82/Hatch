"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, X } from "lucide-react"
import Link from "next/link"

export function PremiumBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Card className="bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 border-border/50">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-brand-primary mr-2" />
          <div>
            <p className="font-medium">Upgrade to Premium</p>
            <p className="text-sm text-muted-foreground">Unlock AI nurturing, unlimited ideas, and export options</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button className="bg-brand-primary hover:bg-brand-primary/90">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setIsVisible(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

