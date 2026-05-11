"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  UserPlus,
  FileText,
  BarChart3,
  Settings,
  LogIn,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  Star,
  Eye,
  Plus,
  Bell,
  ChevronRight,
  Timer,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { StatsCardSkeleton, CardSkeleton } from "@/components/ui/skeletons";

// ============================================================================
// INTERFACES / TYPES
// ============================================================================

interface DashboardStats {
  totalEmployees: number;
  activeToday: number;
  lateComers: number;
  avgWorkHours: number;
  attendanceRate: number;
  pendingLeaves: number;
}

interface LateComer {
  id: string;
  employee: string;
  department: string;
  checkInTime: string;
  lateBy: number;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: string;
  department: string;
  timestamp: string;
}

interface PendingLeaveRequest {
  id: string;
  employee: string;
  type: string;
  dates: string;
  days: number;
  status: string;
}

interface EmployeeDashboardData {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    department: string;
    position: string;
  };
  stats: {
    weeklyHours: number;
    monthlyHours: number;
    attendanceRate: number;
    performanceScore: number;
    remainingAnnualDays: number;
    totalAnnualDays: number;
    isCheckedIn: boolean;
    currentCheckInTime?: string;
  };
  leaveBalances: Array<{
    leaveType: string;
    totalDays: number;
    usedDays: number;
    remainingDays: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    action: string;
    time: string;
    date: string;
    timestamp: string;
  }>;
}

