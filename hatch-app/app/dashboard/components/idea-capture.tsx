"use client"

import { useState, useRef, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/star-rating"
import { Mic, MicOff, Loader2 } from "lucide-react"
import type { IdeaRating } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { saveIdea } from "@/app/actions/idea-actions"
import { convertVoiceToText } from "@/lib/voice-to-text"

export function IdeaCapture() {
  const [ideaText, setIdeaText] = useState("")
  const [excitement, setExcitement] = useState<IdeaRating>(3)
  const [difficulty, setDifficulty] = useState<IdeaRating>(3)
  const [isRecording, setIsRecording] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  // References for media recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const handleVoiceCapture = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      mediaRecorderRef.current?.stop()
      return
    }

    try {
      // Start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Combine audio chunks into a single blob
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

        // Convert the audio to text
        try {
          toast({
            title: "Processing audio",
            description: "Converting your voice to text...",
          })

          const text = await convertVoiceToText(audioBlob)

          // Append the transcribed text to the idea text
          setIdeaText((prev) => {
            const separator = prev.trim() ? " " : ""
            return prev + separator + text
          })

          toast({
            title: "Voice recording completed",
            description: "Your idea has been captured",
          })
        } catch (error) {
          console.error("Error processing voice:", error)
          toast({
            title: "Error",
            description: "Failed to process voice recording",
            variant: "destructive",
          })
        }

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop())
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)

      toast({
        title: "Voice recording started",
        description: "Speak clearly to capture your idea",
      })
    } catch (error) {
      console.error("Error starting voice recording:", error)
      toast({
        title: "Error",
        description: "Failed to start voice recording. Please check your microphone permissions.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = () => {
    if (!ideaText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your idea before submitting",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append("text", ideaText)
    formData.append("excitement", excitement.toString())
    formData.append("difficulty", difficulty.toString())

    startTransition(async () => {
      const result = await saveIdea(formData)

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        })

        // Reset form
        setIdeaText("")
        setExcitement(3)
        setDifficulty(3)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle>What's your idea?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="idea" className="text-sm font-medium text-foreground">
              Describe your idea
            </label>
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={handleVoiceCapture}
              className="flex items-center gap-1"
              disabled={isPending}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Voice Capture
                </>
              )}
            </Button>
          </div>
          <Textarea
            id="idea"
            placeholder="Type or speak your idea here..."
            className="min-h-[100px] resize-none bg-background"
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            disabled={isPending || isRecording}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium block">How excited are you about this idea?</label>
            <StarRating rating={excitement} onChange={setExcitement} size="md" readOnly={isPending} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">How difficult does this seem?</label>
            <StarRating rating={difficulty} onChange={setDifficulty} size="md" readOnly={isPending} />
          </div>

          <Button
            className="sm:self-end bg-brand-primary hover:bg-brand-primary/90"
            onClick={handleSubmit}
            disabled={isPending || !ideaText.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Idea"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

