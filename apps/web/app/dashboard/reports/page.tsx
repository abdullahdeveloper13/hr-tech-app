"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { AreaChart, Area, } from "recharts"
import { AreaChartDemo } from "@/components/ui/area-chart";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"


import { Users, Clock, Calendar, TrendingUp, Download, FileText, Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReportsPageSkeleton } from "@/components/ui/skeletons"

interface AnalyticsData {
  period: { start: string; end: string }
  employees: {
    total: number
    byDepartment: Array<{ department: string; count: number }>
    byStatus: Array<{ status: string; count: number }>
  }
  attendance: {
    totalCheckIns: number
    avgWorkingHours: number
    daily: Array<{ date: string; count: number }>
    byDepartment: Array<{
      department: string
      presentEmployees: number
      totalEmployees: number
      attendanceRate: number
    }>
    byEmployee: Array<{
      employeeId: string
      firstName: string
      lastName: string
      department: string
      position: string
      totalCheckIns: number
      totalHours: number
      daysPresent: number
      lastCheckIn: string
      avgHoursPerDay: number
    }>
    records: Array<{
      id: number
      employeeId: string
      employeeName: string
      department: string
      position: string
      checkInTime: string
      checkOutTime: string | null
      totalHours: number
    }>
  }
  leave: {
    byStatus: Array<{ status: string; count: number }>
    byType: Array<{ type: string; count: number; totalDays: number }>
  }
  recentActivities: Array<{
    type: string
    employee_name: string
    department: string
    timestamp: string
    activity: string
  }>
}

const COLORS = ["#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080", "#999999"]

export default function ReportsPage() {
  const { data: session } = useSession()
  const user = session?.user
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [allEmployees, setAllEmployees] = useState<Array<{
    id: string
    employeeId: string
    firstName: string
    lastName: string
    department: string
    position: string
  }>>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("")
  const chartData = analytics?.attendance.daily || [
  { date: "Apr 3", Mobile: 400, Desktop: 2400 },
  { date: "Apr 7", Mobile: 300, Desktop: 1398 },
  { date: "Apr 12", Mobile: 200, Desktop: 9800 },
  { date: "Apr 17", Mobile: 278, Desktop: 3908 },
  { date: "Apr 22", Mobile: 189, Desktop: 4800 },
  // ... add more data points
]
  const [activitySearchTerm, setActivitySearchTerm] = useState("all")
  const [activityDateFilter, setActivityDateFilter] = useState("today")
  const [attendanceFromDate, setAttendanceFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  )
  const [attendanceToDate, setAttendanceToDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [attendanceNameSearch, setAttendanceNameSearch] = useState("")
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })

  // Helper function to get date range based on filter
  const getDateRangeForFilter = (filter: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (filter) {
      case 'today':
        return {
          start: today,
          end: now
        }
      case 'this-week':
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        return {
          start: startOfWeek,
          end: now
        }
      case 'this-month':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: now
        }
      case 'last-3-months':
        const threeMonthsAgo = new Date(now)
        threeMonthsAgo.setMonth(now.getMonth() - 3)
        return {
          start: threeMonthsAgo,
          end: now
        }
      case 'year-to-date':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: now
        }
      default:
        return {
          start: today,
          end: now
        }
    }
  }

  useEffect(() => {
    if (!["ADMIN", "HR"].includes(user?.role || "")) {
      return
    }
    fetchAnalytics()
    fetchAllEmployees()
  }, [dateRange, user])
