"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Users, Shield, Calendar, Heart, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function PoliciesPage() {
  const policies = [
    {
      id: "employee-handbook",
      title: "Employee Handbook",
      description: "Complete guide to company policies, procedures, and employee benefits",
      category: "General",
      icon: FileText,
      lastUpdated: "2024-01-15",
      status: "Current",
      link: "/dashboard/resources/policies/employee-handbook"
    },
    {
      id: "code-of-conduct",
      title: "Code of Conduct",
      description: "Professional behavior standards and ethical guidelines for all employees",
      category: "Ethics",
      icon: Shield,
      lastUpdated: "2024-01-10",
      status: "Current",
      link: "/dashboard/resources/policies/code-of-conduct"
    },
    {
      id: "leave-policy",
      title: "Leave Policy",
      description: "Vacation, sick leave, personal time, and other time-off procedures",
      category: "Leave",
      icon: Calendar,
      lastUpdated: "2024-01-20",
      status: "Current",
      link: "/dashboard/resources/policies/leave-policy"
    },
    {
      id: "remote-work-policy",
      title: "Remote Work Policy",
      description: "Guidelines and procedures for working from home and remote locations",
      category: "Work Arrangement",
      icon: Users,
      lastUpdated: "2024-01-12",
      status: "Current",
      link: "/dashboard/resources/policies/remote-work-policy"
    },
    {
      id: "health-safety-policy",
      title: "Health & Safety Policy",
      description: "Workplace safety guidelines and health protocols",
      category: "Safety",
      icon: Heart,
      lastUpdated: "2024-01-08",
      status: "Current",
      link: "/dashboard/resources/policies/health-safety-policy"
    },
    {
      id: "anti-discrimination-policy",
      title: "Anti-Discrimination & Harassment Policy",
      description: "Equal opportunity employment and workplace harassment prevention",
      category: "Ethics",
      icon: Shield,
      lastUpdated: "2024-01-05",
      status: "Current",
      link: "/dashboard/resources/policies/anti-discrimination-policy"
    }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "General":
        return "bg-blue-100 text-blue-800"
      case "Ethics":
        return "bg-purple-100 text-purple-800"
      case "Leave":
        return "bg-green-100 text-green-800"
      case "Work Arrangement":
        return "bg-orange-100 text-orange-800"
      case "Safety":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Current":
        return "bg-green-100 text-green-800"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800"
      case "Archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/resources">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">HR Policies</h1>
          <p className="text-muted-foreground">Company policies and procedures for all employees</p>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <Card key={policy.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <policy.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{policy.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={getCategoryColor(policy.category)}>
                        {policy.category}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {policy.description}
              </CardDescription>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                </div>
                <Link href={policy.link}>
                  <Button className="w-full" size="sm">
                    View Policy
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Information</CardTitle>
          <CardDescription>Important notes about company policies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Policy Updates</h4>
              <p className="text-sm text-blue-800">
                All policies are reviewed annually and updated as needed. Employees will be notified of any changes 
                through company communications.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Questions or Concerns</h4>
              <p className="text-sm text-green-800">
                If you have questions about any policy or need clarification, please contact the HR department 
                at hr@company.com or speak with your supervisor.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Policy Compliance</h4>
              <p className="text-sm text-yellow-800">
                All employees are expected to read, understand, and comply with company policies. 
                Violations may result in disciplinary action.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
