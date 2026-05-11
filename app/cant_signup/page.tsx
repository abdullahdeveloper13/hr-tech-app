"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Users, Clock, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [department, setDepartment] = useState("")
  const [position, setPosition] = useState("")
  const [hireDate, setHireDate] = useState("")
  const [role, setRole] = useState("EMPLOYEE")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  // Redirect to 404 page immediately
  if (typeof window !== "undefined") {
    router.replace("/404")
    return null
  }
  // Redirect if already authenticated
  if (user) {
    router.push("/dashboard")
    return null
  }

  /* Can't signup due to the production build - it is reserver for company employee only */
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setLoading(true)
  //   setError("")

  //   try {
  //     const response = await fetch("/api/auth/register", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email,
  //         password,
  //         firstName,
  //         lastName,
  //         employeeId,
  //         department,
  //         position,
  //         hireDate,
  //         role,
  //       }),
  //     })

    //   const data = await response.json()

    //   if (!response.ok) {
    //     throw new Error(data.error || "Registration failed")
    //   }

    //   // Redirect to login page after successful registration
    //   router.push("/login?message=Registration successful! Please sign in.")
    // } catch (error) {
    //   setError(error instanceof Error ? error.message : "An error occurred. Please try again.")
    // } finally {
    //   setLoading(false)
    // }
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">HR - Zero to One</h1>
                <p className="text-slate-600">Professional HR Management</p>
              </div>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed">
              Streamline your workforce management with our comprehensive HR platform. Track attendance, manage leave
              requests, and empower your team with self-service tools.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Employee Management</h3>
                <p className="text-sm text-slate-600">Complete employee profiles and directory</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Time Tracking</h3>
                <p className="text-sm text-slate-600">Automated check-in and attendance</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Leave Management</h3>
                <p className="text-sm text-slate-600">Streamlined leave requests and approvals</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Analytics & Reports</h3>
                <p className="text-sm text-slate-600">Comprehensive workforce insights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Signup Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-2 text-center">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">HR - 021</span>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Create Account</CardTitle>
              <CardDescription className="text-slate-600">Register a new employee account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <form className="space-y-4">
              {/* <form onSubmit={handleSubmit} className="space-y-4"> */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-700 font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      required
                      className="h-11 border-slate-200 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-700 font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      required
                      className="h-11 border-slate-200 focus:border-black focus:ring-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                    className="h-11 border-slate-200 focus:border-black focus:ring-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="h-11 border-slate-200 focus:border-black focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId" className="text-slate-700 font-medium">
                      Employee ID
                    </Label>
                    <Input
                      id="employeeId"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="EMP001"
                      required
                      className="h-11 border-slate-200 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hireDate" className="text-slate-700 font-medium">
                      Hire Date
                    </Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={hireDate}
                      onChange={(e) => setHireDate(e.target.value)}
                      required
                      className="h-11 border-slate-200 focus:border-black focus:ring-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-slate-700 font-medium">
                      Department
                    </Label>
                    <Select value={department} onValueChange={setDepartment} required>
                      <SelectTrigger className="h-11 border-slate-200 focus:border-black focus:ring-black">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-slate-700 font-medium">
                      Position
                    </Label>
                    <Input
                      id="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Job title"
                      required
                      className="h-11 border-slate-200 focus:border-black focus:ring-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-700 font-medium">
                    Role
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-11 border-slate-200 focus:border-black focus:ring-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-black hover:bg-black/90 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-black font-medium hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

