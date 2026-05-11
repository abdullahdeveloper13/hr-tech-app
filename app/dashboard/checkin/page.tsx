"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Clock, MapPin, Calendar, Users, TrendingUp, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { CheckInPageSkeleton } from "@/components/ui/skeletons"
import { toast } from "sonner"

// Digital Clock Component
function DigitalClock() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="text-center space-y-2">
      <div className="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100">
        {formatTime(currentTime)}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {formatDate(currentTime)}
      </div>
    </div>
  )
}

interface CheckInRecord {
  id: string
  checkInTime: string
  checkOutTime?: string
  totalHours?: number
}

interface CheckInStatus {
  activeCheckIn: CheckInRecord | null
  recentCheckIns: CheckInRecord[]
  isCheckedIn: boolean
  hasCompletedWorkDay: boolean
  hasCheckedInToday: boolean
  todayCheckIn: CheckInRecord | null
  hasEmployeeProfile?: boolean
  message?: string | null
}

interface AllCheckInsData {
  checkIns: Array<{
    id: string
    checkInTime: string
    checkOutTime?: string
    totalHours?: number
    employee: {
      id: string
      employeeId: string
      firstName: string
      lastName: string
      department: string
      position: string
    }
  }>
  stats: {
    totalEmployees: number
    presentToday: number
    currentlyCheckedIn: number
    attendanceRate: number
  }
}

function readApiErrorMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
    return payload.error
  }
  return "Unknown error"
}

