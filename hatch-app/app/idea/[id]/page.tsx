import { Navbar } from "@/components/navbar"
import { IdeaDetail } from "./components/idea-detail"

interface IdeaDetailPageProps {
  params: {
    id: string
  }
}

export default function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <IdeaDetail id={params.id} />
      </main>
    </div>
  )
}

