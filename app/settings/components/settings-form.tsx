"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { CreditCard, User, Lock, LogOut, Trash2, Sparkles, CheckCircle2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClientBrowser } from "@/lib/supabase"

export function SettingsForm() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingUser(true)

      try {
        const supabase = createClientBrowser()

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setUser({
          id: session.user.id,
          email: session.user.email!,
        })

        setIsPremium(profile?.is_premium || false)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        })
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUserProfile()
  }, [router, toast])

  const handleSaveProfile = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const supabase = createClientBrowser()

      const { error } = await supabase
        .from("profiles")
        .update({
          email: user.email,
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const currentPassword = formData.get("current-password") as string
      const newPassword = formData.get("new-password") as string
      const confirmPassword = formData.get("confirm-password") as string

      if (newPassword !== confirmPassword) {
        throw new Error("New passwords don't match")
      }

      const supabase = createClientBrowser()

      // In a real implementation, you would verify the current password
      // before allowing the password change

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      })

      // Reset form
      const form = e.target as HTMLFormElement
      form.reset()
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setIsLoading(true)

    try {
      // In a real implementation, this would redirect to Stripe
      // or another payment processor

      // For demo purposes, we'll just update the user's premium status
      const supabase = createClientBrowser()

      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: true,
        })
        .eq("id", user?.id)

      if (error) throw error

      setIsPremium(true)

      toast({
        title: "Upgrade successful",
        description: "You are now a premium user",
      })
    } catch (error) {
      console.error("Error upgrading:", error)
      toast({
        title: "Error",
        description: "Failed to upgrade",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsLoading(true)

    try {
      // In a real implementation, this would cancel the subscription
      // with Stripe or another payment processor

      // For demo purposes, we'll just update the user's premium status
      const supabase = createClientBrowser()

      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
        })
        .eq("id", user?.id)

      if (error) throw error

      setIsPremium(false)

      toast({
        title: "Subscription cancelled",
        description: "Your premium subscription has been cancelled",
      })
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      const supabase = createClientBrowser()

      const { error } = await supabase.auth.signOut()

      if (error) throw error

      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      })

      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)

    try {
      const supabase = createClientBrowser()

      // Delete user data first
      const { error: deleteProfileError } = await supabase.from("profiles").delete().eq("id", user?.id)

      if (deleteProfileError) throw deleteProfileError

      // Delete ideas
      const { error: deleteIdeasError } = await supabase.from("ideas").delete().eq("user_id", user?.id)

      if (deleteIdeasError) throw deleteIdeasError

      // In a real implementation, you would also delete the user from Auth
      // This requires admin privileges, so it's typically done via a server action

      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully",
      })

      // Sign out and redirect
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingUser) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="profile" className="max-w-3xl mx-auto">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="profile" className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="subscription" className="flex items-center">
          <CreditCard className="h-4 w-4 mr-2" />
          Subscription
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center">
          <Lock className="h-4 w-4 mr-2" />
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                onChange={(e) => setUser((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="subscription">
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Current Plan</h3>
                  <p className="text-sm text-muted-foreground">{isPremium ? "Premium" : "Free"}</p>
                </div>
                {isPremium && (
                  <Badge className="bg-brand-primary text-primary-foreground">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>

              {isPremium ? (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Premium Plan</h4>
                        <p className="text-sm text-muted-foreground">$9.99/month</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-brand-primary" />
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-brand-primary mr-2" />
                        Unlimited ideas
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-brand-primary mr-2" />
                        AI-powered nurturing
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-brand-primary mr-2" />
                        Export options (PDF, text)
                      </li>
                    </ul>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cancelling your subscription will downgrade your account to the free plan at the end of your
                          current billing period.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Nevermind</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription}>Cancel Subscription</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Free Plan</h4>
                        <p className="text-sm text-muted-foreground">Limited features</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-brand-primary mr-2" />
                        Up to 5 ideas
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="h-4 w-4 mr-2">✕</span>
                        AI-powered nurturing
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="h-4 w-4 mr-2">✕</span>
                        Export options
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border p-4 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border-brand-primary/20">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Premium Plan</h4>
                        <p className="text-sm text-muted-foreground">$9.99/month</p>
                      </div>
                      <Sparkles className="h-5 w-5 text-brand-primary" />
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-brand-primary mr-2" />
                        Unlimited ideas
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-brand-primary mr-2" />
                        AI-powered nurturing
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-brand-primary mr-2" />
                        Export options (PDF, text)
                      </li>
                    </ul>
                  </div>

                  <Button
                    className="w-full bg-brand-primary hover:bg-brand-primary/90"
                    onClick={handleUpgrade}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Upgrade to Premium
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" name="current-password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" name="new-password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" name="confirm-password" type="password" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="bg-brand-primary hover:bg-brand-primary/90">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account access and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                  Log Out
                </Button>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full flex items-center justify-center">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data
                      from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

