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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, DollarSign, Trash2, AlertTriangle, Shield, Save, X, Building2, Check } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ProfileSkeleton } from "@/components/ui/skeletons"
import { toast } from "sonner"

interface Employee {
  id: number
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
  bankAccountNumber?: string
  bankIban?: string
  bankAccountTitle?: string
  status: string
  user: {
    email: string
    role: string
  }
  leaveBalances: Array<{
    leaveType: string
    totalDays: number
    usedDays: number
    remainingDays: number
  }>
  checkIns: Array<{
    id: string
    checkInTime: string
    checkOutTime?: string
    totalHours?: number
  }>
  leaveRequests: Array<{
    id: string
    leaveType: string
    startDate: string
    endDate: string
    status: string
    reason: string
  }>
}

// ✅ Email validation function
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function EmployeeProfilePage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const params = useParams()
  const router = useRouter()
  const isAdmin = user?.role === "ADMIN"

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editingBankOnly, setEditingBankOnly] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusError, setStatusError] = useState("")

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

  useEffect(() => {
    fetchEmployee()
  }, [params.id])

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setEmployee(data)
        setNewStatus(data.status)
        setEditData({
          firstName: data.firstName,
          lastName: data.lastName,
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
      toast.error("Failed to load employee data")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!employee) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete employee")
      }

      toast.success("Employee deleted successfully", {
        description: `${employee.firstName} ${employee.lastName} has been removed from the system.`
      })

      router.push("/dashboard/employees")
    } catch (error) {
      console.error("Failed to delete employee:", error)
      toast.error("Failed to delete employee", {
        description: error instanceof Error ? error.message : "An error occurred while deleting the employee."
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  // ✅ Email validation on change
  const handleEmailChange = (value: string) => {
    setEditData((prev) => ({ ...prev, email: value }))
    setEmailError("")
  }

  const handleSave = async () => {
    setSaving(true)
    setEditError("")
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
        body: JSON.stringify({
          firstName: editData.firstName,
          lastName: editData.lastName,
          email: editData.email,
          phoneNumber: editData.phoneNumber,
          address: editData.address,
          emergencyContact: editData.emergencyContact,
        }),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        setEmployee(updatedEmployee)
        setEditData({
          firstName: updatedEmployee.firstName,
          lastName: updatedEmployee.lastName,
          email: updatedEmployee.user?.email || "",
          phoneNumber: updatedEmployee.phoneNumber || "",
          address: updatedEmployee.address || "",
          emergencyContact: updatedEmployee.emergencyContact || "",
          bankAccountNumber: updatedEmployee.bankAccountNumber || "",
          bankIban: updatedEmployee.bankIban || "",
          bankAccountTitle: updatedEmployee.bankAccountTitle || "",
        })
        setEditing(false)
        
        toast.success("Employee updated successfully! 🎉", {
          description: "Employee information has been saved.",
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to update employee")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setEditError(errorMessage)
      
      toast.error("Failed to update employee", {
        description: errorMessage,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleBankSave = async () => {
    setSaving(true)
    setEditError("")

    try {
      const bankData = {
        bankAccountNumber: editData.bankAccountNumber,
        bankIban: editData.bankIban,
        bankAccountTitle: editData.bankAccountTitle,
      }

      const response = await fetch(`/api/employees/${employee?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bankData),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        setEmployee(updatedEmployee)
        setEditingBankOnly(false)
        
        toast.success("Bank details updated successfully! 💳", {
          description: "Employee bank information has been saved.",
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to update bank details")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setEditError(errorMessage)
      
      toast.error("Failed to update bank details", {
        description: errorMessage,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (employee) {
      setEditData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.user?.email || "",
        phoneNumber: employee.phoneNumber || "",
        address: employee.address || "",
        emergencyContact: employee.emergencyContact || "",
        bankAccountNumber: employee.bankAccountNumber || "",
        bankIban: employee.bankIban || "",
        bankAccountTitle: employee.bankAccountTitle || "",
      })
    }
    setEditing(false)
    setEditingBankOnly(false)
    setEditError("")
    setEmailError("")
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
          description: `${employee.firstName}'s status changed to ${newStatus.replace(/_/g, " ")}`,
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to update status")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setStatusError(errorMessage)
      toast.error("Failed to update status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <ProfileSkeleton />
      </div>
    )
  }

  if (!employee) {
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
        <div className="text-center py-8">
          <p className="text-muted-foreground">Employee not found</p>
        </div>
      </div>
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
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

  const canEditPersonal = ["ADMIN", "HR"].includes(user?.role || "")
  const canEditBank = isAdmin

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/employees">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-muted-foreground">{employee.position}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEditPersonal && !editing && (
            <Button onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          )}
          {editing && (
            <>
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
            </>
          )}
          {user?.role === "ADMIN" && !editing && (
            <Button
              variant="destructive"
              onClick={handleDeleteClick}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Employee
            </Button>
          )}
        </div>
      </div>

      {editError && (
        <Alert variant="destructive">
          <AlertDescription>{editError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
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
                {employee.salary && ["ADMIN", "HR"].includes(user?.role || "") && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">${employee.salary.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Status Update Card */}
          {isAdmin && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Update Status
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
                      <SelectValue />
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

          {/* Admin Bank Details Edit Card */}
          {canEditBank && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4" />
                  Bank Information
                </CardTitle>
                <CardDescription>Admin: Edit bank details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.bankAccountTitle || employee.bankAccountNumber || employee.bankIban ? (
                  <>
                    {employee.bankAccountTitle && (
                      <div className="p-2 bg-white rounded border">
                        <p className="text-xs font-medium text-muted-foreground">Account Title</p>
                        <p className="text-sm text-foreground">{employee.bankAccountTitle}</p>
                      </div>
                    )}
                    {employee.bankAccountNumber && (
                      <div className="p-2 bg-white rounded border">
                        <p className="text-xs font-medium text-muted-foreground">Account Number</p>
                        <p className="text-sm text-foreground font-mono">{employee.bankAccountNumber}</p>
                      </div>
                    )}
                    {employee.bankIban && (
                      <div className="p-2 bg-white rounded border">
                        <p className="text-xs font-medium text-muted-foreground">IBAN</p>
                        <p className="text-sm text-foreground font-mono">{employee.bankIban}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No bank information on file</p>
                )}
                <Button
                  variant="outline"
                  onClick={() => setEditingBankOnly(true)}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Bank Details
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {canEditBank && <TabsTrigger value="bank">Bank Details</TabsTrigger>}
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="leave">Leave</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Details</CardTitle>
                  <CardDescription>
                    {editing ? "Edit employee information" : "Employee information"}
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

                      {/* ✅ Email field for admin edit */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          placeholder="employee@example.com"
                        />
                        {emailError && (
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {emailError}
                          </p>
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
                        <p className="text-sm font-medium text-muted-foreground">Role</p>
                        <p className="text-foreground">{employee.user.role}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      {/* ✅ Display email */}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-foreground break-all">{employee.user.email}</p>
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

            {/* Bank Details Tab - Admin Only */}
            {canEditBank && (
              <TabsContent value="bank" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Bank Information
                    </CardTitle>
                    <CardDescription>
                      {editingBankOnly ? "Edit bank details" : "Employee bank account details"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingBankOnly ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="bankAccountTitle">Account Title</Label>
                          <Input
                            id="bankAccountTitle"
                            value={editData.bankAccountTitle}
                            onChange={(e) => setEditData((prev) => ({ ...prev, bankAccountTitle: e.target.value }))}
                            placeholder="Full account title (2-100 characters)"
                          />
                          <p className="text-xs text-muted-foreground">Letters, numbers, spaces, and hyphens only</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bankAccountNumber">Account Number</Label>
                          <Input
                            id="bankAccountNumber"
                            value={editData.bankAccountNumber}
                            onChange={(e) => setEditData((prev) => ({ ...prev, bankAccountNumber: e.target.value }))}
                            placeholder="8-17 digits only"
                          />
                          <p className="text-xs text-muted-foreground">Must be 8-17 digits</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bankIban">IBAN</Label>
                          <Input
                            id="bankIban"
                            value={editData.bankIban}
                            onChange={(e) => setEditData((prev) => ({ ...prev, bankIban: e.target.value }))}
                            placeholder="e.g., PK36 SCBL 0000 0011 2345 6702"
                          />
                          <p className="text-xs text-muted-foreground">Valid IBAN format required (15-34 characters)</p>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleBankSave} disabled={saving} className="flex-1">
                            {saving ? (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Bank Details
                              </>
                            )}
                          </Button>
                          <Button variant="outline" onClick={handleCancel} disabled={saving}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        {employee.bankAccountTitle || employee.bankAccountNumber || employee.bankIban ? (
                          <>
                            {employee.bankAccountTitle && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-muted-foreground">Account Title</p>
                                <p className="text-foreground">{employee.bankAccountTitle}</p>
                              </div>
                            )}
                            {employee.bankAccountNumber && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                                <p className="text-foreground font-mono">{employee.bankAccountNumber}</p>
                              </div>
                            )}
                            {employee.bankIban && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-muted-foreground">IBAN</p>
                                <p className="text-foreground font-mono">{employee.bankIban}</p>
                              </div>
                            )}
                            <Button
                              variant="outline"
                              onClick={() => setEditingBankOnly(true)}
                              className="w-full"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Bank Details
                            </Button>
                          </>
                        ) : (
                          <>
                            <Alert>
                              <Building2 className="h-4 w-4" />
                              <AlertDescription>
                                No bank information on file for this employee.
                              </AlertDescription>
                            </Alert>
                            <Button
                              variant="outline"
                              onClick={() => setEditingBankOnly(true)}
                              className="w-full"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Add Bank Details
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Check-ins</CardTitle>
                  <CardDescription>Latest attendance records</CardDescription>
                </CardHeader>
                <CardContent>
                  {!employee.checkIns || employee.checkIns.length === 0 ? (
                    <p className="text-muted-foreground">No check-in records found</p>
                  ) : (
                    <div className="space-y-3">
                      {employee.checkIns.map((checkIn) => (
                        <div
                          key={checkIn.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{new Date(checkIn.checkInTime).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">
                              In: {new Date(checkIn.checkInTime).toLocaleTimeString()}
                              {checkIn.checkOutTime && (
                                <> • Out: {new Date(checkIn.checkOutTime).toLocaleTimeString()}</>
                              )}
                            </p>
                          </div>
                          {checkIn.totalHours && <Badge variant="outline">{checkIn.totalHours.toFixed(1)}h</Badge>}
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
                    <CardDescription>Current year balances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!employee.leaveBalances || employee.leaveBalances.length === 0 ? (
                      <p className="text-muted-foreground">No leave balances found</p>
                    ) : (
                      <div className="space-y-3">
                        {employee.leaveBalances.map((balance) => (
                          <div key={balance.leaveType} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{balance.leaveType}</span>
                            <span className="text-sm text-muted-foreground">
                              {balance.remainingDays}/{balance.totalDays} days
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Requests</CardTitle>
                    <CardDescription>Latest leave requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!employee.leaveRequests || employee.leaveRequests.length === 0 ? (
                      <p className="text-muted-foreground">No leave requests found</p>
                    ) : (
                      <div className="space-y-3">
                        {employee.leaveRequests.map((request) => (
                          <div key={request.id} className="p-3 border border-border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{request.leaveType}</span>
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
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.startDate).toLocaleDateString()} -{" "}
                              {new Date(request.endDate).toLocaleDateString()}
                            </p>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Employee
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {employee?.firstName} {employee?.lastName}
              </strong>
              ? This action cannot be undone and will permanently remove the employee and their associated user account.
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Warning:</strong> This will permanently delete the employee record and their user account. 
              They will no longer be able to log in to the system.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}