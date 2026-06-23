"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type Role = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE"

interface Employee {
  id: string
  firstName: string
  lastName: string
  position: string
  department: string
  employeeId: string
}

interface SessionUser {
  id: string
  email: string
  role: Role
  employee?: Employee | null
}

export interface Session {
  user: SessionUser
}

export type SessionStatus = "loading" | "authenticated" | "unauthenticated"

interface SessionContextValue {
  session: Session | null
  status: SessionStatus
  setSession: (session: Session | null) => void
  setStatus: (status: SessionStatus) => void
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<SessionStatus>("loading")

  const hydrateSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" })
      if (!response.ok) {
        setSession(null)
        setStatus("unauthenticated")
        return
      }

      const data = await response.json()
      if (!data?.user) {
        setSession(null)
        setStatus("unauthenticated")
        return
      }

      setSession({ user: data.user })
      setStatus("authenticated")
    } catch (error) {
      console.error("[auth] Failed to hydrate session", error)
      setSession(null)
      setStatus("unauthenticated")
    }
  }, [])

  useEffect(() => {
    hydrateSession()
  }, [hydrateSession])

  useEffect(() => {
    function handleLogin(event: Event) {
      const detail = (event as CustomEvent).detail as SessionUser | undefined
      if (detail) {
        setSession({ user: detail })
        setStatus("authenticated")
      }
    }

    function handleLogout() {
      setSession(null)
      setStatus("unauthenticated")
    }

    window.addEventListener("auth:login", handleLogin)
    window.addEventListener("auth:logout", handleLogout)

    return () => {
      window.removeEventListener("auth:login", handleLogin)
      window.removeEventListener("auth:logout", handleLogout)
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      status,
      setSession,
      setStatus,
    }),
    [session, status],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider")
  }

  return {
    data: context.session,
    status: context.status,
  }
}

interface SignInOptions {
  email?: string
  password?: string
  redirect?: boolean
}

export async function signIn(provider: string, options: SignInOptions = {}) {
  if (provider !== "credentials") {
    return { ok: false, error: "UnsupportedProvider" }
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email: options.email, password: options.password }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { ok: false, error: "CredentialsSignin" }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:login", { detail: data.user }))
    }

    return { ok: true }
  } catch (error) {
    console.error("[auth] Sign-in failed", error)
    return { ok: false, error: "CredentialsSignin" }
  }
}

export async function signOut(options?: { callbackUrl?: string }) {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
  } catch (error) {
    console.error("[auth] Logout failed", error)
  } finally {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:logout"))
      if (options?.callbackUrl) {
        window.location.assign(options.callbackUrl)
      }
    }
  }
}
