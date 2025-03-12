"use client"

export async function convertVoiceToText(audioBlob: Blob): Promise<string> {
  try {
    // Create a FormData object to send the audio file
    const formData = new FormData()
    formData.append("audio", audioBlob, "recording.webm")

    // Send the audio file to the server for transcription
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to transcribe audio")
    }

    const data = await response.json()
    return data.text
  } catch (error) {
    console.error("Error converting voice to text:", error)
    throw error
  }
}

