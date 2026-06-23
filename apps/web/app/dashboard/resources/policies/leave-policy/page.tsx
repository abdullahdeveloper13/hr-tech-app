"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function LeavePolicyPage() {
  const leaveTypes = [
    {
      id: "annual",
      title: "Annual Leave (Vacation)",
      days: "15-25 days",
      description: "Paid time off for rest, relaxation, and personal activities",
      icon: Calendar,
      details: `
        <h3>Eligibility</h3>
        <p>All full-time employees are eligible for annual leave after completing 90 days of employment.</p>
        
        <h3>Accrual Rates</h3>
        <ul>
          <li><strong>0-2 years:</strong> 15 days per year</li>
          <li><strong>3-5 years:</strong> 20 days per year</li>
          <li><strong>6+ years:</strong> 25 days per year</li>
        </ul>
        
        <h3>Request Process</h3>
        <ol>
          <li>Submit request through HR system at least 2 weeks in advance</li>
          <li>Supervisor approval required</li>
          <li>Confirmation provided within 3 business days</li>
        </ol>
        
        <h3>Important Notes</h3>
        <ul>
          <li>Maximum 5 consecutive days without manager approval</li>
          <li>Blackout periods may apply during peak business times</li>
          <li>Unused vacation time carries over up to 10 days</li>
        </ul>
      `
    },
    {
      id: "sick",
      title: "Sick Leave",
      days: "10 days",
      description: "Time off for illness, medical appointments, and recovery",
      icon: AlertCircle,
      details: `
        <h3>Coverage</h3>
        <p>Sick leave covers:</p>
        <ul>
          <li>Personal illness or injury</li>
          <li>Medical and dental appointments</li>
          <li>Mental health days</li>
          <li>Recovery from medical procedures</li>
        </ul>
        
        <h3>Documentation</h3>
        <ul>
          <li>No documentation required for 3 days or less</li>
          <li>Doctor's note required for 4+ consecutive days</li>
          <li>FMLA documentation for extended absences</li>
        </ul>
        
        <h3>Notification</h3>
        <p>Employees must notify their supervisor as soon as possible, preferably before the start of their shift.</p>
      `
    },
    {
      id: "personal",
      title: "Personal Days",
      days: "3 days",
      description: "Flexible time off for personal matters and emergencies",
      icon: Clock,
      details: `
        <h3>Usage</h3>
        <p>Personal days can be used for:</p>
        <ul>
          <li>Personal appointments</li>
          <li>Family emergencies</li>
          <li>Religious observances</li>
          <li>Moving or relocation</li>
          <li>Other personal matters</li>
        </ul>
        
        <h3>Request Process</h3>
        <ul>
          <li>Advance notice preferred but not required</li>
          <li>Same-day requests accepted for emergencies</li>
          <li>Manager approval required</li>
        </ul>
        
        <h3>Carryover</h3>
        <p>Personal days do not carry over to the next year and must be used by December 31st.</p>
      `
    },
    {
      id: "bereavement",
      title: "Bereavement Leave",
      days: "3-5 days",
      description: "Time off for the death of family members",
      icon: AlertCircle,
      details: `
        <h3>Coverage</h3>
        <ul>
          <li><strong>Immediate family:</strong> 5 days (spouse, children, parents, siblings)</li>
          <li><strong>Extended family:</strong> 3 days (grandparents, in-laws, aunts, uncles)</li>
          <li><strong>Close friends:</strong> 1 day (at manager discretion)</li>
        </ul>
        
        <h3>Documentation</h3>
        <p>Employees may be asked to provide obituary or death certificate.</p>
        
        <h3>Additional Time</h3>
        <p>Additional time may be taken using vacation or personal days if needed.</p>
      `
    },
    {
      id: "jury",
      title: "Jury Duty",
      days: "As required",
      description: "Time off for jury duty and court appearances",
      icon: CheckCircle,
      details: `
        <h3>Coverage</h3>
        <p>Employees receive full pay while serving on jury duty.</p>
        
        <h3>Notification</h3>
        <p>Provide jury summons to supervisor as soon as received.</p>
        
        <h3>Documentation</h3>
        <p>Submit court documentation upon return to work.</p>
        
        <h3>Other Court Appearances</h3>
        <p>Personal court appearances must be taken as vacation or personal time.</p>
      `
    },
    {
      id: "military",
      title: "Military Leave",
      days: "As required",
      description: "Time off for military service and training",
      icon: CheckCircle,
      details: `
        <h3>Coverage</h3>
        <p>Protected leave for:</p>
        <ul>
          <li>Active military service</li>
          <li>Reserve training</li>
          <li>National Guard duty</li>
          <li>Military deployment</li>
        </ul>
        
        <h3>Job Protection</h3>
        <p>Position is protected under USERRA (Uniformed Services Employment and Reemployment Rights Act).</p>
        
        <h3>Benefits</h3>
        <p>Health benefits continue for up to 30 days; longer coverage available with premium payment.</p>
      `
    }
  ]

  const sections = [
    {
      id: "general-policy",
      title: "General Leave Policy",
      description: "Overview of leave policies and procedures",
      content: `
        <h3>Policy Statement</h3>
        <p>We recognize that employees need time away from work for various personal and family reasons. This policy outlines the types of leave available and the procedures for requesting and using leave time.</p>
        
        <h3>Eligibility</h3>
        <p>Leave benefits are available to all full-time employees. Part-time employees may be eligible for some types of leave on a pro-rated basis.</p>
        
        <h3>Leave Year</h3>
        <p>The leave year runs from January 1st through December 31st. Most leave benefits reset annually on January 1st.</p>
        
        <h3>Request Process</h3>
        <p>All leave requests must be submitted through our HR system and approved by the employee's supervisor. Emergency leave may be requested verbally with written confirmation to follow.</p>
        
        <h3>Approval Criteria</h3>
        <p>Leave requests are approved based on:</p>
        <ul>
          <li>Business needs and staffing requirements</li>
          <li>Employee's available leave balance</li>
          <li>Advance notice provided</li>
          <li>Reason for leave</li>
        </ul>
      `
    },
    {
      id: "request-procedures",
      title: "Request Procedures",
      description: "How to request and manage leave time",
      content: `
        <h3>Advance Notice Requirements</h3>
        <ul>
          <li><strong>Vacation:</strong> 2 weeks minimum notice</li>
          <li><strong>Personal days:</strong> 24 hours notice preferred</li>
          <li><strong>Sick leave:</strong> Same day notice acceptable</li>
          <li><strong>Emergency leave:</strong> As soon as possible</li>
        </ul>
        
        <h3>Online Request System</h3>
        <p>All leave requests should be submitted through our HR portal:</p>
        <ol>
          <li>Log into the employee portal</li>
          <li>Navigate to the Leave Request section</li>
          <li>Select the type of leave</li>
          <li>Enter dates and reason</li>
          <li>Submit for supervisor approval</li>
        </ol>
        
        <h3>Emergency Procedures</h3>
        <p>For emergency leave situations:</p>
        <ol>
          <li>Contact your supervisor immediately by phone</li>
          <li>Provide as much detail as possible</li>
          <li>Submit formal request within 24 hours of return</li>
          <li>Provide documentation if required</li>
        </ol>
        
        <h3>Modification and Cancellation</h3>
        <p>Leave requests can be modified or cancelled with supervisor approval, subject to business needs.</p>
      `
    },
    {
      id: "blackout-periods",
      title: "Blackout Periods",
      description: "Restrictions on leave during peak business periods",
      content: `
        <h3>Definition</h3>
        <p>Blackout periods are times when vacation requests may be restricted due to business needs or peak operational periods.</p>
        
        <h3>Annual Blackout Periods</h3>
        <ul>
          <li><strong>December 20-31:</strong> Year-end closing</li>
          <li><strong>Quarterly closing:</strong> Last week of each quarter</li>
          <li><strong>Major product launches:</strong> As announced</li>
          <li><strong>Company events:</strong> All-hands meetings, training sessions</li>
        </ul>
        
        <h3>Department-Specific Restrictions</h3>
        <p>Some departments may have additional blackout periods based on business cycles:</p>
        <ul>
          <li><strong>Accounting:</strong> Month-end and year-end closing</li>
          <li><strong>Customer Service:</strong> Holiday seasons</li>
          <li><strong>IT:</strong> Major system updates</li>
          <li><strong>Sales:</strong> End of quarter and year</li>
        </ul>
        
        <h3>Exceptions</h3>
        <p>Exceptions may be made for:</p>
        <ul>
          <li>Medical emergencies</li>
          <li>Family emergencies</li>
          <li>Pre-planned events with 30+ days notice</li>
          <li>Manager discretion for business needs</li>
        </ul>
      `
    },
    {
      id: "documentation",
      title: "Documentation Requirements",
      description: "Required documentation for different types of leave",
      content: `
        <h3>Sick Leave Documentation</h3>
        <ul>
          <li><strong>1-3 days:</strong> No documentation required</li>
          <li><strong>4-7 days:</strong> Doctor's note or medical certificate</li>
          <li><strong>8+ days:</strong> Medical certificate and FMLA forms</li>
          <li><strong>Mental health:</strong> Doctor's note or therapist certification</li>
        </ul>
        
        <h3>Bereavement Documentation</h3>
        <ul>
          <li>Obituary or death certificate</li>
          <li>Relationship verification if not obvious</li>
          <li>Travel documentation if attending funeral out of town</li>
        </ul>
        
        <h3>Jury Duty Documentation</h3>
        <ul>
          <li>Jury summons or court notice</li>
          <li>Court attendance certificate</li>
          <li>Payment documentation from court</li>
        </ul>
        
        <h3>Military Leave Documentation</h3>
        <ul>
          <li>Military orders or training schedule</li>
          <li>Deployment notification</li>
          <li>Return to work certification</li>
        </ul>
        
        <h3>Documentation Timeline</h3>
        <p>All documentation must be submitted within 5 business days of return to work, unless extenuating circumstances prevent timely submission.</p>
      `
    },
    {
      id: "fmla",
      title: "Family and Medical Leave Act (FMLA)",
      description: "Federal leave protections for family and medical situations",
      content: `
        <h3>Eligibility</h3>
        <p>Employees are eligible for FMLA if they have:</p>
        <ul>
          <li>Worked for the company for at least 12 months</li>
          <li>Worked at least 1,250 hours in the past 12 months</li>
          <li>Work at a location with 50+ employees within 75 miles</li>
        </ul>
        
        <h3>Covered Situations</h3>
        <p>FMLA covers:</p>
        <ul>
          <li>Birth or adoption of a child</li>
          <li>Care for spouse, child, or parent with serious health condition</li>
          <li>Employee's own serious health condition</li>
          <li>Military family leave (qualifying exigency)</li>
          <li>Military caregiver leave</li>
        </ul>
        
        <h3>Leave Amount</h3>
        <p>Eligible employees can take up to 12 weeks of unpaid leave per year. Military caregiver leave allows up to 26 weeks.</p>
        
        <h3>Job Protection</h3>
        <p>FMLA provides job protection, meaning employees have the right to return to the same or equivalent position after leave.</p>
        
        <h3>Health Benefits</h3>
        <p>Health benefits continue during FMLA leave. Employees must continue paying their portion of premiums.</p>
        
        <h3>Application Process</h3>
        <ol>
          <li>Notify supervisor and HR of need for FMLA leave</li>
          <li>Complete FMLA application forms</li>
          <li>Provide medical certification if required</li>
          <li>Receive approval and leave designation</li>
          <li>Provide periodic updates as required</li>
        </ol>
      `
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/resources/policies">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Policies
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leave Policy</h1>
            <p className="text-muted-foreground">Vacation, sick leave, and time-off procedures</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Document Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Leave Policy 2024</h3>
                <p className="text-sm text-muted-foreground">Version 2.0 • Last updated January 20, 2024</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Current Version
              </Badge>
              <Badge variant="outline">
                32 pages
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Types Overview</CardTitle>
          <CardDescription>Summary of available leave types and their basic terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveTypes.map((leave) => (
              <div key={leave.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <leave.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{leave.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {leave.days}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{leave.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Leave Types */}
      {leaveTypes.map((leave) => (
        <Card key={leave.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <leave.icon className="h-5 w-5" />
              </div>
              {leave.title}
              <Badge variant="outline">{leave.days}</Badge>
            </CardTitle>
            <CardDescription>{leave.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: leave.details }}
            />
          </CardContent>
        </Card>
      ))}

      {/* Policy Sections */}
      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              {section.title}
            </CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </CardContent>
        </Card>
      ))}

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
          <CardDescription>Important contact information and links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Request Leave</h4>
              <p className="text-sm text-blue-800 mb-2">Submit leave requests through the HR portal</p>
              <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
                Go to Leave Request
              </Button>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Need Help?</h4>
              <p className="text-sm text-green-800 mb-2">Contact HR for leave-related questions</p>
              <p className="text-sm text-green-800">hr@company.com • (555) 123-4567</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              This leave policy is effective as of January 20, 2024
            </p>
            <p className="text-xs text-muted-foreground">
              For questions about this policy, please contact HR at hr@company.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
