"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Home, Settings, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5 mr-2" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5 mr-2" />,
      active: pathname === "/settings",
    },
  ]

  const NavItems = () => (
    <>
      {routes.map((route) => (
        <Link key={route.href} href={route.href} onClick={() => setOpen(false)}>
          <Button variant={route.active ? "default" : "ghost"} className="w-full justify-start">
            {route.icon}
            {route.label}
          </Button>
        </Link>
      ))}
    </>
  )

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-8">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Hatch
          </span>
        </Link>

        {!isMobile && (
          <div className="ml-auto flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <NavItems />
            </div>
            <ModeToggle />
          </div>
        )}

        {isMobile && (
          <div className="ml-auto flex items-center space-x-2">
            <ModeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col space-y-2 mt-8">
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </nav>
  )
}

