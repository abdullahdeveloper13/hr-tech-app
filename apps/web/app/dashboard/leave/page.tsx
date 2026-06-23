"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, CheckCircle, XCircle } from "lucide-react"
import { CardSkeleton, StatsCardSkeleton } from "@/components/ui/skeletons"

interface LeaveRequest {
  id: string
  leaveType: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: string
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
  createdAt: string
  employee: {
    id: string
    employeeId: string
    firstName: string
    lastName: string
    department: string
    position: string
  }
}

interface LeaveBalance {
  id: string
  leaveType: string
  totalDays: number
  usedDays: number
  remainingDays: number
  year: number
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
    return data.error
  }
  return fallback
}

export default function LeavePage() {
  const { data: session } = useSession()
  const user = session?.user
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  })

  const canApprove = ["ADMIN", "HR", "MANAGER"].includes(user?.role || "")

  useEffect(() => {
    fetchLeaveRequests()
    fetchLeaveBalances()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch("/api/leave")
      const data = await response.json().catch(() => null)
      if (response.ok) {
        setLeaveRequests(Array.isArray(data?.leaveRequests) ? data.leaveRequests : [])
      } else {
        const message = getErrorMessage(data, "Failed to fetch leave requests")
        setError(message)
        console.error("Failed to fetch leave requests:", message)
      }
    } catch (error) {
      console.error("Failed to fetch leave requests:", error)
      setError("Network error while fetching leave requests")
    }
  }

  const fetchLeaveBalances = async () => {
    try {
      const response = await fetch("/api/leave/balance")
      const data = await response.json().catch(() => null)
      if (response.ok) {
        const normalizedBalances = Array.isArray(data)
          ? data
          : Array.isArray(data?.leaveBalances)
            ? data.leaveBalances
            : []
        setLeaveBalances(normalizedBalances)
      } else {
        const message = getErrorMessage(data, "Failed to fetch leave balances")
        setError(message)
        setLeaveBalances([])
        console.error("Failed to fetch leave balances:", message)
      }
    } catch (error) {
      console.error("Failed to fetch leave balances:", error)
      setError("Network error while fetching leave balances")
      setLeaveBalances([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit leave request")
      }

      // Reset form and close dialog
      setFormData({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
      })
      setDialogOpen(false)

      // Refresh data
      await fetchLeaveRequests()
      await fetchLeaveBalances()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproval = async (requestId: string, status: "APPROVED" | "REJECTED", rejectedReason?: string) => {
    try {
      const response = await fetch(`/api/leave/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, rejectedReason }),
      })

      if (response.ok) {
        await fetchLeaveRequests()
        await fetchLeaveBalances()
      }
    } catch (error) {
      console.error("Failed to update leave request:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-chart-1 text-white"
      case "REJECTED":
        return "bg-destructive text-destructive-foreground"
      case "PENDING":
        return "bg-chart-2 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case "ANNUAL":
        return "bg-black text-white"
      case "SICK":
        return "bg-destructive text-destructive-foreground"
      case "PERSONAL":
        return "bg-chart-2 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground">Manage your leave requests and balances</p>
        </div>
        
        {/* Loading skeleton for leave balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </div>
        
        {/* Loading skeleton for leave requests */}
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground">Manage your leave requests and balances</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
              <DialogDescription>Submit a new leave request for approval</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select
                  value={formData.leaveType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, leaveType: value }))}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                    <SelectItem value="SICK">Sick Leave</SelectItem>
                    <SelectItem value="PERSONAL">Personal Leave</SelectItem>
                    <SelectItem value="MATERNITY">Maternity Leave</SelectItem>
                    <SelectItem value="PATERNITY">Paternity Leave</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for your leave request..."
                  value={formData.reason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                  required
                  disabled={submitting}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="balance">Leave Balance</TabsTrigger>
          {canApprove && <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>}
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Your submitted leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              {leaveRequests.filter((req) => !canApprove || req.employee.firstName === user?.employee?.firstName)
                .length === 0 ? (
                <p className="text-muted-foreground">No leave requests found</p>
              ) : (
                <div className="space-y-3">
                  {leaveRequests
                    .filter((req) => !canApprove || req.employee.firstName === user?.employee?.firstName)
                    .map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getLeaveTypeColor(request.leaveType)}>{request.leaveType}</Badge>
                            <span className="font-medium">
                              {formatDate(request.startDate)} - {formatDate(request.endDate)}
                            </span>
                            <span className="text-sm text-muted-foreground">({request.totalDays} days)</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{request.reason}</p>
                          <p className="text-xs text-muted-foreground">Submitted on {formatDate(request.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          {leaveBalances.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">No leave balances available for this account.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaveBalances.map((balance) => (
                <Card key={balance.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getLeaveTypeColor(balance.leaveType)}>{balance.leaveType}</Badge>
                        <span className="text-sm text-muted-foreground">{balance.year}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Total:</span>
                          <span className="font-medium">{balance.totalDays} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Used:</span>
                          <span className="font-medium">{balance.usedDays} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Remaining:</span>
                          <span className="font-medium text-black">{balance.remainingDays} days</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-black h-2 rounded-full"
                          style={{
                            width: `${Math.min((balance.usedDays / balance.totalDays) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {canApprove && (
          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Leave requests awaiting your approval</CardDescription>
              </CardHeader>
              <CardContent>
                {leaveRequests.filter((req) => req.status === "PENDING").length === 0 ? (
                  <p className="text-muted-foreground">No pending approvals</p>
                ) : (
                  <div className="space-y-4">
                    {leaveRequests
                      .filter((req) => req.status === "PENDING")
                      .map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {request.employee.firstName} {request.employee.lastName}
                              </span>
                              <Badge className={getLeaveTypeColor(request.leaveType)}>{request.leaveType}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>
                                {request.employee.position} • {request.employee.department}
                              </p>
                              <p>
                                {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.totalDays}{" "}
                                days)
                              </p>
                              <p>Reason: {request.reason}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproval(request.id, "APPROVED")}
                              className="bg-chart-1 hover:bg-chart-1/90"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt("Please provide a reason for rejection:")
                                if (reason) {
                                  handleApproval(request.id, "REJECTED", reason)
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
