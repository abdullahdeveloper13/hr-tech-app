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
import { ArrowLeft, Edit, Save, X, Mail, Phone, MapPin, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { FormSkeleton } from "@/components/ui/skeletons"

export default function NewEmployeePage() {
  const { data: session } = useSession()
  const user = session?.user
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    employeeId: "",
    department: "",
    position: "",
    salary: "",
    hireDate: "",
    phoneNumber: "",
    address: "",
    emergencyContact: "",
    role: "EMPLOYEE",
  })

  // Check permissions
  if (!["ADMIN", "HR"].includes(user?.role || "")) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/employees">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>You don't have permission to add employees.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create employee")
      }

      router.push("/dashboard/employees")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 lg:pt-6">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/dashboard/employees">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Add New Employee</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Create a new employee profile</p>
        </div>
      </div>

      <Card className="mx-auto">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl">Employee Information</CardTitle>
          <CardDescription>Fill in the details for the new employee</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
          {isLoading ? (
            <FormSkeleton fields={8} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
              {error && (
                <Alert variant="destructive" className="mb-4 lg:mb-6">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="employeeId" className="text-sm font-medium">Employee ID *</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => handleChange("employeeId", e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="hireDate" className="text-sm font-medium">Hire Date *</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => handleChange("hireDate", e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleChange("department", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
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
                <div className="space-y-3">
                  <Label htmlFor="position" className="text-sm font-medium">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="salary" className="text-sm font-medium">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => handleChange("salary", e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange("role", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      {user?.role === "ADMIN" && <SelectItem value="ADMIN">Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  className="min-h-[88px]"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange("emergencyContact", e.target.value)}
                  disabled={isLoading}
                  placeholder="Name and phone number"
                  className="h-11"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <Button type="submit" disabled={isLoading} size="sm" className="flex-1 sm:flex-none sm:px-8">
                  {isLoading ? "Creating..." : "Create Employee"}
                </Button>
                <Button type="button" variant="outline" asChild size="sm" className="flex-1 sm:flex-none sm:px-8">
                  <Link href="/dashboard/employees">Cancel</Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
