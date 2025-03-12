import { type NextRequest, NextResponse } from "next/server"
import { streamNurturingChat, generateOutput } from "@/lib/openai"
import { auth } from "@/lib/auth"
import { createClientServer } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user is premium
    const supabase = createClientServer()
    const { data: profile } = await supabase.from("profiles").select("is_premium").eq("id", userId).single()

    if (!profile?.is_premium) {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 })
    }

    const { ideaId, message, ideaText } = await request.json()

    // Verify the idea belongs to the user
    if (ideaId) {
      const { data } = await supabase.from("ideas").select("user_id").eq("id", ideaId).single()

      if (data?.user_id !== userId) {
        return NextResponse.json({ error: "You do not have permission to access this idea" }, { status: 403 })
      }
    }

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        const onChunk = (chunk: string) => {
          controller.enqueue(new TextEncoder().encode(chunk))
        }

        try {
          await streamNurturingChat(ideaText, message, onChunk)
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    console.error("Error in nurturing API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user is premium
    const supabase = createClientServer()
    const { data: profile } = await supabase.from("profiles").select("is_premium").eq("id", userId).single()

    if (!profile?.is_premium) {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 })
    }

    const { ideaId, ideaText, format, context } = await request.json()

    // Verify the idea belongs to the user
    if (ideaId) {
      const { data } = await supabase.from("ideas").select("user_id").eq("id", ideaId).single()

      if (data?.user_id !== userId) {
        return NextResponse.json({ error: "You do not have permission to access this idea" }, { status: 403 })
      }
    }

    const output = await generateOutput(ideaText, format, context)

    return NextResponse.json({ output })
  } catch (error) {
    console.error("Error generating output:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