const mockData = [
  { date: "Apr 3", Mobile: 400, Desktop: 2400 },
  { date: "Apr 7", Mobile: 300, Desktop: 1398 },
  { date: "Apr 12", Mobile: 200, Desktop: 9800 },
  { date: "Apr 17", Mobile: 278, Desktop: 3908 },
  { date: "Apr 22", Mobile: 189, Desktop: 4800 },
  { date: "Apr 27", Mobile: 239, Desktop: 1800 },
  { date: "May 2", Mobile: 349, Desktop: 2300 },
  { date: "May 7", Mobile: 200, Desktop: 2200 },
  { date: "May 12", Mobile: 349, Desktop: 2100 },
  { date: "May 17", Mobile: 200, Desktop: 2290 },
  { date: "May 22", Mobile: 220, Desktop: 2000 },
  { date: "May 27", Mobile: 250, Desktop: 2181 },
  { date: "Jun 1", Mobile: 210, Desktop: 2500 },
  { date: "Jun 5", Mobile: 229, Desktop: 2100 },
  { date: "Jun 10", Mobile: 200, Desktop: 2100 },
  { date: "Jun 15", Mobile: 250, Desktop: 2100 },
  { date: "Jun 20", Mobile: 210, Desktop: 2100 },
  { date: "Jun 25", Mobile: 229, Desktop: 2100 },
  { date: "Jun 30", Mobile: 200, Desktop: 2100 },
];
const data = chartData?.length ? chartData : mockData;
  const fetchAllEmployees = async () => {
    try {
      const response = await fetch('/api/employees?limit=100')
      if (response.ok) {
        const data = await response.json()
        setAllEmployees(data.employees)
      } else {
        console.error("Failed to fetch employees:", response.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Always fetch data for a broader range to ensure we have today's data
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      
      const params = new URLSearchParams({
        startDate: startOfMonth.toISOString().split("T")[0],
        endDate: endOfMonth.toISOString().split("T")[0],
      })

      const response = await fetch(`/api/reports/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        console.error("Failed to fetch analytics:", response.statusText)
        // Handle error state - you could add an error state here
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      // Handle error state - you could add an error state here
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (reportType: string, format: string) => {
    setExporting(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        format,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })

      const response = await fetch(`/api/reports/export?${params}`)
      if (response.ok) {
        if (format === "csv") {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          const data = await response.json()
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.json`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setExporting(false)
    }
  }

  if (!["ADMIN", "HR"].includes(user?.role || "")) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Access denied</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">You don't have permission to view reports and analytics.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ReportsPageSkeleton />
      </div>
    )
  }
  

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive HR insights and reports</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="startDate">From:</Label>
            <Input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="endDate">To:</Label>
            <Input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{analytics?.employees.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-1/10">
                <Clock className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Check-ins</p>
                <p className="text-2xl font-bold text-foreground">{analytics?.attendance.totalCheckIns || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Working Hours</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.attendance.avgWorkingHours.toFixed(1) || 0}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Calendar className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leave Requests</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.leave.byStatus.reduce((sum, item) => sum + item.count, 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
  <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Area Chart - Interactive</CardTitle>
            <CardDescription>
              Showing total visitors for the last 3 months
            </CardDescription>
          </div>
          <select className="text-sm border border-border rounded px-3 py-1.5 bg-background text-foreground cursor-pointer">
            <option>Last 3 months</option>
            <option>Last 6 months</option>
            <option>This year</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="pt-0 -mx-6 -mb-6">
        <div className="w-full h-[500px] px-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mockData}
              margin={{ top: 10, right: 30, left: 60, bottom: 40 }}
            >
              <defs>
                <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />

              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#9ca3af" }}
              />

              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#9ca3af" }}
                width={50}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  padding: "12px 16px",
                }}
                formatter={(value) => [value, ""]}
                labelStyle={{ color: "#000" }}
                cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
              />

              <Area
                type="natural"
                dataKey="Desktop"
                stroke="#93c5fd"
                strokeWidth={2}
                fill="url(#colorDesktop)"
                fillOpacity={1}
                isAnimationActive={false}
              />

              <Area
                type="natural"
                dataKey="Mobile"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorMobile)"
                fillOpacity={1}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-8 mt-8 px-6 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium">Mobile</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-300"></div>
            <span className="text-sm font-medium">Desktop</span>
          </div>
        </div>
      </CardContent>
    </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Employees by Department */}
            {/* <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Employees by Department</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {!analytics?.employees.byDepartment || analytics.employees.byDepartment.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No department data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.employees.byDepartment}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ department, count }) => `${department}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.employees.byDepartment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value}`, name]}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card> */}
            
            
            
            {/* Department Attendance Rates */}
            {/* <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Department Attendance Rates</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {!analytics?.attendance.byDepartment || analytics.attendance.byDepartment.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No attendance data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.attendance.byDepartment}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Attendance Rate']}
                        labelStyle={{ color: '#000' }}
                      />
                      <Bar dataKey="attendanceRate" fill="#000000" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card> */}
          </div>

          {/* Recent Activities */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <CardDescription>Latest employee activities in the system</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {!analytics?.recentActivities || analytics.recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activities found for the selected period</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Employee</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Department</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Activity</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentActivities.slice(0, 10).map((activity, index) => (
                        <tr 
                          key={index} 
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-foreground">
                              {activity.employee_name}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {activity.department}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">
                            {activity.activity}
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant="outline"
                              className={
                                activity.type === 'check_in' 
                                  ? "border-green-200 text-green-700 bg-green-50"
                                  : "border-orange-200 text-orange-700 bg-orange-50"
                              }
                            >
                              {activity.type === 'check_in' ? 'Check-in' : 'Leave Request'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-8">
          {/* Employee Attendance Summary Table */}
    {/* <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Employee Attendance Summary</CardTitle>
                  <CardDescription>Detailed attendance records for each employee</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="employeeSearch" className="text-sm">Filter:</Label>
                  <Input
                    id="employeeSearch"
                    placeholder="Search by name..."
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {!analytics?.attendance.byEmployee || analytics.attendance.byEmployee.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No employee attendance data available for the selected period</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Employee ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Department</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Position</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">Days Present</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">Total Hours</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">Avg Hours/Day</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Last Check-in</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.attendance.byEmployee
                        .filter((emp) => {
                          const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
                          return fullName.includes(employeeSearchTerm.toLowerCase()) ||
                                 emp.employeeId.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                                 emp.department.toLowerCase().includes(employeeSearchTerm.toLowerCase())
                        })
                        .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
                        .map((emp, index) => (
                          <tr 
                            key={emp.employeeId} 
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm">
                              <Badge variant="outline">{emp.employeeId}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-foreground">
                                {emp.firstName} {emp.lastName}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {emp.department}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {emp.position}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge className="bg-primary text-primary-foreground">
                                {emp.daysPresent}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center font-medium text-foreground">
                              {emp.totalHours}h
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge 
                                className={
                                  emp.avgHoursPerDay >= 8 
                                    ? "bg-chart-1 text-white" 
                                    : emp.avgHoursPerDay >= 6
                                      ? "bg-chart-2 text-white"
                                      : "bg-destructive text-destructive-foreground"
                                }
                              >
                                {emp.avgHoursPerDay}h
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {new Date(emp.lastCheckIn).toLocaleDateString()} {new Date(emp.lastCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {analytics.attendance.byEmployee.filter((emp) => {
                    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
                    return fullName.includes(employeeSearchTerm.toLowerCase()) ||
                           emp.employeeId.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                           emp.department.toLowerCase().includes(employeeSearchTerm.toLowerCase())
                  }).length === 0 && employeeSearchTerm && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No employees found matching "{employeeSearchTerm}"</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card> */}
          {/* Recent Attendance Records Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Attendance Records</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                    Detailed check-in records with hours worked
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto sm:justify-end">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      From
                    </span>
                    <Input
                      type="date"
                      value={attendanceFromDate}
                      onChange={(e) => setAttendanceFromDate(e.target.value)}
                      className="w-28 sm:w-32 h-9 text-xs"
                    />
                    <span className="font-medium text-muted-foreground">To</span>
                    <Input
                      type="date"
                      value={attendanceToDate}
                      onChange={(e) => setAttendanceToDate(e.target.value)}
                      className="w-28 sm:w-32 h-9 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-60">
                    <Input
                      type="text"
                      placeholder="Search by employee name"
                      value={attendanceNameSearch}
                      onChange={(e) => setAttendanceNameSearch(e.target.value)}
                      className="h-9 pl-8 text-sm"
                    />
                    <Search className="h-4 w-4 -ml-9 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {!analytics?.attendance.records || analytics.attendance.records.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No attendance records found for the selected period</p>
                </div>
              ) : (() => {
                const allRecords = analytics.attendance.records

                let filteredRecords = allRecords

                // Apply date range filter (based on check-in time)
                if (attendanceFromDate || attendanceToDate) {
                  const from = attendanceFromDate
                    ? new Date(attendanceFromDate + "T00:00:00")
                    : null
                  const to = attendanceToDate
                    ? new Date(attendanceToDate + "T23:59:59")
                    : null

                  filteredRecords = filteredRecords.filter((record) => {
                    const recordDate = new Date(record.checkInTime)
                    if (from && recordDate < from) return false
                    if (to && recordDate > to) return false
                    return true
                  })
                }

                // Apply name search filter
                if (attendanceNameSearch.trim()) {
                  const search = attendanceNameSearch.trim().toLowerCase()
                  filteredRecords = filteredRecords.filter((record) =>
                    record.employeeName.toLowerCase().includes(search)
                  )
                }

                // Sort by newest first
                filteredRecords = filteredRecords.sort(
                  (a, b) =>
                    new Date(b.checkInTime).getTime() -
                    new Date(a.checkInTime).getTime()
                )

                return (
                  <>
                    {filteredRecords.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No records found for {activityDateFilter.replace('-', ' ')} 
                          {activitySearchTerm !== 'all' && ` for ${activitySearchTerm}`}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-3 px-4 font-semibold text-foreground">Employee ID</th>
                              <th className="text-left py-3 px-4 font-semibold text-foreground">Employee</th>
                              <th className="text-left py-3 px-4 font-semibold text-foreground">Check in</th>
                              <th className="text-left py-3 px-4 font-semibold text-foreground">Checkout</th>
                              <th className="text-center py-3 px-4 font-semibold text-foreground">Total time</th>
                              <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRecords.map((record, index) => (
                              <tr
                                key={index}
                                className="border-b border-border hover:bg-muted/50 transition-colors"
                              >
                                <td className="py-3 px-4 align-middle">
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {record.employeeId}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-medium text-foreground">
                                    {record.employeeName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {record.department} • {record.position}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {new Date(record.checkInTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {record.checkOutTime
                                    ? new Date(record.checkOutTime).toLocaleTimeString(
                                        [],
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )
                                    : "--"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Badge className="bg-blue-600 text-white">
                                    {record.totalHours.toFixed(2)}h
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {new Date(record.checkInTime).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Leave Requests by Status */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Leave Requests by Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {!analytics?.leave.byStatus || analytics.leave.byStatus.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No leave request data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.leave.byStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count }) => `${status}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.leave.byStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value}`, name]}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Leave by Type */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Leave Days by Type</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {!analytics?.leave.byType || analytics.leave.byType.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No leave type data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.leave.byType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value}`, 'Total Days']}
                        labelStyle={{ color: '#000' }}
                      />
                      <Bar dataKey="totalDays" fill="#333333" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee Report
                </CardTitle>
                <CardDescription>Export complete employee database</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <Button
                  onClick={() => handleExport("employees", "csv")}
                  disabled={exporting}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button
                  onClick={() => handleExport("employees", "json")}
                  disabled={exporting}
                  className="w-full"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Attendance Report
                </CardTitle>
                <CardDescription>Export attendance records for selected period</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <Button
                  onClick={() => handleExport("attendance", "csv")}
                  disabled={exporting}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button
                  onClick={() => handleExport("attendance", "json")}
                  disabled={exporting}
                  className="w-full"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Leave Report
                </CardTitle>
                <CardDescription>Export leave requests and balances</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <Button
                  onClick={() => handleExport("leave", "csv")}
                  disabled={exporting}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button
                  onClick={() => handleExport("leave", "json")}
                  disabled={exporting}
                  className="w-full"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
              </CardContent>
            </Card>
          </div>

          {exporting && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-muted-foreground mt-4">Generating report...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
