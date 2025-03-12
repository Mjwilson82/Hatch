import { Navbar } from "@/components/navbar"
import { Dashboard } from "./components/dashboard"

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8">
        <Dashboard />
      </main>
    </div>
  )
}

