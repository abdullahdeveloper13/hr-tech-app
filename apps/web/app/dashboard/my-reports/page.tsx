"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, Loader2, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type AttendanceRecord = {
  id: number
  employeeId: string
  firstName: string
  lastName: string
  checkInTime: string
  checkOutTime: string | null
  totalHours: number
  date: string
}

type TimeRange = "week" | "month" | "year"

export default function MyReportsPage() {
  const { data: session, status } = useSession()
  const user = session?.user as any

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>("week")

  const fetchAttendanceData = async (range: TimeRange) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/attendance/reports?range=${range}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      })

      if (!response.ok) {
        toast.error(`Failed to load attendance data (${response.status})`)
        setAttendanceData([])
        return
      }

      const data = (await response.json()) as AttendanceRecord[]
      setAttendanceData(data)
    } catch (err) {
      console.error("fetchAttendanceData error:", err)
      toast.error("Failed to load attendance data")
      setAttendanceData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchAttendanceData(timeRange)
    } else if (status === "unauthenticated") {
      setLoading(false)
      setAttendanceData([])
    }
  }, [status, timeRange])

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
  }

  const calculateTotalHours = (records: AttendanceRecord[]): string => {
    const total = records.reduce((sum, record) => sum + (record.totalHours || 0), 0)
    return total.toFixed(2)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleExport = () => {
    const headers = ["Employee ID", "Date", "Check-In", "Check-Out", "Total Hours"]
    const csv = [
      headers.join(","),
      ...attendanceData.map((record) =>
        [
          record.employeeId,
          formatDate(record.date),
          formatTime(record.checkInTime),
          record.checkOutTime ? formatTime(record.checkOutTime) : "—",
          record.totalHours.toFixed(2),
        ]
          .map((v) => `"${v ?? ""}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-${timeRange}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex h-full items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading attendance data...
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center py-16 text-muted-foreground">
        Sign in to view your attendance reports.
      </div>
    )
  }

  const totalHoursWorked = calculateTotalHours(attendanceData)
  const totalDays = new Set(attendanceData.map((r) => r.date)).size

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Attendance Reports</h1>
          <p className="text-sm text-muted-foreground">
            View your check-in and check-out records
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={timeRange} onValueChange={(value) => handleTimeRangeChange(value as TimeRange)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hours Worked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursWorked}</div>
            <p className="text-xs text-muted-foreground mt-1">hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDays}</div>
            <p className="text-xs text-muted-foreground mt-1">days worked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Daily Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDays > 0 ? (parseFloat(totalHoursWorked) / totalDays).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">hours per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Details
          </CardTitle>
          <CardDescription>
            {timeRange === "week" && "This week's attendance records"}
            {timeRange === "month" && "This month's attendance records"}
            {timeRange === "year" && "This year's attendance records"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Employee ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Check-In</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Check-Out</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p>No attendance records found for this period</p>
                    </td>
                  </tr>
                ) : (
                  attendanceData.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.employeeId}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(record.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatTime(record.checkInTime)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {record.checkOutTime ? formatTime(record.checkOutTime) : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="secondary">
                          {record.totalHours.toFixed(2)}h
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}