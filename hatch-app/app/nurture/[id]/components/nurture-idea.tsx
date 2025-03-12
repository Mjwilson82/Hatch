"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Sparkles,
  Download,
  Send,
  Loader2,
  CheckCircle2,
  FileText,
  ListChecks,
  FileQuestion,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import type { Idea } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClientBrowser } from "@/lib/supabase"

interface NurtureIdeaProps {
  id: string
}

export function NurtureIdea({ id }: NurtureIdeaProps) {
  const [idea, setIdea] = useState<Idea | null>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(true)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [outputFormat, setOutputFormat] = useState<string | null>(null)
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null)
  const [isLoadingIdea, setIsLoadingIdea] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchIdea = async () => {
      setIsLoadingIdea(true)

      try {
        const supabase = createClientBrowser()

        // First check if user is premium
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          toast({
            title: "Error",
            description: "You must be logged in to view ideas",
            variant: "destructive",
          })
          return
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_premium")
          .eq("id", session.user.id)
          .single()

        setIsPremium(profile?.is_premium || false)

        // Fetch the idea
        const { data, error } = await supabase.from("ideas").select("*").eq("id", id).single()

        if (error) throw error

        setIdea(data)
      } catch (error) {
        console.error("Error fetching idea:", error)
        toast({
          title: "Error",
          description: "Failed to load idea details",
          variant: "destructive",
        })
      } finally {
        setIsLoadingIdea(false)
      }
    }

    fetchIdea()
  }, [id, toast])

  useEffect(() => {
    // Scroll to bottom of messages
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    if (!isPremium && showPremiumPrompt) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to use AI nurturing",
      })
      return
    }

    const newMessage = { role: "user" as const, content: message }
    setMessages((prev) => [...prev, newMessage])
    setMessage("")
    setIsLoading(true)

    try {
      if (!idea) throw new Error("Idea not found")

      const response = await fetch("/api/nurture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ideaId: id,
          ideaText: idea.text,
          message: message,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to get AI response")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Failed to read response")

      let responseText = ""

      // Process the stream
      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = new TextDecoder().decode(value)
          responseText += chunk

          // Update the messages with the current accumulated response
          setMessages((prev) => {
            const newMessages = [...prev]
            // Check if we already have an assistant message
            const lastMessage = newMessages[newMessages.length - 1]

            if (lastMessage && lastMessage.role === "assistant") {
              // Update the existing message
              lastMessage.content = responseText
            } else {
              // Add a new assistant message
              newMessages.push({
                role: "assistant",
                content: responseText,
              })
            }

            return newMessages
          })
        }
      }

      await processStream()

      // Check if we need to set output format
      if (messages.length === 0) {
        // First message, do nothing special
      } else if (messages.length === 1) {
        setOutputFormat("pending")
      } else if (outputFormat === "pending") {
        if (message.toLowerCase().includes("checklist")) {
          setOutputFormat("checklist")
        } else if (message.toLowerCase().includes("guide")) {
          setOutputFormat("guide")
        } else if (message.toLowerCase().includes("prd") || message.toLowerCase().includes("product requirements")) {
          setOutputFormat("prd")
        }
      } else if (
        outputFormat &&
        !generatedOutput &&
        (message.toLowerCase().includes("yes") ||
          message.toLowerCase().includes("generate") ||
          message.toLowerCase().includes("create"))
      ) {
        // Generate the output
        generateFormattedOutput()
      }
    } catch (error) {
      console.error("Error in nurturing chat:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateFormattedOutput = async () => {
    if (!idea || !outputFormat) return

    try {
      setIsLoading(true)

      // Get context from the conversation
      const context = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(" ")

      const response = await fetch("/api/nurture", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ideaId: id,
          ideaText: idea.text,
          format: outputFormat,
          context,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate output")
      }

      const result = await response.json()
      setGeneratedOutput(result.output)

      // Add a message about the generated output
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I've generated a ${outputFormat} for your idea. You can view it in the output tab.`,
        },
      ])
    } catch (error) {
      console.error("Error generating output:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate output",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    if (!generatedOutput) return

    setIsExporting(true)

    try {
      // In a real implementation, this would call an API to generate a PDF
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user is premium
      if (!isPremium) {
        toast({
          title: "Premium Feature",
          description: "Upgrade to premium to export your nurtured ideas",
        })
        return
      }

      // Simulate download
      const blob = new Blob([generatedOutput], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${idea?.text.substring(0, 20)}-${outputFormat}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Output exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleUpgrade = () => {
    // In a real implementation, this would redirect to the payment page
    setIsPremium(true)
    setShowPremiumPrompt(false)

    toast({
      title: "Premium Activated",
      description: "You now have access to all premium features",
    })
  }

  if (isLoadingIdea) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    )
  }

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/idea/${id}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Idea
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Idea</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{idea.text}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {idea.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {!isPremium && showPremiumPrompt && (
            <Card className="mt-4 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border-brand-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Premium Feature</CardTitle>
                <CardDescription>AI nurturing is a premium feature</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Upgrade to premium to nurture your ideas with AI assistance.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-brand-primary hover:bg-brand-primary/90" onClick={handleUpgrade}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </CardFooter>
            </Card>
          )}

          {outputFormat && !showPremiumPrompt && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Output Format</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {outputFormat === "checklist" && (
                    <>
                      <ListChecks className="h-5 w-5 text-brand-primary mr-2" />
                      <span>Checklist</span>
                    </>
                  )}
                  {outputFormat === "guide" && (
                    <>
                      <FileText className="h-5 w-5 text-brand-secondary mr-2" />
                      <span>Detailed Guide</span>
                    </>
                  )}
                  {outputFormat === "prd" && (
                    <>
                      <FileQuestion className="h-5 w-5 text-brand-tertiary mr-2" />
                      <span>Product Requirements Document</span>
                    </>
                  )}
                  {outputFormat === "pending" && (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Selecting format...</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          {generatedOutput ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  Generated Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="markdown">Markdown</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview">
                    <div className="prose dark:prose-invert max-w-none">
                      {generatedOutput.split("\n").map((line, i) => {
                        if (line.startsWith("# ")) {
                          return (
                            <h1 key={i} className="text-2xl font-bold mt-4 mb-2">
                              {line.substring(2)}
                            </h1>
                          )
                        } else if (line.startsWith("## ")) {
                          return (
                            <h2 key={i} className="text-xl font-bold mt-3 mb-2">
                              {line.substring(3)}
                            </h2>
                          )
                        } else if (line.startsWith("- [ ] ")) {
                          return (
                            <div key={i} className="flex items-start mb-1">
                              <input type="checkbox" className="mt-1 mr-2" />
                              <span>{line.substring(6)}</span>
                            </div>
                          )
                        } else if (line.startsWith("- ")) {
                          return (
                            <li key={i} className="ml-4 mb-1">
                              {line.substring(2)}
                            </li>
                          )
                        } else if (line.trim() === "") {
                          return <br key={i} />
                        } else {
                          return (
                            <p key={i} className="mb-2">
                              {line}
                            </p>
                          )
                        }
                      })}
                    </div>
                  </TabsContent>
                  <TabsContent value="markdown">
                    <pre className="bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap">{generatedOutput}</pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleExport} disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export as PDF
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 text-brand-primary mr-2" />
                  AI Nurturing
                </CardTitle>
                <CardDescription>Chat with AI to develop your idea further</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="h-10 w-10 mx-auto mb-2 text-brand-primary" />
                      <p>Start chatting with AI to nurture your idea</p>
                      <p className="text-sm">Ask questions, get suggestions, and develop your idea further</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            msg.role === "user" ? "bg-brand-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg px-4 py-2 bg-muted">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse"></div>
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse delay-150"></div>
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse delay-300"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-center space-x-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={isLoading || !message.trim()}
                    className="bg-brand-primary hover:bg-brand-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

