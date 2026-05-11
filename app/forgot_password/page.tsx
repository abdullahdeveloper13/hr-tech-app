"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/api/auth"
import { toast } from "sonner"

function ForgotPasswordContent() {
  const search = useSearchParams()
  const token = search?.get("token") || ""
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error("Missing reset token")
    }
  }, [token])

  const handleChangePassword = async () => {
    if (!token) {
      toast.error("Missing token")
      return
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (password !== confirm) {
      toast.error("Passwords do not match")
      return
    }

    setSaving(true)
    try {
      await resetPassword(token, password)
      toast.success("Password changed. Redirecting to login...")
      router.push("/login")
    } catch (err) {
      console.error("[auth] Failed to reset password:", err)
      toast.error(err instanceof Error ? err.message : "Failed to reset password")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center my-16 gap-4">
      <h1 className="text-xl font-bold text-black dark:text-white">Change Your Password</h1>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <Label htmlFor="newpassword">Enter Your New Password</Label>
          <Input
            id="newpassword"
            className="w-64 text-black"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor="confirmpassword">Confirm Your Password</Label>
          <Input
            id="confirmpassword"
            className="w-64 text-black"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <Button
          onClick={handleChangePassword}
          className="bg-black dark:bg-white text-white dark:text-black px-2 py-2"
          disabled={saving || !token}
        >
          {saving ? "Saving..." : "Change Password"}
        </Button>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center my-16">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
