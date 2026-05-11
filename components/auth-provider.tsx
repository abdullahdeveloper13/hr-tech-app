"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface Employee {
  id: string
  firstName: string
  lastName: string
  position: string
  department: string
  employeeId: string
}

interface User {
  id: string
  email: string
  role: "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE"
  name: string
  employee?: Employee
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      // Only access localStorage after mounting to prevent hydration issues
      if (typeof window === 'undefined' || !mounted) return
      
      const mockUser = localStorage.getItem("mockUser")
      const mockToken = localStorage.getItem("mockToken")

      if (mockUser && mockToken) {
        // Verify the token is still valid by calling the /api/auth/me endpoint
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          const userData = {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            name: data.user.employee ? `${data.user.employee.firstName} ${data.user.employee.lastName}` : data.user.email,
            employee: data.user.employee,
          }
          setUser(userData)
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem("mockUser")
          localStorage.removeItem("mockToken")
          setUser(null)
        }
      } else {
        // No stored auth data, ensure user is null
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      // Clear invalid data
      if (typeof window !== 'undefined') {
        localStorage.removeItem("mockUser")
        localStorage.removeItem("mockToken")
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [mounted])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      checkAuth()
    }
  }, [mounted, checkAuth])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Store user data in localStorage for client-side state
      const userData = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.employee ? `${data.user.employee.firstName} ${data.user.employee.lastName}` : data.user.email,
        employee: data.user.employee,
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem("mockUser", JSON.stringify(userData))
        localStorage.setItem("mockToken", data.token)
      }
      setUser(userData)
      router.push("/dashboard")
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      // Call logout API to clear auth cookie
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem("mockUser")
        localStorage.removeItem("mockToken")
      }
      setUser(null)
      router.push("/login")
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
