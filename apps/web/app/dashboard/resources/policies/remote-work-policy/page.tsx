"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Users, Home, Wifi, Clock, Shield } from "lucide-react"
import Link from "next/link"

export default function RemoteWorkPolicyPage() {
  const sections = [
    {
      id: "overview",
      title: "Remote Work Overview",
      description: "Policy scope and eligibility for remote work arrangements",
      content: `
        <h3>Policy Purpose</h3>
        <p>This policy establishes guidelines for employees who work remotely, either on a full-time or part-time basis. It outlines expectations, responsibilities, and procedures to ensure productivity and maintain company standards.</p>
        
        <h3>Eligibility</h3>
        <p>Remote work arrangements may be available to employees whose job functions can be performed effectively outside the traditional office setting. Eligibility is determined by:</p>
        <ul>
          <li>Job responsibilities and requirements</li>
          <li>Employee performance and reliability</li>
          <li>Manager approval and business needs</li>
          <li>Technology and equipment requirements</li>
        </ul>
        
        <h3>Types of Remote Work</h3>
        <ul>
          <li><strong>Full Remote:</strong> 100% work from home or approved location</li>
          <li><strong>Hybrid:</strong> Combination of office and remote work</li>
          <li><strong>Occasional:</strong> Remote work on an as-needed basis</li>
          <li><strong>Emergency:</strong> Temporary remote work during emergencies</li>
        </ul>
        
        <h3>Approval Process</h3>
        <p>All remote work arrangements require:</p>
        <ol>
          <li>Written request submitted to supervisor</li>
          <li>Manager evaluation and approval</li>
          <li>HR review and documentation</li>
          <li>Signed remote work agreement</li>
        </ol>
      `
    },
    {
      id: "expectations",
      title: "Work Expectations",
      description: "Performance standards and work requirements for remote employees",
      content: `
        <h3>Performance Standards</h3>
        <p>Remote employees are expected to maintain the same performance standards as office-based employees:</p>
        <ul>
          <li>Meet all job responsibilities and deadlines</li>
          <li>Maintain regular communication with team members</li>
          <li>Participate in meetings and company events</li>
          <li>Complete assigned tasks with quality and timeliness</li>
          <li>Follow company policies and procedures</li>
        </ul>
        
        <h3>Work Hours</h3>
        <p>Remote employees are expected to:</p>
        <ul>
          <li>Work during standard business hours (9 AM - 6 PM)</li>
          <li>Be available for meetings and collaboration</li>
          <li>Maintain consistent work schedule</li>
          <li>Notify supervisor of schedule changes</li>
          <li>Take appropriate breaks and lunch periods</li>
        </ul>
        
        <h3>Communication Requirements</h3>
        <p>Remote employees must:</p>
        <ul>
          <li>Respond to emails within 4 hours during business hours</li>
          <li>Participate in all scheduled meetings</li>
          <li>Provide regular status updates to supervisor</li>
          <li>Use company-approved communication tools</li>
          <li>Maintain professional communication standards</li>
        </ul>
        
        <h3>Availability</h3>
        <p>Remote employees must be available during core business hours and maintain regular contact with their team and supervisor. Extended unavailability must be approved in advance.</p>
      `
    },
    {
      id: "workspace",
      title: "Workspace Requirements",
      description: "Home office setup and workspace standards",
      content: `
        <h3>Dedicated Workspace</h3>
        <p>Remote employees must maintain a dedicated workspace that:</p>
        <ul>
          <li>Is free from distractions and interruptions</li>
          <li>Provides privacy for confidential work</li>
          <li>Has adequate lighting and ventilation</li>
          <li>Includes proper ergonomic furniture</li>
          <li>Maintains professional appearance for video calls</li>
        </ul>
        
        <h3>Technology Requirements</h3>
        <p>Remote employees must have:</p>
        <ul>
          <li>Reliable high-speed internet connection (minimum 25 Mbps)</li>
          <li>Company-provided laptop or approved personal device</li>
          <li>Webcam and microphone for video conferencing</li>
          <li>Updated antivirus and security software</li>
          <li>Backup internet connection when possible</li>
        </ul>
        
        <h3>Equipment and Supplies</h3>
        <p>The company may provide:</p>
        <ul>
          <li>Laptop or desktop computer</li>
          <li>Monitor, keyboard, and mouse</li>
          <li>Headset or speaker system</li>
          <li>Office supplies and software licenses</li>
          <li>Ergonomic equipment (with approval)</li>
        </ul>
        
        <h3>Internet and Phone Reimbursement</h3>
        <p>Employees may be eligible for reimbursement of business-related internet and phone expenses up to $100 per month with proper documentation.</p>
      `
    },
    {
      id: "security",
      title: "Security and Data Protection",
      description: "Information security requirements for remote work",
      content: `
        <h3>Data Security</h3>
        <p>Remote employees must:</p>
        <ul>
          <li>Use company-approved VPN for all work activities</li>
          <li>Secure all devices with strong passwords</li>
          <li>Enable automatic software updates</li>
          <li>Use only company-approved cloud services</li>
          <li>Never store company data on personal devices</li>
        </ul>
        
        <h3>Physical Security</h3>
        <p>Remote employees must:</p>
        <ul>
          <li>Lock screens when away from workspace</li>
          <li>Secure physical documents and equipment</li>
          <li>Prevent unauthorized access to work materials</li>
          <li>Use privacy screens when working in public</li>
          <li>Report lost or stolen equipment immediately</li>
        </ul>
        
        <h3>Network Security</h3>
        <p>Remote employees must:</p>
        <ul>
          <li>Use secure, password-protected WiFi networks</li>
          <li>Avoid public WiFi for sensitive work</li>
          <li>Keep home networks secure with strong passwords</li>
          <li>Use company-approved security software</li>
          <li>Report security incidents immediately</li>
        </ul>
        
        <h3>Confidentiality</h3>
        <p>Remote employees must maintain the same level of confidentiality as office employees and ensure that sensitive information is not visible or audible to others in their home environment.</p>
      `
    },
    {
      id: "communication",
      title: "Communication Guidelines",
      description: "Best practices for remote communication and collaboration",
      content: `
        <h3>Video Conferencing</h3>
        <p>When participating in video calls:</p>
        <ul>
          <li>Use professional background or virtual background</li>
          <li>Ensure good lighting and audio quality</li>
          <li>Mute when not speaking to reduce background noise</li>
          <li>Dress appropriately for business meetings</li>
          <li>Test technology before important meetings</li>
        </ul>
        
        <h3>Email and Messaging</h3>
        <p>Remote employees should:</p>
        <ul>
          <li>Use clear, professional subject lines</li>
          <li>Respond promptly to urgent messages</li>
          <li>Use appropriate communication channels</li>
          <li>Include context and action items in messages</li>
          <li>Confirm receipt of important communications</li>
        </ul>
        
        <h3>Collaboration Tools</h3>
        <p>Employees must be proficient in:</p>
        <ul>
          <li>Company messaging platforms (Slack, Teams)</li>
          <li>Project management tools</li>
          <li>Document sharing and collaboration platforms</li>
          <li>Video conferencing software</li>
          <li>File storage and backup systems</li>
        </ul>
        
        <h3>Meeting Participation</h3>
        <p>Remote employees should:</p>
        <ul>
          <li>Join meetings on time</li>
          <li>Participate actively in discussions</li>
          <li>Share screens when presenting</li>
          <li>Follow meeting agendas and protocols</li>
          <li>Provide feedback and input as appropriate</li>
        </ul>
      `
    },
    {
      id: "management",
      title: "Management and Supervision",
      description: "Guidelines for managing remote employees",
      content: `
        <h3>Manager Responsibilities</h3>
        <p>Managers of remote employees must:</p>
        <ul>
          <li>Set clear expectations and goals</li>
          <li>Provide regular feedback and support</li>
          <li>Schedule regular check-in meetings</li>
          <li>Ensure access to necessary resources</li>
          <li>Address performance issues promptly</li>
        </ul>
        
        <h3>Performance Monitoring</h3>
        <p>Performance evaluation for remote employees focuses on:</p>
        <ul>
          <li>Quality and timeliness of deliverables</li>
          <li>Communication and responsiveness</li>
          <li>Collaboration and teamwork</li>
          <li>Goal achievement and results</li>
          <li>Professional development and growth</li>
        </ul>
        
        <h3>Regular Check-ins</h3>
        <p>Managers should schedule:</p>
        <ul>
          <li>Daily stand-up meetings (if applicable)</li>
          <li>Weekly one-on-one meetings</li>
          <li>Monthly team meetings</li>
          <li>Quarterly performance reviews</li>
          <li>Annual goal-setting sessions</li>
        </ul>
        
        <h3>Support and Development</h3>
        <p>Managers should provide:</p>
        <ul>
          <li>Clear direction and guidance</li>
          <li>Access to training and development</li>
          <li>Career advancement opportunities</li>
          <li>Recognition and feedback</li>
          <li>Support for work-life balance</li>
        </ul>
      `
    },
    {
      id: "termination",
      title: "Policy Violations and Termination",
      description: "Consequences of policy violations and termination procedures",
      content: `
        <h3>Policy Violations</h3>
        <p>Violations of this remote work policy may include:</p>
        <ul>
          <li>Unauthorized use of company equipment</li>
          <li>Inadequate workspace or technology setup</li>
          <li>Poor communication or availability</li>
          <li>Security breaches or data mishandling</li>
          <li>Performance issues or missed deadlines</li>
        </ul>
        
        <h3>Corrective Action</h3>
        <p>When violations occur:</p>
        <ol>
          <li>Manager provides verbal warning and guidance</li>
          <li>Written warning if issues persist</li>
          <li>Probationary period with specific improvements</li>
          <li>Possible termination of remote work arrangement</li>
          <li>Return to office-based work if available</li>
        </ol>
        
        <h3>Termination of Remote Work</h3>
        <p>Remote work arrangements may be terminated due to:</p>
        <ul>
          <li>Business needs or restructuring</li>
          <li>Performance or policy violations</li>
          <li>Employee request</li>
          <li>Change in job requirements</li>
          <li>Manager discretion</li>
        </ul>
        
        <h3>Return to Office</h3>
        <p>When remote work is terminated, employees must:</p>
        <ul>
          <li>Return all company equipment within 5 business days</li>
          <li>Return to office-based work if position is available</li>
          <li>Complete transition documentation</li>
          <li>Attend in-person meetings as required</li>
        </ul>
      `
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            <h1 className="text-3xl font-bold text-foreground">Remote Work Policy</h1>
            <p className="text-muted-foreground">Guidelines and procedures for working from home</p>
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
              <div className="p-3 bg-orange-100 rounded-lg">
                <Home className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Remote Work Policy 2024</h3>
                <p className="text-sm text-muted-foreground">Version 1.3 • Last updated January 12, 2024</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Current Version
              </Badge>
              <Badge variant="outline">
                24 pages
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Internet Speed</h4>
                <p className="text-sm text-blue-800">Minimum 25 Mbps</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Work Hours</h4>
                <p className="text-sm text-green-800">9 AM - 6 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-purple-900">VPN Required</h4>
                <p className="text-sm text-purple-800">All work activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle>Table of Contents</CardTitle>
          <CardDescription>Navigate to specific sections of the remote work policy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="p-2 bg-muted rounded-lg">
                  <Home className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">{index + 1}. {section.title}</h4>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Policy Content */}
      {sections.map((section) => (
        <Card key={section.id} id={section.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Home className="h-5 w-5" />
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

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              This remote work policy is effective as of January 12, 2024
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
