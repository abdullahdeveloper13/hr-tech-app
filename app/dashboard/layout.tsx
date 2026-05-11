"use client"

import { Sidebar } from "@/components/sidebar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { DashboardSkeleton } from "@/components/ui/skeletons"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      // Add a small delay to ensure auth state has settled
      const timer = setTimeout(() => {
        router.push("/login")
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [status, router])

  // Role-based access control
  useEffect(() => {
    if (session?.user && status === "authenticated") {
      const currentPath = window.location.pathname
      
      // Define role-based access rules
      const accessRules = {
        '/dashboard/reports': ['ADMIN', 'HR'],
        '/dashboard/settings': ['ADMIN', 'HR'],
        '/dashboard/employees': ['ADMIN', 'HR', 'MANAGER'],
        '/dashboard/employees/new': ['ADMIN', 'HR'],
      }

      // Check if current path has restrictions
      for (const [path, allowedRoles] of Object.entries(accessRules)) {
        if (currentPath.startsWith(path) && !allowedRoles.includes((session.user as any).role)) {
          // Redirect to dashboard if user doesn't have access
          router.push("/dashboard")
          return
        }
      }
    }
  }, [session?.user, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-black/5 to-black/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 overflow-auto">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
              <DashboardSkeleton />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-black/5 to-black/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto">
          {/* Mobile header with hamburger menu */}
          <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Zero to One</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
