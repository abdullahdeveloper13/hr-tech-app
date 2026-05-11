"use client"

import React from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Building2,
  Users,
  Clock,
  Calendar,
  BarChart3,
  User,
  Settings,
  LogOut,
  BookOpen,
  History,
  Bell,
  UserCheck,
  HelpCircle,
  Home,
  FileText,
  TrendingUp,
  Shield,
  X,
  Mail,
  UserRoundX,
  Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Description } from "@radix-ui/react-dialog"

const navigation = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: Home, 
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    description: "Overview and insights"
  },
  {
    name: "Check-in/Check-out",
    href: "/dashboard/checkin",
    icon: Clock,
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    description: "Track attendance"
  },
  { 
    name: "Employees", 
    href: "/dashboard/employees", 
    icon: Users, 
    roles: ["ADMIN", "HR", "MANAGER"],
    description: "Manage team members"
  },
  { 
    name: "Employee Absents", 
    href: "/dashboard/employee-absent", 
    icon: UserRoundX, 
    roles: ["ADMIN"],
    description: "Absentees of employees"
  },
  { 
    name: "Offer Letter", 
    href: "/dashboard/offer-letter", 
    icon: Mail, 
    roles: ["ADMIN", "HR"],
    description: "Send offer letters"
  },
  { 
    name: "Send Email", 
    href: "/dashboard/send-email", 
    icon: Mail, 
    roles: ["ADMIN"],
    description: "Send emails to employees"
  },
  { 
    name: "Leave Management", 
    href: "/dashboard/leave", 
    icon: Calendar, 
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    description: "Time off requests"
  },
  { 
    name: "My Reports", 
    href: "/dashboard/my-reports", 
    icon: FileText, 
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    description: "View your reports",
    adminLabel: "View Reports"
  },
  { 
    name: "Reports & Analytics", 
    href: "/dashboard/reports", 
    icon: TrendingUp, 
    roles: ["ADMIN", "HR"],
    description: "Data insights"
  },
  { 
    name: "Resources", 
    href: "/dashboard/resources", 
    icon: BookOpen, 
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    description: "Company resources"
  },
  { 
    name: "Settings", 
    href: "/dashboard/settings", 
    icon: Settings, 
    roles: ["ADMIN", "HR"],
    description: "System configuration"
  },
  { 
    name: "My Profile", 
    href: "/dashboard/profile", 
    icon: User, 
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    description: "View and edit profile"
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { data: session } = useSession()
  const user = session?.user
  const pathname = usePathname()

  const filteredNavigation = navigation.filter((item) => item.roles.includes((user as any)?.role || ""))

  // Function to get display name
  const getDisplayName = (item: typeof navigation[0]) => {
    if (item.adminLabel && (user as any)?.role === "ADMIN") {
      return item.adminLabel
    }
    return item.name
  }

  return (
    <div className="sidebar-container">
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg flex flex-col h-full transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="lg:hidden flex justify-end p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--primary)] rounded-xl p-3 shadow-lg">
              <Image
                src="/icon white.png"
                alt="Company Logo"
                width={1500}
                height={1500}
                className="h-8 w-8"
                priority
              />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Zero to One</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs capitalize">
                  {user?.role?.toLowerCase() === "employee" ? "Member" : user?.role?.toLowerCase()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator className=" mb-6" />

        <nav className="px-4 space-y-1 ">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            const displayName = getDisplayName(item)
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024 && onClose) {
                    onClose()
                  }
                }}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md cursor-pointer",
                  isActive
                    ? "bg-gradient-to-r from-black to-gray-800 text-white shadow-lg transform scale-105"
                    : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive 
                    ? "bg-white/20" 
                    : "bg-slate-100 dark:bg-slate-700 group-hover:bg-black/10 dark:group-hover:bg-black/20"
                )}>
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors",
                    isActive 
                      ? "text-white" 
                      : "text-slate-600 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{displayName}</div>
                  <div className={cn(
                    "text-xs transition-colors",
                    isActive 
                      ? "text-white/80" 
                      : "text-slate-500 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mb-auto">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-xl p-4 space-y-3 shadow-xl border border-slate-700 dark:border-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.employee?.firstName?.[0]}{user?.employee?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">
                  {user?.employee?.firstName} {user?.employee?.lastName}
                </p>
                <p className="text-slate-300 text-xs truncate">{user?.employee?.position}</p>
              </div>
            </div>
            <Separator className="bg-slate-600 dark:bg-slate-500" />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}