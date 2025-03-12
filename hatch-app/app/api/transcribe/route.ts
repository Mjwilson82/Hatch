import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get form data with audio file
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert audio to base64
    const buffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(buffer).toString("base64")

    // Use OpenAI's Whisper model via the AI SDK
    const { text } = await generateText({
      model: openai("whisper"),
      prompt: "",
      system: "Transcribe the following audio accurately.",
      // Pass the audio file as base64
      audio: {
        data: base64Audio,
        type: audioFile.type,
      },
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error transcribing audio:", error)
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 })
  }
}

