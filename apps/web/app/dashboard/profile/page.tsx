"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Save, X, Mail, Phone, MapPin, Calendar, ArrowLeft, Shield, Building2, Clock } from "lucide-react"
import { ProfileSkeleton } from "@/components/ui/skeletons"
import { toast } from "sonner"
import Link from "next/link"
import { changeOwnPassword } from "@/lib/api/profile"
import { ApiError } from "@/lib/api/client"

interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  department: string
  position: string
  salary?: number
  hireDate: string
  phoneNumber?: string
  address?: string
  emergencyContact?: string
  status: string
  bankAccountNumber?: string
  bankIban?: string
  bankAccountTitle?: string
  bankDetailsUpdatedAt?: string
  user: {
    email: string
    role: string
  }
  leaveBalances?: Array<{
    leaveType: string
    totalDays: number
    usedDays: number
    remainingDays: number
  }>
  checkIns?: Array<{
    id: string
    checkInTime: string
    checkOutTime?: string
    totalHours?: number
  }>
  leaveRequests?: Array<{
    id: string
    leaveType: string
    startDate: string
    endDate: string
    status: string
    reason: string
  }>
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const isAdmin = user?.role === "ADMIN"
  
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [statusError, setStatusError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    emergencyContact: "",
    bankAccountNumber: "",
    bankIban: "",
    bankAccountTitle: "",
  })

  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    if (user?.employee?.id) {
      fetchEmployee()
    }
  }, [user])

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${user?.employee?.id}`)
      if (response.ok) {
        const data = await response.json()
        const employeeData = {
          ...data,
          checkIns: data.checkIns || [],
          leaveRequests: data.leaveRequests || [],
          leaveBalances: data.leaveBalances || [],
        }
        setEmployee(employeeData)
        setNewStatus(data.status)
        setEditData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.user?.email || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          emergencyContact: data.emergencyContact || "",
          bankAccountNumber: data.bankAccountNumber || "",
          bankIban: data.bankIban || "",
          bankAccountTitle: data.bankAccountTitle || "",
        })
      }
    } catch (error) {
      console.error("Failed to fetch employee:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setEmailError("")

    // ✅ Validate email before saving
    if (!validateEmail(editData.email)) {
      setEmailError("Please enter a valid email address")
      setSaving(false)
      toast.error("Invalid email format")
      return
    }

    try {
      const response = await fetch(`/api/employees/${employee?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        setEmployee(updatedEmployee)
        setEditing(false)
        
        toast.success("Profile updated successfully! 🎉", {
          description: "Your personal information has been saved.",
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to update profile")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      
      toast.error("Failed to update profile", {
        description: errorMessage,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async () => {
    if (!employee || newStatus === employee.status) {
      toast.info("No status change")
      return
    }

    setUpdatingStatus(true)
    setStatusError("")

    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        setEmployee(updatedEmployee)
        
        toast.success("Employment status updated! ✅", {
          description: `Status changed to ${newStatus.replace(/_/g, " ")}`,
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to update status")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setStatusError(errorMessage)
      
      toast.error("Failed to update status", {
        description: errorMessage,
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      firstName: employee?.firstName || "",
      lastName: employee?.lastName || "",
      email: employee?.user?.email || "",
      phoneNumber: employee?.phoneNumber || "",
      address: employee?.address || "",
      emergencyContact: employee?.emergencyContact || "",
      bankAccountNumber: employee?.bankAccountNumber || "",
      bankIban: employee?.bankIban || "",
      bankAccountTitle: employee?.bankAccountTitle || "",
    })
    setEditing(false)
    setError("")
    setEmailError("")
    setPasswordError("")
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleChangePassword = async () => {
    setPasswordError("")
    setIsChangingPassword(true)

    try {
      await changeOwnPassword(passwordData)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      toast.success("Password updated successfully")
    } catch (err) {
      const errorMessage =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Failed to update password"
      setPasswordError(errorMessage)
      toast.error("Failed to update password", {
        description: errorMessage,
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-600 text-white"
      case "INACTIVE":
        return "bg-yellow-600 text-white"
      case "ON_LEAVE":
        return "bg-blue-600 text-white"
      case "TERMINATED":
        return "bg-red-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case "ANNUAL":
        return "bg-black text-white"
      case "SICK":
        return "bg-red-600 text-white"
      case "PERSONAL":
        return "bg-blue-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  // ✅ Helper function to format timestamp
  const formatLastUpdated = (timestamp?: string) => {
    if (!timestamp) return null
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      relative: getRelativeTime(date)
    }
  }

  // ✅ Helper function for relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ProfileSkeleton />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/employees">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        </div>
      </div>
    )
  }

  const bankDetailsLastUpdated = formatLastUpdated(employee.bankDetailsUpdatedAt)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">View and manage your personal information</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarFallback className="bg-black text-white text-xl">
                    {getInitials(employee.firstName, employee.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p className="text-muted-foreground">{employee.position}</p>
                  <Badge className={`mt-2 ${getStatusColor(employee.status)}`}>
                    {employee.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.user.email}</span>
                </div>
                {employee.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.phoneNumber}</span>
                  </div>
                )}
                {employee.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Joined {new Date(employee.hireDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Admin: Update Status
                </CardTitle>
                <CardDescription>Change employment status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {statusError && (
                  <Alert variant="destructive">
                    <AlertDescription>{statusError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="status">Employment Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                      <SelectItem value="TERMINATED">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleStatusChange}
                  disabled={updatingStatus || newStatus === employee.status}
                  className="w-full"
                >
                  {updatingStatus ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Status
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="bank">Bank Details</TabsTrigger>
              <TabsTrigger value="attendance">My Attendance</TabsTrigger>
              <TabsTrigger value="leave">My Leave</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    {editing ? "Update your personal details" : "Your personal details"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={editData.firstName}
                            onChange={(e) => setEditData((prev) => ({ ...prev, firstName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={editData.lastName}
                            onChange={(e) => setEditData((prev) => ({ ...prev, lastName: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* ✅ Email field */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => {
                            setEditData((prev) => ({ ...prev, email: e.target.value }))
                            setEmailError("")
                          }}
                          placeholder="your.email@example.com"
                        />
                        {emailError && (
                          <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          value={editData.phoneNumber}
                          onChange={(e) => setEditData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={editData.address}
                          onChange={(e) => setEditData((prev) => ({ ...prev, address: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                        <Input
                          id="emergencyContact"
                          value={editData.emergencyContact}
                          onChange={(e) => setEditData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                          placeholder="Name and phone number"
                        />
                      </div>

                      <div className="pt-4 border-t border-border space-y-4">
                        <div>
                          <h4 className="font-medium">Change Password</h4>
                          <p className="text-sm text-muted-foreground">
                            Update your account password securely.
                          </p>
                        </div>

                        {passwordError && (
                          <Alert variant="destructive">
                            <AlertDescription>{passwordError}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                            }
                            autoComplete="current-password"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                              }
                              autoComplete="new-password"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                              }
                              autoComplete="new-password"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleChangePassword}
                          disabled={isChangingPassword}
                        >
                          {isChangingPassword ? "Updating Password..." : "Update Password"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                        <p className="text-foreground">{employee.employeeId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Department</p>
                        <p className="text-foreground">{employee.department}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Position</p>
                        <p className="text-foreground">{employee.position}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Role</p>
                        <p className="text-foreground">{employee.user.role}</p>
                      </div>
                      {/* ✅ Display email in view mode */}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-foreground">{employee.user.email}</p>
                      </div>
                      {employee.phoneNumber && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Phone</p>
                          <p className="text-foreground">{employee.phoneNumber}</p>
                        </div>
                      )}
                      {employee.address && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Address</p>
                          <p className="text-foreground">{employee.address}</p>
                        </div>
                      )}
                      {employee.emergencyContact && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                          <p className="text-foreground">{employee.emergencyContact}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Bank Information
                      </CardTitle>
                      <CardDescription>
                        {editing ? "Update your bank details" : "Your bank account details"}
                      </CardDescription>
                    </div>
                    {/* ✅ Display last updated timestamp */}
                    {bankDetailsLastUpdated && !editing && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg justify-end">
                        <Clock className="h-3 w-3" />
                        <div className="text-right">
                          <p className="font-medium">Last Updated</p>
                          <p>{bankDetailsLastUpdated.relative}</p>
                          <p className="text-xs">{bankDetailsLastUpdated.date} {bankDetailsLastUpdated.time}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountTitle">Account Title</Label>
                        <Input
                          id="bankAccountTitle"
                          value={editData.bankAccountTitle}
                          onChange={(e) => setEditData((prev) => ({ ...prev, bankAccountTitle: e.target.value }))}
                          placeholder="Full account title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountNumber">Account Number</Label>
                        <Input
                          id="bankAccountNumber"
                          value={editData.bankAccountNumber}
                          onChange={(e) => setEditData((prev) => ({ ...prev, bankAccountNumber: e.target.value }))}
                          placeholder="e.g., 1234567890"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankIban">IBAN</Label>
                        <Input
                          id="bankIban"
                          value={editData.bankIban}
                          onChange={(e) => setEditData((prev) => ({ ...prev, bankIban: e.target.value }))}
                          placeholder="e.g., PK36 SCBL 0000 0011 2345 6702"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {employee.bankAccountTitle || employee.bankAccountNumber || employee.bankIban ? (
                        <>
                          {employee.bankAccountTitle && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Account Title</p>
                              <p className="text-foreground">{employee.bankAccountTitle}</p>
                            </div>
                          )}
                          {employee.bankAccountNumber && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                              <p className="text-foreground font-mono">{employee.bankAccountNumber}</p>
                            </div>
                          )}
                          {employee.bankIban && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">IBAN</p>
                              <p className="text-foreground font-mono">{employee.bankIban}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <Alert>
                          <Building2 className="h-4 w-4" />
                          <AlertDescription>
                            No bank information added yet. Click Edit Profile to add your bank details.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Check-ins</CardTitle>
                  <CardDescription>Your latest attendance records</CardDescription>
                </CardHeader>
                <CardContent>
                  {!employee.checkIns || employee.checkIns.length === 0 ? (
                    <p className="text-muted-foreground">No check-in records found</p>
                  ) : (
                    <div className="space-y-3">
                      {employee.checkIns.slice(0, 10).map((checkIn) => (
                        <div
                          key={checkIn.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{new Date(checkIn.checkInTime).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">
                              In: {new Date(checkIn.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {checkIn.checkOutTime && (
                                <> • Out: {new Date(checkIn.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</>
                              )}
                            </p>
                          </div>
                          {checkIn.totalHours ? (
                            <Badge variant="outline">{checkIn.totalHours.toFixed(1)}h</Badge>
                          ) : (
                            <Badge className="bg-green-600 text-white">Active</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leave" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Leave Balance</CardTitle>
                    <CardDescription>Your current year balances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!employee.leaveBalances || employee.leaveBalances.length === 0 ? (
                      <p className="text-muted-foreground">No leave balances found</p>
                    ) : (
                      <div className="space-y-4">
                        {employee.leaveBalances.map((balance, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge className={getLeaveTypeColor(balance.leaveType)}>{balance.leaveType}</Badge>
                              <span className="text-sm font-medium text-black">
                                {balance.remainingDays}/{balance.totalDays} days
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-black h-2 rounded-full"
                                style={{
                                  width: `${Math.min((balance.usedDays / balance.totalDays) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Used: {balance.usedDays}</span>
                              <span>Remaining: {balance.remainingDays}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Leave Requests</CardTitle>
                    <CardDescription>Your latest leave requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!employee.leaveRequests || employee.leaveRequests.length === 0 ? (
                      <p className="text-muted-foreground">No leave requests found</p>
                    ) : (
                      <div className="space-y-3">
                        {employee.leaveRequests.slice(0, 5).map((request) => (
                          <div key={request.id} className="p-3 border border-border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <Badge className={getLeaveTypeColor(request.leaveType)}>{request.leaveType}</Badge>
                              <Badge
                                variant={
                                  request.status === "APPROVED"
                                    ? "default"
                                    : request.status === "REJECTED"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {new Date(request.startDate).toLocaleDateString()} -{" "}
                              {new Date(request.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">{request.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
