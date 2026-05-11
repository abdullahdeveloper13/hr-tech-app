"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Search, UserPlus, Mail, Calendar, Building, Trash2, AlertTriangle, X } from "lucide-react"
import Link from "next/link"
import { EmployeeCardSkeleton } from "@/components/ui/skeletons"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  position: string
  department: string
  status: string
  hireDate: string
  user?: {
    email: string
  }
}

export default function EmployeesPage() {
  const { data: session } = useSession()
  const user = session?.user
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [employmentStatusFilter, setEmploymentStatusFilter] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.employees || [])
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/employees/${employeeToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete employee")
      }

      setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id))
      
      toast.success("Employee deleted successfully", {
        description: `${employeeToDelete.firstName} ${employeeToDelete.lastName} has been removed from the system.`
      })

      setDeleteDialogOpen(false)
      setEmployeeToDelete(null)
    } catch (error) {
      console.error("Failed to delete employee:", error)
      toast.error("Failed to delete employee", {
        description: error instanceof Error ? error.message : "An error occurred while deleting the employee."
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setEmployeeToDelete(null)
  }

  const handleClearDateFilter = () => {
    setFromDate("")
    setToDate("")
  }

  const hasActiveFilters = searchTerm || departmentFilter !== "all" || employmentStatusFilter !== "all" || fromDate || toDate

  const filteredEmployees = employees.filter((employee) => {
    // Search filter
    const matchesSearch =
      (employee.firstName + " " + employee.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Department filter
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
    
    // Employment Status filter
    const matchesEmploymentStatus = employmentStatusFilter === "all" || employee.status === employmentStatusFilter
    
    // Date range filter
    const employeeHireDate = new Date(employee.hireDate)
    let matchesDateRange = true

    if (fromDate) {
      const fromDateObj = new Date(fromDate)
      fromDateObj.setHours(0, 0, 0, 0)
      matchesDateRange = matchesDateRange && employeeHireDate >= fromDateObj
    }

    if (toDate) {
      const toDateObj = new Date(toDate)
      toDateObj.setHours(23, 59, 59, 999)
      matchesDateRange = matchesDateRange && employeeHireDate <= toDateObj
    }

    return matchesSearch && matchesDepartment && matchesEmploymentStatus && matchesDateRange
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Employees</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage your team members and their information</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/employees/new">
            <Button size="sm" className="w-full sm:w-auto">
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Employee</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* First Row - Search and Department */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search employees by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {Array.from(new Set(employees.map(emp => emp.department))).map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Second Row - Employment Status and Hire Date From */}
            <div className="flex items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={employmentStatusFilter} onValueChange={setEmploymentStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Employment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="ACTIVE">Currently Employed</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-center">
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                  From
                </label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Third Row - Hire Date To and Clear Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                  To
                </label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full"
                />
              </div>
              {(fromDate || toDate) && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearDateFilter}
                    className="w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Dates
                  </Button>
                </div>
              )}
            </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 items-center text-sm pt-2 border-t">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-gray-700">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {departmentFilter !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Department: {departmentFilter}
                    <button onClick={() => setDepartmentFilter("all")} className="ml-1 hover:text-gray-700">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {employmentStatusFilter !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {employmentStatusFilter === "ACTIVE" ? "Currently Employed" : employmentStatusFilter}
                    <button onClick={() => setEmploymentStatusFilter("all")} className="ml-1 hover:text-gray-700">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {fromDate && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    From: {new Date(fromDate).toLocaleDateString()}
                    <button onClick={() => setFromDate("")} className="ml-1 hover:text-gray-700">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {toDate && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    To: {new Date(toDate).toLocaleDateString()}
                    <button onClick={() => setToDate("")} className="ml-1 hover:text-gray-700">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> employees
      </div>

      {/* Employee Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <EmployeeCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {employee.firstName?.[0]}{employee.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{employee.firstName} {employee.lastName}</CardTitle>
                    <CardDescription>{employee.position}</CardDescription>
                  </div>
                  <Badge 
                    variant={employee.status === "ACTIVE" ? "default" : "secondary"}
                    className={employee.status === "ACTIVE" ? "bg-green-600" : ""}
                  >
                    {employee.status === "ACTIVE" ? "Active" : employee.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {employee.user?.email || "No email"}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  {employee.department}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(employee.hireDate).toLocaleDateString()}
                </div>
                <div className="pt-2 flex gap-2">
                  <Link href={`/dashboard/employees/${employee.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      View Profile
                    </Button>
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(employee)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No employees found matching your criteria.</p>
          </CardContent>
        </Card>
      )}

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
                {employeeToDelete?.firstName} {employeeToDelete?.lastName}
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