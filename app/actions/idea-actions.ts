"use server"

import { createClientServer } from "@/lib/supabase"
import { generateIdeaTags, generateCategory } from "@/lib/openai"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

export async function saveIdea(formData: FormData) {
  try {
    const session = await auth()
    if (!session) {
      return { success: false, message: "You must be logged in to save ideas" }
    }

    const userId = session.user.id
    const text = formData.get("text") as string
    const excitement = Number.parseInt(formData.get("excitement") as string)
    const difficulty = Number.parseInt(formData.get("difficulty") as string)

    if (!text || !excitement || !difficulty) {
      return { success: false, message: "Missing required fields" }
    }

    // Check if user is on free plan and has reached the limit
    const supabase = createClientServer()
    const { data: profile } = await supabase.from("profiles").select("is_premium, idea_count").eq("id", userId).single()

    if (!profile.is_premium && profile.idea_count >= 5) {
      return {
        success: false,
        message: "You have reached the maximum number of ideas for the free plan. Please upgrade to premium.",
      }
    }

    // Generate tags and category using AI
    const [tags, category] = await Promise.all([generateIdeaTags(text), generateCategory(text)])

    // Save the idea
    const ideaId = uuidv4()
    const { error } = await supabase.from("ideas").insert({
      id: ideaId,
      user_id: userId,
      text,
      excitement,
      difficulty,
      tags,
      category,
      created_at: new Date().toISOString(),
    })

    if (error) throw error

    // Update the user's idea count
    await supabase
      .from("profiles")
      .update({ idea_count: profile.idea_count + 1 })
      .eq("id", userId)

    revalidatePath("/dashboard")
    return {
      success: true,
      message: "Idea saved successfully",
      ideaId,
    }
  } catch (error) {
    console.error("Error saving idea:", error)
    return { success: false, message: "Failed to save idea" }
  }
}

export async function getIdeas() {
  try {
    const session = await auth()
    if (!session) {
      return { success: false, message: "You must be logged in to view ideas" }
    }

    const userId = session.user.id
    const supabase = createClientServer()

    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching ideas:", error)
    return { success: false, message: "Failed to fetch ideas" }
  }
}

export async function deleteIdea(id: string) {
  try {
    const session = await auth()
    if (!session) {
      return { success: false, message: "You must be logged in to delete ideas" }
    }

    const userId = session.user.id
    const supabase = createClientServer()

    // First check if the idea belongs to the user
    const { data } = await supabase.from("ideas").select("user_id").eq("id", id).single()

    if (data?.user_id !== userId) {
      return { success: false, message: "You do not have permission to delete this idea" }
    }

    const { error } = await supabase.from("ideas").delete().eq("id", id)

    if (error) throw error

    // Update the user's idea count
    await supabase
      .from("profiles")
      .select("idea_count")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data && data.idea_count > 0) {
          return supabase
            .from("profiles")
            .update({ idea_count: data.idea_count - 1 })
            .eq("id", userId)
        }
      })

    revalidatePath("/dashboard")
    return { success: true, message: "Idea deleted successfully" }
  } catch (error) {
    console.error("Error deleting idea:", error)
    return { success: false, message: "Failed to delete idea" }
  }
}