export default function CheckInPage() {
  const { data: session, status: sessionStatus } = useSession()
  const user = session?.user
  const hasFetchedStatusRef = useRef(false)
  const hasFetchedAllCheckInsRef = useRef(false)
  const [status, setStatus] = useState<CheckInStatus>({
    activeCheckIn: null,
    recentCheckIns: [],
    isCheckedIn: false,
    hasCompletedWorkDay: false,
    hasCheckedInToday: false,
    todayCheckIn: null,
    hasEmployeeProfile: true,
    message: null,
  })
  const [allCheckIns, setAllCheckIns] = useState<AllCheckInsData>({
    checkIns: [],
    stats: {
      totalEmployees: 0,
      presentToday: 0,
      currentlyCheckedIn: 0,
      attendanceRate: 0,
    },
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)

  const canViewAll = ["ADMIN", "HR", "MANAGER"].includes(user?.role || "")

  useEffect(() => {
    if (sessionStatus === "loading") {
      return
    }

    if (!session) {
      setLoading(false)
      setError("Please log in again to continue")
      return
    }

    if (!hasFetchedStatusRef.current) {
      hasFetchedStatusRef.current = true
      void fetchCheckInStatus(false)
    }

    if (canViewAll && !hasFetchedAllCheckInsRef.current) {
      hasFetchedAllCheckInsRef.current = true
      void fetchAllCheckIns(false)
    }
  }, [canViewAll, session, sessionStatus])

  const fetchCheckInStatus = async (showToast: boolean = true) => {
    try {
      const response = await fetch("/api/checkin")
      if (response.ok) {
        const data = await response.json()
        setStatus(data)

        if (data?.hasEmployeeProfile === false) {
          const profileMessage =
            typeof data?.message === "string" && data.message.trim()
              ? data.message
              : "Employee profile not found. Please contact HR."
          setError(profileMessage)
          if (showToast) {
            toast("Profile setup required", {
              description: profileMessage,
            })
          }
        } else {
          setError("")
        }
      } else {
        const errorData = await response.json().catch(() => null)
        const errorMessage = readApiErrorMessage(errorData)
        if (response.status >= 500) {
          console.error("Failed to fetch check-in status:", errorMessage)
        }
        
        if (response.status === 401) {
          setError("Please log in again to continue")
          if (showToast) {
            toast("Authentication required", {
              description: "Please log in again to continue",
            })
          }
        } else {
          setError(errorMessage || "Failed to fetch check-in status")
          if (showToast) {
            toast("Error", {
              description: errorMessage || "Failed to fetch check-in status",
            })
          }
        }
      }
    } catch (error) {
      console.error("Error fetching check-in status:", error)
      setError("Network error. Please check your connection and try again.")
      if (showToast) {
        toast("Network Error", {
          description: "Please check your connection and try again.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAllCheckIns = async (showToast: boolean = true) => {
    try {
      const response = await fetch("/api/checkin/all")
      if (response.ok) {
        const data = await response.json()
        setAllCheckIns(data)
      } else {
        const errorData = await response.json().catch(() => null)
        const errorMessage = readApiErrorMessage(errorData)
        if (response.status >= 500) {
          console.error("Failed to fetch all check-ins:", errorMessage)
        }
        
        if (response.status === 401) {
          if (showToast) {
            toast("Authentication required", {
              description: "Please log in again to continue",
            })
          }
        } else if (response.status === 403) {
          if (showToast) {
            toast("Access denied", {
              description: "You don't have permission to view all check-ins",
            })
          }
        } else {
          if (showToast) {
            toast("Error", {
              description: errorMessage || "Failed to fetch all check-ins",
            })
          }
        }
      }
    } catch (error) {
      console.error("Error fetching all check-ins:", error)
      if (showToast) {
        toast("Network Error", {
          description: "Please check your connection and try again.",
        })
      }
    }
  }

  const handleCheckInOut = async (action: "checkin" | "checkout") => {
    if (status.hasEmployeeProfile === false) {
      const message =
        status.message ||
        "Employee profile not found. Please contact HR to set up your employee record."
      setError(message)
      toast("Profile setup required", {
        description: message,
      })
      return
    }

    setActionLoading(true)
    setError("")

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          notes: "",
          location: "",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = readApiErrorMessage(errorData) || "Failed to process check-in/out"

        if (response.status === 409) {
          setStatus((prev) => ({
            ...prev,
            hasEmployeeProfile: false,
            message: errorMessage,
          }))
        }

        throw new Error(errorMessage)
      }

              // Show success toast
        if (action === "checkin") {
          toast("Successfully checked in! 🎉", {
            description: "Your work session has started. Have a productive day!",
          })
        } else {
          toast("Successfully checked out! 👋", {
            description: "Your work session has ended. Thanks for your hard work!",
          })
        }

      // Refresh data after successful action (without showing toasts)
      await fetchCheckInStatus(false)
      if (canViewAll) {
        await fetchAllCheckIns(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
              toast("Check-in/out failed", {
          description: errorMessage,
        })
    } finally {
      setActionLoading(false)
      setShowCheckoutDialog(false)
    }
  }

  const handleCheckoutClick = () => {
    setShowCheckoutDialog(true)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getCurrentWorkingTime = (checkInTime: string) => {
    const now = new Date()
    const checkIn = new Date(checkInTime)
    const diffMs = now.getTime() - checkIn.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const calculateDuration = (checkInTime: string, checkOutTime: string) => {
    const checkIn = new Date(checkInTime)
    const checkOut = new Date(checkOutTime)
    const diffMs = checkOut.getTime() - checkIn.getTime()
    const hours = diffMs / (1000 * 60 * 60)
    return `${hours.toFixed(2)}h`
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <CheckInPageSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-4 lg:space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Check-in/Check-out</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Track your work hours</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void fetchCheckInStatus()
              if (canViewAll) {
                void fetchAllCheckIns()
              }
            }}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="checkin" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checkin">My Check-in</TabsTrigger>
          {canViewAll && <TabsTrigger value="attendance">Team Attendance</TabsTrigger>}
        </TabsList>

        <TabsContent value="checkin" className="space-y-6">

          {/* Digital Clock Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Current Time
              </CardTitle>
              <CardDescription>Real-time clock</CardDescription>
            </CardHeader>
            <CardContent>
              <DigitalClock />
            </CardContent>
          </Card>


          {/* Check-in/out Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {status?.hasCompletedWorkDay 
                  ? "Work Day Complete" 
                  : status?.isCheckedIn 
                    ? "Check Out" 
                    : "Check In"
                }
              </CardTitle>
              <CardDescription>
                {status?.hasCompletedWorkDay 
                  ? "You have completed your check-in/check-out for today" 
                  : status?.isCheckedIn 
                    ? "End your work session" 
                    : "Start your work session"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <Alert variant={status.hasEmployeeProfile === false ? "default" : "destructive"}>
                    <AlertDescription className="flex items-center justify-between">
                      <span>{error}</span>
                      {status.hasEmployeeProfile !== false && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setError("")
                            void fetchCheckInStatus()
                            if (canViewAll) {
                              void fetchAllCheckIns()
                            }
                          }}
                          className="ml-2"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {status?.hasCompletedWorkDay ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Work Day Complete!</p>
                    <p className="text-gray-600">
                      You have successfully completed your check-in and check-out for today.
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      if (status?.isCheckedIn) {
                        handleCheckoutClick()
                      } else {
                        handleCheckInOut("checkin")
                      }
                    }}
                    disabled={actionLoading || status.hasEmployeeProfile === false}
                    className="w-full"
                    size="lg"
                  >
                    {actionLoading
                      ? "Processing..."
                      : status.hasEmployeeProfile === false
                        ? "Profile setup required"
                        : status?.isCheckedIn
                          ? "Check Out"
                          : "Check In"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Check-out Confirmation Dialog */}
          <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Check-out</DialogTitle>
                <DialogDescription>
                  Are you sure you want to check out? This will end your current work session.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCheckoutDialog(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCheckInOut("checkout")}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {actionLoading ? "Checking out..." : "Yes, Check Out"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Current Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-gray-600">Loading status...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-gray-600 mb-3">Unable to load check-in status</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError("")
                      void fetchCheckInStatus()
                    }}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Try Again
                  </Button>
                </div>
              ) : status?.hasCompletedWorkDay ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-green-600 text-white mb-2">Work Day Complete</Badge>
                      <p className="text-sm text-gray-600">
                        Checked in at {formatTime(status.todayCheckIn!.checkInTime)} and checked out at {formatTime(status.todayCheckIn!.checkOutTime!)}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        Total hours worked: {status.todayCheckIn!.totalHours || '0.00'}h
                      </p>
                    </div>
                  </div>
                </div>
              ) : status?.isCheckedIn ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-black text-white mb-2">Checked In</Badge>
                      <p className="text-sm text-gray-600">
                        Since {formatTime(status.activeCheckIn!.checkInTime)} today
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        Working time: {getCurrentWorkingTime(status.activeCheckIn!.checkInTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Badge variant="outline" className="mb-2">
                    Not Checked In
                  </Badge>
                  <p className="text-gray-600">Ready to start your workday?</p>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Recent Check-ins */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
              <CardDescription>Your recent work sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {status?.recentCheckIns.length === 0 ? (
                <p className="text-gray-600">No check-in records found</p>
              ) : (
                <div className="space-y-3">
                  {status?.recentCheckIns.map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">{formatDate(checkIn.checkInTime)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>In: {formatTime(checkIn.checkInTime)}</span>
                          {checkIn.checkOutTime && <span>Out: {formatTime(checkIn.checkOutTime)}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        {checkIn.checkOutTime ? (
                          <Badge variant="outline">
                            {checkIn.totalHours ? `${checkIn.totalHours}h` : '0.00h'}
                          </Badge>
                        ) : (
                          <Badge className="bg-black text-white">Active</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canViewAll && (
          <TabsContent value="attendance" className="space-y-4 lg:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Employees</p>
                      <p className="text-2xl font-bold text-gray-900">{allCheckIns?.stats.totalEmployees || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Present Today</p>
                      <p className="text-2xl font-bold text-gray-900">{allCheckIns?.stats.presentToday || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Currently In</p>
                      <p className="text-2xl font-bold text-gray-900">{allCheckIns?.stats.currentlyCheckedIn || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{allCheckIns?.stats.attendanceRate || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Today's Attendance - Takes 2 columns */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          Today's Attendance
                        </CardTitle>
                        <CardDescription>Employee check-in/out records for today</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {allCheckIns?.checkIns.length || 0} records
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {allCheckIns?.checkIns.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No check-in records for today</p>
                        <p className="text-gray-500 text-sm mt-2">Employees haven't checked in yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {allCheckIns?.checkIns.map((checkIn: any) => (
                          <div
                            key={checkIn.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {checkIn.employee?.firstName?.[0]}{checkIn.employee?.lastName?.[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {checkIn.employee?.firstName} {checkIn.employee?.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {checkIn.employee?.position} • {checkIn.employee?.department}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right text-sm">
                                <p className="text-gray-900 font-medium">In: {formatTime(checkIn.checkInTime)}</p>
                                {checkIn.checkOutTime ? (
                                  <p className="text-gray-600">Out: {formatTime(checkIn.checkOutTime)}</p>
                                ) : (
                                  <p className="text-green-600 font-medium">Currently working</p>
                                )}
                              </div>

                              {checkIn.totalHours ? (
                                <Badge variant="outline" className="bg-gray-100">
                                  {checkIn.totalHours}h
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar - Department Stats & Quick Actions */}
              <div className="space-y-4 lg:space-y-6">
                {/* Department Attendance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Department Stats
                    </CardTitle>
                    <CardDescription>Attendance by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const deptStats = allCheckIns?.checkIns.reduce((acc: any, checkIn: any) => {
                          const dept = checkIn.employee?.department || 'Unknown'
                          if (!acc[dept]) {
                            acc[dept] = { total: 0, present: 0 }
                          }
                          acc[dept].present++
                          return acc
                        }, {}) || {}

                        // Add total employees per department (mock data for now)
                        const deptTotals: any = {
                          'Engineering': 3,
                          'Human Resources': 1,
                          'Marketing': 1,
                          'Sales': 1,
                          'Unknown': 0
                        }

                        return Object.entries(deptStats).map(([dept, stats]: [string, any]) => (
                          <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{dept}</p>
                              <p className="text-sm text-gray-600">
                                {stats.present}/{deptTotals[dept] || stats.present} present
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {deptTotals[dept] ? Math.round((stats.present / deptTotals[dept]) * 100) : 100}%
                              </p>
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Common admin tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/dashboard/employees">
                          <Users className="h-4 w-4 mr-2" />
                          View All Employees
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/dashboard/reports">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Generate Reports
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/dashboard/leave">
                          <Calendar className="h-4 w-4 mr-2" />
                          Manage Leave Requests
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Attendance Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Today's Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Employees</span>
                        <span className="font-semibold">{allCheckIns?.stats.totalEmployees || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Present Today</span>
                        <span className="font-semibold text-green-600">{allCheckIns?.stats.presentToday || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Currently Working</span>
                        <span className="font-semibold text-blue-600">{allCheckIns?.stats.currentlyCheckedIn || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Attendance Rate</span>
                        <span className="font-semibold text-purple-600">{allCheckIns?.stats.attendanceRate || 0}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
