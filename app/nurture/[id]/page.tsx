import { Navbar } from "@/components/navbar"
import { NurtureIdea } from "./components/nurture-idea"

interface NurturePageProps {
  params: {
    id: string
  }
}

export default function NurturePage({ params }: NurturePageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <NurtureIdea id={params.id} />
      </main>
    </div>
  )
}

