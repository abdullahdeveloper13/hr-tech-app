"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Users, Clock, Check, X, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface AbsentEmployee {
  id: number
  employeeId: string
  firstName: string
  lastName: string
  department: string
  phoneNumber?: string
  status: string
  user: {
    email: string
    role: string
  }
}

interface MarkedAbsentRecord {
  id: number
  employeeId: number
  date: string
  status: string
  reason?: string
  employee: {
    employeeId: string
    firstName: string
    lastName: string
    department: string
  }
}

export default function EmployeeAbsentPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const isAdmin = user?.role === "ADMIN"

  const [absentEmployees, setAbsentEmployees] = useState<AbsentEmployee[]>([])
  const [markedAbsentRecords, setMarkedAbsentRecords] = useState<MarkedAbsentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [markedSearchTerm, setMarkedSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [markedDepartmentFilter, setMarkedDepartmentFilter] = useState<string>("all")
  const [departments, setDepartments] = useState<string[]>([])
  const [markedDepartments, setMarkedDepartments] = useState<string[]>([])
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [checkedInCount, setCheckedInCount] = useState(0)
  const [markedAbsentCount, setMarkedAbsentCount] = useState(0)
  const [onLeaveCount, setOnLeaveCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )

  // Dialog states
  const [markAbsentDialogOpen, setMarkAbsentDialogOpen] = useState(false)
  const [selectedEmployeeToMark, setSelectedEmployeeToMark] = useState<AbsentEmployee | null>(null)
  const [absentReason, setAbsentReason] = useState("")
  const [markingAbsent, setMarkingAbsent] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      fetchAbsentEmployees()
      fetchMarkedAbsentRecords()
      const interval = setInterval(() => {
        fetchAbsentEmployees()
        fetchMarkedAbsentRecords()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAdmin, selectedDate])

  const fetchAbsentEmployees = async () => {
    try {
      const response = await fetch("/api/employees/absent/list")
      if (response.ok) {
        const data = await response.json()
        setAbsentEmployees(data.absent || [])
        setTotalEmployees(data.total || 0)
        setCheckedInCount(data.checkedIn || 0)
        setMarkedAbsentCount(data.markedAbsent || 0)  // ✅ Dynamically set from API
        setOnLeaveCount(data.onLeave || 0)
        setLastUpdated(new Date().toLocaleTimeString())

        // Extract unique departments - with safety check
        const uniqueDepts = [
          ...new Set(
            (data.absent || []).map((emp: AbsentEmployee) => emp.department).filter(Boolean)
          ),
        ] as string[]
        setDepartments(uniqueDepts.sort())
      } else {
        toast.error("Failed to fetch absent employees")
      }
    } catch (error) {
      console.error("Failed to fetch absent employees:", error)
      toast.error("Failed to load absent employees")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchMarkedAbsentRecords = async () => {
    try {
      const response = await fetch(`/api/employees/absent?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setMarkedAbsentRecords(data.marked || [])

        // Extract unique departments for marked absent employees
        const uniqueDepts = [
          ...new Set(
            (data.marked || []).map((record: MarkedAbsentRecord) => record.employee.department).filter(Boolean)
          ),
        ] as string[]
        setMarkedDepartments(uniqueDepts.sort())
      } else {
        console.error("Failed to fetch marked absent records")
      }
    } catch (error) {
      console.error("Failed to fetch marked absent records:", error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAbsentEmployees()
  }

  const handleMarkAbsent = async () => {
  if (!selectedEmployeeToMark) return

  setMarkingAbsent(true)
  try {
    const response = await fetch("/api/employees/absent/mark", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        employeeId: selectedEmployeeToMark.id, // ✅ Using id (number)
        reason: absentReason,
        date: selectedDate,
      }),
    })

    if (response.ok) {
      const result = await response.json()
      toast.success("Absent recorded successfully! 📝", {
        description: `${selectedEmployeeToMark.firstName} ${selectedEmployeeToMark.lastName} marked as absent`,
      })
      setMarkAbsentDialogOpen(false)
      setAbsentReason("")
      setSelectedEmployeeToMark(null)
      await fetchAbsentEmployees()
      await fetchMarkedAbsentRecords()
    } else {
      const data = await response.json()
      toast.error("Failed to mark absent", {
        description: data.error || "An error occurred",
      })
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "An error occurred"
    console.error("Mark absent error:", error)
    toast.error("Failed to mark absent", {
      description: errorMsg,
    })
  } finally {
    setMarkingAbsent(false)
  }
}

  const openMarkAbsentDialog = (employee: AbsentEmployee) => {
    setSelectedEmployeeToMark(employee)
    setAbsentReason("")
    setMarkAbsentDialogOpen(true)
  }

  // FIXED: Safe filtering with proper type checking and string conversion
  const filteredEmployees = absentEmployees.filter((emp) => {
    const searchLower = searchTerm.toLowerCase()
    
    const matchesSearch =
      String(emp.employeeId || "").toLowerCase().includes(searchLower) ||
      String(emp.firstName || "").toLowerCase().includes(searchLower) ||
      String(emp.lastName || "").toLowerCase().includes(searchLower) ||
      String(emp.phoneNumber || "").toLowerCase().includes(searchLower)

    const matchesDepartment =
      departmentFilter === "all" || emp.department === departmentFilter

    return matchesSearch && matchesDepartment
  })

  const filteredMarkedAbsent = markedAbsentRecords.filter((record) => {
    const searchLower = markedSearchTerm.toLowerCase()
    
    const matchesSearch =
      String(record.employee.employeeId || "").toLowerCase().includes(searchLower) ||
      String(record.employee.firstName || "").toLowerCase().includes(searchLower) ||
      String(record.employee.lastName || "").toLowerCase().includes(searchLower)

    const matchesDepartment =
      markedDepartmentFilter === "all" || record.employee.department === markedDepartmentFilter

    return matchesSearch && matchesDepartment
  })

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Only admins can view absent employees.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl mx-7 font-bold text-foreground">Employee Absent Status</h1>
          <p className="text-muted-foreground mx-7">Track and manage employee absences</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Button className="mx-7" onClick={handleRefresh} disabled={refreshing} size="lg">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 mx-7 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold">{totalEmployees}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active on system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold">{checkedInCount}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Present today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Marked Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-orange-600" />
              {/* ✅ Dynamic count from database */}
              <div className="text-2xl font-bold">{markedAbsentCount}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Recorded absent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div className="text-2xl font-bold">{onLeaveCount}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Approved leave</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mx-7">
        <CardHeader>
          <CardTitle>Absent Employees</CardTitle>
          <CardDescription>
            Employees who have not checked in yet • Last updated: {lastUpdated || "Never"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input
              placeholder="Search by ID, name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredEmployees.length === 0 ? (
            <Alert>
              <AlertDescription>
                {absentEmployees.length === 0
                  ? "All employees have checked in! ✅"
                  : "No employees match your search filters."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Employee ID</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-black">
                        {employee.employeeId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{employee.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.department}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.phoneNumber || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openMarkAbsentDialog(employee)}
                            className="text-orange-600 hover:bg-orange-50"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Mark Absent
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredEmployees.length > 0 && (
            <div className="text-sm text-muted-foreground text-center pt-4 border-t">
              Showing {filteredEmployees.length} of {absentEmployees.length} absent employees
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marked Absent Employees Table */}
      <Card className="mx-7">
        <CardHeader>
          <CardTitle>Marked Absent Records</CardTitle>
          <CardDescription>
            Employees who have been marked as absent on {selectedDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input
              placeholder="Search by ID or name..."
              value={markedSearchTerm}
              onChange={(e) => setMarkedSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={markedDepartmentFilter} onValueChange={setMarkedDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {markedDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredMarkedAbsent.length === 0 ? (
            <Alert>
              <AlertDescription>
                {markedAbsentRecords.length === 0
                  ? "No employees marked as absent on this date."
                  : "No marked absent records match your search filters."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Employee ID</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="font-semibold">Date Marked</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMarkedAbsent.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-black">
                        {record.employee.employeeId}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {record.employee.firstName} {record.employee.lastName}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.employee.department}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {record.reason || "No reason provided"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredMarkedAbsent.length > 0 && (
            <div className="text-sm text-muted-foreground text-center pt-4 border-t">
              Showing {filteredMarkedAbsent.length} of {markedAbsentRecords.length} marked absent records
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mark Absent Dialog */}
      <Dialog open={markAbsentDialogOpen} onOpenChange={setMarkAbsentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Employee as Absent</DialogTitle>
            <DialogDescription>
              {selectedEmployeeToMark
                ? `${selectedEmployeeToMark.firstName} ${selectedEmployeeToMark.lastName}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for absence..."
                value={absentReason}
                onChange={(e) => setAbsentReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMarkAbsentDialogOpen(false)}
              disabled={markingAbsent}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkAbsent}
              disabled={markingAbsent}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {markingAbsent ? "Marking..." : "Mark Absent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}