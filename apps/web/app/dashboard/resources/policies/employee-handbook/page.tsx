"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, BookOpen, Users, Clock, Shield, Heart } from "lucide-react"
import Link from "next/link"

export default function EmployeeHandbookPage() {
  const sections = [
    {
      id: "welcome",
      title: "Welcome to Our Company",
      description: "Introduction and company overview",
      icon: Users,
      content: `
        <h3>Welcome Message</h3>
        <p>Welcome to our company! This handbook is designed to help you understand our policies, procedures, and the many benefits available to you as an employee.</p>
        
        <h3>Our Mission</h3>
        <p>To provide exceptional products and services while fostering a positive work environment for all employees.</p>
        
        <h3>Our Values</h3>
        <ul>
          <li>Integrity and honesty in all our dealings</li>
          <li>Respect for all individuals</li>
          <li>Excellence in everything we do</li>
          <li>Innovation and continuous improvement</li>
          <li>Teamwork and collaboration</li>
        </ul>
      `
    },
    {
      id: "employment",
      title: "Employment Policies",
      description: "Hiring, onboarding, and employment terms",
      icon: Users,
      content: `
        <h3>Equal Opportunity Employment</h3>
        <p>We are committed to providing equal employment opportunities to all qualified individuals without regard to race, color, religion, sex, national origin, age, disability, or any other protected characteristic.</p>
        
        <h3>Employment Categories</h3>
        <ul>
          <li><strong>Full-time:</strong> 40+ hours per week, eligible for all benefits</li>
          <li><strong>Part-time:</strong> Less than 40 hours per week, eligible for some benefits</li>
          <li><strong>Temporary:</strong> Fixed-term employment for specific projects</li>
          <li><strong>Contract:</strong> Independent contractor status</li>
        </ul>
        
        <h3>Probationary Period</h3>
        <p>New employees are subject to a 90-day probationary period during which performance is closely monitored. This period may be extended if necessary.</p>
        
        <h3>Background Checks</h3>
        <p>All offers of employment are contingent upon successful completion of background checks, including criminal history and reference verification.</p>
      `
    },
    {
      id: "workplace",
      title: "Workplace Standards",
      description: "Office policies and work environment guidelines",
      icon: Clock,
      content: `
        <h3>Work Hours</h3>
        <p>Standard work hours are Monday through Friday, 9:00 AM to 6:00 PM, with a one-hour lunch break. Flexible scheduling may be available based on business needs and supervisor approval.</p>
        
        <h3>Attendance and Punctuality</h3>
        <p>Regular attendance and punctuality are essential for business operations. Employees are expected to arrive on time and notify their supervisor as soon as possible if they will be late or absent.</p>
        
        <h3>Dress Code</h3>
        <p>Our dress code is business casual. Employees should dress appropriately for their role and maintain a professional appearance. Specific guidelines may vary by department.</p>
        
        <h3>Workplace Conduct</h3>
        <p>All employees are expected to maintain professional behavior, treat colleagues with respect, and contribute to a positive work environment. Harassment, discrimination, or inappropriate behavior will not be tolerated.</p>
        
        <h3>Use of Company Property</h3>
        <p>Company equipment, including computers, phones, and vehicles, should be used primarily for business purposes. Personal use should be minimal and not interfere with work responsibilities.</p>
      `
    },
    {
      id: "benefits",
      title: "Employee Benefits",
      description: "Health, retirement, and other benefit programs",
      icon: Heart,
      content: `
        <h3>Health Insurance</h3>
        <p>We offer comprehensive health insurance coverage including medical, dental, and vision benefits. Coverage begins on the first day of the month following 30 days of employment.</p>
        
        <h3>Retirement Plan</h3>
        <p>Employees are eligible to participate in our 401(k) plan after 90 days of employment. The company matches employee contributions up to 6% of salary.</p>
        
        <h3>Paid Time Off</h3>
        <ul>
          <li><strong>Vacation:</strong> 15 days per year for new employees, increasing with tenure</li>
          <li><strong>Sick Leave:</strong> 10 days per year for illness or medical appointments</li>
          <li><strong>Personal Days:</strong> 3 days per year for personal matters</li>
          <li><strong>Holidays:</strong> 10 company-observed holidays per year</li>
        </ul>
        
        <h3>Additional Benefits</h3>
        <ul>
          <li>Life insurance coverage equal to annual salary</li>
          <li>Disability insurance for short-term and long-term coverage</li>
          <li>Employee assistance program for counseling and support</li>
          <li>Tuition reimbursement for job-related education</li>
          <li>Wellness program with fitness reimbursements</li>
        </ul>
      `
    },
    {
      id: "safety",
      title: "Safety and Security",
      description: "Workplace safety guidelines and security procedures",
      icon: Shield,
      content: `
        <h3>Workplace Safety</h3>
        <p>The safety and health of our employees is our top priority. All employees are responsible for maintaining a safe work environment and following established safety procedures.</p>
        
        <h3>Emergency Procedures</h3>
        <p>In case of emergency, employees should follow the evacuation procedures posted throughout the building. Emergency contact numbers are displayed near all phones and exits.</p>
        
        <h3>Accident Reporting</h3>
        <p>All workplace accidents, injuries, or near-misses must be reported immediately to a supervisor and documented in the accident report system.</p>
        
        <h3>Security</h3>
        <p>Employees are issued ID badges that must be worn at all times. Visitors must be escorted and signed in at the reception desk.</p>
        
        <h3>Data Security</h3>
        <p>All employees must follow data security protocols, including password protection, secure file handling, and confidentiality of sensitive information.</p>
      `
    },
    {
      id: "disciplinary",
      title: "Disciplinary Procedures",
      description: "Performance management and disciplinary actions",
      icon: Shield,
      content: `
        <h3>Performance Management</h3>
        <p>Regular performance reviews are conducted to provide feedback, set goals, and identify areas for improvement. Reviews are typically conducted annually or as needed.</p>
        
        <h3>Progressive Discipline</h3>
        <p>When performance or conduct issues arise, we follow a progressive discipline process:</p>
        <ol>
          <li><strong>Verbal Warning:</strong> Initial discussion of the issue</li>
          <li><strong>Written Warning:</strong> Formal documentation of the problem</li>
          <li><strong>Final Warning:</strong> Last chance before termination</li>
          <li><strong>Termination:</strong> Separation of employment</li>
        </ol>
        
        <h3>Serious Misconduct</h3>
        <p>Some violations, such as theft, violence, or harassment, may result in immediate termination without prior warnings.</p>
        
        <h3>Appeal Process</h3>
        <p>Employees may appeal disciplinary actions through the HR department within 5 business days of receiving written notice.</p>
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
            <h1 className="text-3xl font-bold text-foreground">Employee Handbook</h1>
            <p className="text-muted-foreground">Complete guide to company policies and procedures</p>
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
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Employee Handbook 2024</h3>
                <p className="text-sm text-muted-foreground">Version 2.1 • Last updated January 15, 2024</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Current Version
              </Badge>
              <Badge variant="outline">
                45 pages
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle>Table of Contents</CardTitle>
          <CardDescription>Navigate to specific sections of the handbook</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="p-2 bg-muted rounded-lg">
                  <section.icon className="h-4 w-4" />
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

      {/* Handbook Content */}
      {sections.map((section) => (
        <Card key={section.id} id={section.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <section.icon className="h-5 w-5" />
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
              This handbook is effective as of January 15, 2024
            </p>
            <p className="text-xs text-muted-foreground">
              For questions about this handbook, please contact HR at hr@company.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
