import { Navbar } from "@/components/navbar"
import { SettingsForm } from "./components/settings-form"

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <SettingsForm />
      </main>
    </div>
  )
}