interface AnalyticsData {
  period: { start: string; end: string };
  employees: {
    total: number;
    byDepartment: Array<{ department: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  };
  attendance: {
    totalCheckIns: number;
    avgWorkingHours: number;
    daily: Array<{ date: string; count: number }>;
    byDepartment: Array<{
      department: string;
      presentEmployees: number;
      totalEmployees: number;
      attendanceRate: number;
    }>;
    byEmployee: Array<{
      employeeId: string;
      firstName: string;
      lastName: string;
      department: string;
      position: string;
      totalCheckIns: number;
      totalHours: number;
      daysPresent: number;
      lastCheckIn: string;
      avgHoursPerDay: number;
    }>;
  };
  leave: {
    byStatus: Array<{ status: string; count: number }>;
    byType: Array<{ type: string; count: number; totalDays: number }>;
  };
  recentActivities: Array<{
    type: string;
    employee_name: string;
    department: string;
    timestamp: string;
    activity: string;
  }>;
}

// Helper function to safely filter employees
const filterEmployees = (employees: any[], searchTerm: string) => {
  if (!searchTerm) return employees;
  
  const searchLower = searchTerm.toLowerCase();
  
  return employees.filter((emp: any) => {
    const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.toLowerCase();
    const employeeId = String(emp.employeeId || "").toLowerCase();
    const department = String(emp.department || "").toLowerCase();
    
    return (
      fullName.includes(searchLower) ||
      employeeId.includes(searchLower) ||
      department.includes(searchLower)
    );
  });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DashboardPage() {
  // ===== HOOKS & STATE MANAGEMENT =====
  const { data: session, status } = useSession();
  const router = useRouter();

  // Determine if user is an EMPLOYEE (vs ADMIN, HR, MANAGER)
  const isEmployee = session?.user?.role === "EMPLOYEE";

  // ===== EMPLOYEE-SPECIFIC STATE =====
  const [employeeData, setEmployeeData] =
    useState<EmployeeDashboardData | null>(null);

  // ===== ADMIN/HR/MANAGER-SPECIFIC STATE =====
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lateComers, setLateComers] = useState<LateComer[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState<
    PendingLeaveRequest[]
  >([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // ===== SHARED STATE =====
  const [loading, setLoading] = useState(true);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

  // ============================================================================
  // EFFECT: REDIRECT IF NOT AUTHENTICATED
  // ============================================================================
  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ============================================================================
  // EFFECT: FETCH DATA BASED ON USER ROLE
  // ============================================================================
  useEffect(() => {
    // Only fetch if we know the role (status is not loading)
    if (status === "authenticated") {
      if (isEmployee) {
        fetchEmployeeDashboardData();
      } else {
        fetchDashboardData();
      }
    }
  }, [isEmployee, status]);

  // ============================================================================
  // API CALLS
  // ============================================================================

  /**
   * Fetch dashboard data for EMPLOYEE role
   * Gets: personal stats, leave balances, recent activities
   */
  const fetchEmployeeDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/employee");
      if (response.ok) {
        const data = await response.json();
        setEmployeeData(data);
      }
    } catch (error) {
      console.error("Failed to fetch employee dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch dashboard data for ADMIN/HR/MANAGER roles
   * Gets: company stats, late comers, recent activities, pending leaves, analytics
   */
  const fetchDashboardData = async () => {
    try {
      const [statsResponse, analyticsResponse] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/reports/analytics"),
      ]);

      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data.stats);
        setLateComers(data.lateComers);
        setRecentActivities(data.recentActivities);
        setPendingLeaveRequests(data.pendingLeaveRequests);
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CONDITIONAL RENDERING: SHOW BASED ON ROLE
  // ============================================================================

  // Show EMPLOYEE dashboard if user role is EMPLOYEE
  if (isEmployee) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-6 lg:space-y-8">
        {/* ===== HEADER SECTION ===== */}
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
              Welcome back,{" "}
              {employeeData?.employee.firstName || session?.user?.email}! Here's
              your personal overview.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-3">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="shadow-sm cursor-pointer flex-1 sm:flex-none"
              >
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Request Leave</span>
                <span className="sm:hidden">Leave</span>
              </Button>
            </div>
            {employeeData?.stats.isCheckedIn ? (
              <Button
                size="sm"
                className="checkin-button shadow-lg bg-gradient-to-r from-red-500 to-red-600 cursor-pointer relative overflow-hidden flex-1 sm:flex-none"
                asChild
              >
                <Link href="/dashboard/checkin">
                  <div className="relative flex items-center gap-2">
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="font-semibold text-sm sm:text-lg">
                      Check Out
                    </span>
                  </div>
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                className="checkin-button shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 cursor-pointer relative overflow-hidden flex-1 sm:flex-none"
                asChild
              >
                <Link href="/dashboard/checkin">
                  <div className="relative flex items-center gap-2">
                    <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="font-semibold text-sm sm:text-lg">
                      Check In
                    </span>
                  </div>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* ===== STATS CARDS ===== */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatsCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Card 1: Hours This Week */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Hours This Week
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {employeeData?.stats.weeklyHours || 0}h
                </div>
                <div className="flex items-center mt-2">
                  {employeeData?.stats.weeklyHours &&
                  employeeData.stats.weeklyHours >= 40 ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-black mr-1" />
                      <p className="text-sm text-black font-medium">
                        {Math.round(
                          (employeeData.stats.weeklyHours - 40) * 100,
                        ) / 100}
                        h above target
                      </p>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                      <p className="text-sm text-red-600 font-medium">
                        {employeeData?.stats.weeklyHours
                          ? Math.round(
                              (40 - employeeData.stats.weeklyHours) * 100,
                            ) / 100
                          : 40}
                        h below target
                      </p>
                    </>
                  )}
                </div>
                <Progress
                  value={
                    employeeData?.stats.weeklyHours
                      ? Math.min(
                          100,
                          (employeeData.stats.weeklyHours / 40) * 100,
                        )
                      : 0
                  }
                  className="mt-3"
                />
              </CardContent>
            </Card>

            {/* Card 2: Leave Balance */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Leave Balance
                </CardTitle>
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {employeeData?.stats.remainingAnnualDays || 0}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Days remaining
                </p>
                <div className="flex items-center mt-2">
                  <Target className="h-4 w-4 text-slate-400 mr-1" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {employeeData?.stats.totalAnnualDays || 25} days total
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Attendance Rate */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Attendance Rate
                </CardTitle>
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {employeeData?.stats.attendanceRate || 0}%
                </div>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {employeeData?.stats.attendanceRate &&
                    employeeData.stats.attendanceRate >= 90
                      ? "Excellent performance"
                      : employeeData?.stats.attendanceRate &&
                          employeeData.stats.attendanceRate >= 80
                        ? "Good performance"
                        : "Needs improvement"}
                  </p>
                </div>
                <Progress
                  value={employeeData?.stats.attendanceRate || 0}
                  className="mt-3"
                />
              </CardContent>
            </Card>

            {/* Card 4: Performance Score */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Performance Score
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {employeeData?.stats.performanceScore || 0}%
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  This month
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-purple-600 mr-1" />
                  <p className="text-xs text-purple-600 font-medium">
                    Based on attendance & hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== RECENT ACTIVITIES & QUICK ACTIONS GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Recent Activities Card */}
          <Card className="lg:col-span-2 group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                  <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                My Recent Activities
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Your recent check-ins and requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50"
                    >
                      <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : employeeData?.recentActivities.length ? (
                  employeeData.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group/item"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          activity.type === "checkin"
                            ? "bg-black"
                            : activity.type === "leave"
                              ? "bg-orange-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover/item:text-slate-700 dark:group-hover/item:text-slate-300 transition-colors">
                          You {activity.action}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {new Date(activity.time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <span className="text-xs text-slate-500 dark:text-slate-500">
                            •
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No recent activities found
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                      Your activities will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {employeeData?.stats.isCheckedIn ? (
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-3 bg-transparent border-red-200 dark:border-red-700 cursor-pointer"
                    asChild
                  >
                    <Link href="/dashboard/checkin">
                      <div className="flex flex-col items-center gap-3">
                        <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                          Check Out
                        </span>
                      </div>
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-3 bg-transparent border-green-200 dark:border-green-700 cursor-pointer"
                    asChild
                  >
                    <Link href="/dashboard/checkin">
                      <div className="flex flex-col items-center gap-3">
                        <LogIn className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Check In
                        </span>
                      </div>
                    </Link>
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 cursor-pointer"
                  asChild
                >
                  <Link href="/dashboard/leave">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-black dark:text-white" />
                    <span className="text-xs sm:text-sm font-medium">
                      Request Leave
                    </span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 cursor-pointer"
                  asChild
                >
                  <Link href="/dashboard/profile">
                    <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-400" />
                    <span className="text-xs sm:text-sm font-medium">
                      My Profile
                    </span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 cursor-pointer"
                  asChild
                >
                  <Link href="/dashboard/checkin">
                    <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-400" />
                    <span className="text-xs sm:text-sm font-medium">
                      Time Tracking
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== WEEKLY PROGRESS & NOTIFICATIONS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Weekly Progress Overview */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Weekly Progress Overview
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Track your weekly performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-20" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-12" />
                      </div>
                      <div className="h-8 bg-slate-200 dark:bg-slate-600 rounded w-16" />
                      <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          This Week
                        </span>
                        <div
                          className={`flex items-center gap-1 ${
                            employeeData?.stats.weeklyHours &&
                            employeeData.stats.weeklyHours >= 40
                              ? "text-black"
                              : "text-red-600"
                          }`}
                        >
                          {employeeData?.stats.weeklyHours &&
                          employeeData.stats.weeklyHours >= 40 ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {employeeData?.stats.weeklyHours || 0}h
                      </div>
                      <p
                        className={`text-sm font-medium ${
                          employeeData?.stats.weeklyHours &&
                          employeeData.stats.weeklyHours >= 40
                            ? "text-black"
                            : "text-red-600"
                        }`}
                      >
                        {employeeData?.stats.weeklyHours &&
                        employeeData.stats.weeklyHours >= 40
                          ? `+${Math.round((employeeData.stats.weeklyHours - 40) * 100) / 100}h above target`
                          : employeeData?.stats.weeklyHours
                            ? `${Math.round((40 - employeeData.stats.weeklyHours) * 100) / 100}h below target`
                            : "40h below target"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          This Month
                        </span>
                        <div className="flex items-center gap-1 text-black">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {employeeData?.stats.monthlyHours
                          ? Math.round(employeeData.stats.monthlyHours)
                          : 0}
                        h
                      </div>
                      <p className="text-sm font-medium text-black">
                        {employeeData?.stats.monthlyHours
                          ? Math.round(employeeData.stats.monthlyHours)
                          : 0}
                        h total
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Attendance
                        </span>
                        <div
                          className={`flex items-center gap-1 ${
                            employeeData?.stats.attendanceRate &&
                            employeeData.stats.attendanceRate >= 90
                              ? "text-black"
                              : employeeData?.stats.attendanceRate &&
                                  employeeData.stats.attendanceRate >= 80
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {employeeData?.stats.attendanceRate &&
                          employeeData.stats.attendanceRate >= 80 ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {employeeData?.stats.attendanceRate || 0}%
                      </div>
                      <p
                        className={`text-sm font-medium ${
                          employeeData?.stats.attendanceRate &&
                          employeeData.stats.attendanceRate >= 90
                            ? "text-black"
                            : employeeData?.stats.attendanceRate &&
                                employeeData.stats.attendanceRate >= 80
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {employeeData?.stats.attendanceRate &&
                        employeeData.stats.attendanceRate >= 90
                          ? "Excellent"
                          : employeeData?.stats.attendanceRate &&
                              employeeData.stats.attendanceRate >= 80
                            ? "Good"
                            : "Needs improvement"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                Recent Notifications
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Stay updated with important alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Leave request approved
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Your annual leave for Dec 20-22 has been approved
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      New company policy
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Updated remote work policy available
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Performance review
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Q4 performance review scheduled for next week
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ADMIN/HR/MANAGER DASHBOARD (NON-EMPLOYEE)
  // ============================================================================

  // Show loading state while fetching admin data
  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-6 lg:space-y-8">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Company Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
              Welcome back! Here's what's happening at your company.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Admin dashboard main content
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-6 lg:space-y-8">
      {/* ===== ADMIN HEADER ===== */}
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Company Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
            Welcome back! Here's what's happening at your company.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="shadow-sm cursor-pointer flex-1 sm:flex-none"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
          <Link href="/dashboard/employees/new">
            <Button
              size="sm"
              className="shadow-lg cursor-pointer flex-1 sm:flex-none"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Employee</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ===== ADMIN STATS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Employees
            </CardTitle>
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50 transition-colors">
              <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats?.totalEmployees || 0}
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-black mr-1" />
              <p className="text-sm text-black font-medium">Active employees</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Today
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats?.activeToday || 0}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {stats?.attendanceRate || 0}% attendance rate
            </p>
            <Progress value={stats?.attendanceRate || 0} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Today's Late Comers
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
              <Timer className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats?.lateComers || 0}
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              After 9:30 AM
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full cursor-pointer"
              asChild
            >
              <Link href="/dashboard/checkin">View Details</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Avg Work Hours
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats?.avgWorkHours || 0}h
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              This week
            </p>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-black mr-1" />
              <p className="text-xs text-black font-medium">Weekly average</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== EMPLOYEE ATTENDANCE TABLE ===== */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">
                Employee Attendance Summary
              </CardTitle>
              <CardDescription>
                Detailed attendance records for each employee
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="employeeSearch" className="text-sm">
                Filter:
              </Label>
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
          {!analytics?.attendance?.byEmployee ||
          analytics.attendance.byEmployee.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No employee attendance data available for the selected period
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Employee ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Department
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Position
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">
                      Days Present
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">
                      Total Hours
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">
                      Avg Hours/Day
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Last Check-in
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.attendance?.byEmployee
                    ? filterEmployees(
                        analytics.attendance.byEmployee,
                        employeeSearchTerm,
                      )
                        .sort((a: any, b: any) =>
                          `${a.firstName} ${a.lastName}`.localeCompare(
                            `${b.firstName} ${b.lastName}`,
                          ),
                        )
                        .map((emp: any) => (
                          <tr
                            key={emp.employeeId}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm">
                              <Badge variant="outline">
                                {emp.employeeId}
                              </Badge>
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
                              {new Date(
                                emp.lastCheckIn,
                              ).toLocaleDateString()}{" "}
                              {new Date(emp.lastCheckIn).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </td>
                          </tr>
                        ))
                    : null}
                </tbody>
              </table>
              {analytics?.attendance?.byEmployee &&
                filterEmployees(
                  analytics.attendance.byEmployee,
                  employeeSearchTerm,
                ).length === 0 &&
                employeeSearchTerm && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No employees found matching "{employeeSearchTerm}"
                    </p>
                  </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== RECENT ACTIVITIES & LATE COMERS GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              Recent Activities
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Latest check-ins, check-outs, and leave requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400 text-center py-8">
                  No recent activities
                </p>
              ) : (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group/item"
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        activity.type === "checkin"
                          ? "bg-green-500"
                          : activity.type === "checkout"
                            ? "bg-red-500"
                            : activity.type === "leave"
                              ? "bg-orange-500"
                              : activity.type === "profile"
                                ? "bg-blue-500"
                                : "bg-purple-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover/item:text-slate-700 dark:group-hover/item:text-slate-300 transition-colors">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        {activity.action}
                        {activity.type === "checkin" && (
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                            ●
                          </span>
                        )}
                        {activity.type === "checkout" && (
                          <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                            ●
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {new Date(activity.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          •
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {activity.department}
                        </Badge>
                        {activity.type === "checkin" && (
                          <Badge
                            variant="outline"
                            className="text-xs text-green-600 border-green-200 dark:text-green-400 dark:border-green-800"
                          >
                            Check-in
                          </Badge>
                        )}
                        {activity.type === "checkout" && (
                          <Badge
                            variant="outline"
                            className="text-xs text-red-600 border-red-200 dark:text-red-400 dark:border-red-800"
                          >
                            Check-out
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Late Comers */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Timer className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              Today's Late Comers
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Employees who arrived after 9:30 AM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lateComers.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400 text-center py-8">
                  No late comers today! 🎉
                </p>
              ) : (
                lateComers.map((lateComer) => (
                  <div
                    key={lateComer.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-red-200 dark:ring-red-600">
                      <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-600 text-white font-semibold">
                        {lateComer.employee
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {lateComer.employee}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {lateComer.department}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      >
                        {lateComer.lateBy}min late
                      </Badge>
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== PENDING APPROVALS ===== */}
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            Pending Approvals
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Leave requests awaiting your approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingLeaveRequests.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400 text-center py-8">
                No pending leave requests
              </p>
            ) : (
              pendingLeaveRequests.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {approval.employee}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {approval.type}
                        </Badge>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {approval.dates} ({approval.days} days)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* ===== QUICK ACTIONS ===== */}
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/dashboard/employees/new">
              <Button
                variant="outline"
                className="h-24 flex-col gap-3 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 w-full cursor-pointer"
              >
                <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">Add Employee</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 cursor-pointer"
            >
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs sm:text-sm font-medium">
                Generate Report
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 cursor-pointer"
            >
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              <span className="text-xs sm:text-sm font-medium">
                View Calendar
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 cursor-pointer"
            >
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-400" />
              <span className="text-xs sm:text-sm font-medium">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}