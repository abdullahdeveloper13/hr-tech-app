"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Heart, AlertTriangle, Shield, Phone } from "lucide-react"
import Link from "next/link"

export default function HealthSafetyPolicyPage() {
  const sections = [
    {
      id: "overview",
      title: "Health & Safety Overview",
      description: "Our commitment to workplace health and safety",
      content: `
        <h3>Our Commitment</h3>
        <p>The health and safety of our employees is our top priority. We are committed to providing a safe and healthy work environment for all employees, contractors, and visitors.</p>
        
        <h3>Policy Objectives</h3>
        <ul>
          <li>Prevent workplace injuries and illnesses</li>
          <li>Comply with all applicable health and safety regulations</li>
          <li>Promote a culture of safety awareness</li>
          <li>Provide appropriate training and resources</li>
          <li>Continuously improve our safety programs</li>
        </ul>
        
        <h3>Employee Responsibilities</h3>
        <p>All employees are responsible for:</p>
        <ul>
          <li>Following safety procedures and guidelines</li>
          <li>Reporting hazards and unsafe conditions</li>
          <li>Participating in safety training programs</li>
          <li>Using personal protective equipment when required</li>
          <li>Looking out for the safety of colleagues</li>
        </ul>
        
        <h3>Management Responsibilities</h3>
        <p>Management is responsible for:</p>
        <ul>
          <li>Providing safe equipment and work environments</li>
          <li>Implementing safety policies and procedures</li>
          <li>Conducting regular safety inspections</li>
          <li>Investigating accidents and incidents</li>
          <li>Providing ongoing safety training</li>
        </ul>
      `
    },
    {
      id: "emergency-procedures",
      title: "Emergency Procedures",
      description: "What to do in case of workplace emergencies",
      content: `
        <h3>Emergency Contacts</h3>
        <ul>
          <li><strong>Emergency Services:</strong> 911</li>
          <li><strong>Security Office:</strong> (555) 123-4570</li>
          <li><strong>Facilities Management:</strong> (555) 123-4569</li>
          <li><strong>HR Department:</strong> (555) 123-4567</li>
        </ul>
        
        <h3>Fire Emergency</h3>
        <ol>
          <li>Pull the nearest fire alarm</li>
          <li>Evacuate the building immediately using the nearest exit</li>
          <li>Do not use elevators</li>
          <li>Assemble at the designated meeting point</li>
          <li>Report to the safety coordinator for headcount</li>
        </ol>
        
        <h3>Medical Emergency</h3>
        <ol>
          <li>Call 911 immediately</li>
          <li>Notify security and management</li>
          <li>Provide first aid if trained and safe to do so</li>
          <li>Stay with the injured person until help arrives</li>
          <li>Complete incident report form</li>
        </ol>
        
        <h3>Severe Weather</h3>
        <ul>
          <li>Monitor weather alerts and warnings</li>
          <li>Follow instructions from management</li>
          <li>Seek shelter in designated safe areas</li>
          <li>Avoid windows and exterior doors</li>
          <li>Wait for official all-clear before resuming activities</li>
        </ul>
        
        <h3>Power Outage</h3>
        <ul>
          <li>Remain calm and stay in your current location</li>
          <li>Use emergency lighting and flashlights</li>
          <li>Avoid using elevators</li>
          <li>Conserve battery power on electronic devices</li>
          <li>Follow instructions from management</li>
        </ul>
      `
    },
    {
      id: "workplace-hazards",
      title: "Workplace Hazards",
      description: "Common hazards and prevention measures",
      content: `
        <h3>Slips, Trips, and Falls</h3>
        <p><strong>Prevention:</strong></p>
        <ul>
          <li>Keep walkways clear of obstacles</li>
          <li>Clean up spills immediately</li>
          <li>Use appropriate footwear</li>
          <li>Report damaged flooring or carpeting</li>
          <li>Use handrails on stairs</li>
        </ul>
        
        <h3>Ergonomic Hazards</h3>
        <p><strong>Computer Workstations:</strong></p>
        <ul>
          <li>Adjust chair height and backrest</li>
          <li>Position monitor at eye level</li>
          <li>Use ergonomic keyboard and mouse</li>
          <li>Take regular breaks from computer work</li>
          <li>Maintain proper posture</li>
        </ul>
        
        <h3>Chemical Hazards</h3>
        <p><strong>Safety Measures:</strong></p>
        <ul>
          <li>Read and follow Safety Data Sheets (SDS)</li>
          <li>Use appropriate personal protective equipment</li>
          <li>Store chemicals in designated areas</li>
          <li>Never mix unknown chemicals</li>
          <li>Report chemical spills immediately</li>
        </ul>
        
        <h3>Electrical Hazards</h3>
        <p><strong>Prevention:</strong></p>
        <ul>
          <li>Do not overload electrical outlets</li>
          <li>Use equipment with intact cords</li>
          <li>Report electrical problems to facilities</li>
          <li>Never use electrical equipment near water</li>
          <li>Use only authorized electrical equipment</li>
        </ul>
        
        <h3>Noise Hazards</h3>
        <p><strong>Protection:</strong></p>
        <ul>
          <li>Use hearing protection in noisy areas</li>
          <li>Report excessive noise levels</li>
          <li>Limit exposure time in loud environments</li>
          <li>Use noise-canceling headphones when appropriate</li>
        </ul>
      `
    },
    {
      id: "personal-protective-equipment",
      title: "Personal Protective Equipment (PPE)",
      description: "Requirements and use of safety equipment",
      content: `
        <h3>PPE Requirements</h3>
        <p>Personal protective equipment must be worn when:</p>
        <ul>
          <li>Required by safety procedures</li>
          <li>Working in designated hazard areas</li>
          <li>Handling hazardous materials</li>
          <li>Performing maintenance activities</li>
          <li>Entering construction or renovation areas</li>
        </ul>
        
        <h3>Types of PPE</h3>
        <ul>
          <li><strong>Eye Protection:</strong> Safety glasses, goggles, face shields</li>
          <li><strong>Hearing Protection:</strong> Earplugs, earmuffs</li>
          <li><strong>Respiratory Protection:</strong> Dust masks, respirators</li>
          <li><strong>Hand Protection:</strong> Gloves appropriate for the task</li>
          <li><strong>Foot Protection:</strong> Safety shoes, steel-toed boots</li>
          <li><strong>Head Protection:</strong> Hard hats in construction areas</li>
        </ul>
        
        <h3>PPE Care and Maintenance</h3>
        <ul>
          <li>Inspect PPE before each use</li>
          <li>Clean and sanitize reusable equipment</li>
          <li>Replace damaged or worn equipment</li>
          <li>Store PPE in designated areas</li>
          <li>Follow manufacturer's care instructions</li>
        </ul>
        
        <h3>PPE Training</h3>
        <p>All employees must receive training on:</p>
        <ul>
          <li>When PPE is required</li>
          <li>How to properly wear and adjust PPE</li>
          <li>Limitations of PPE</li>
          <li>Care and maintenance procedures</li>
          <li>Replacement schedules</li>
        </ul>
      `
    },
    {
      id: "accident-reporting",
      title: "Accident Reporting and Investigation",
      description: "Procedures for reporting and investigating workplace incidents",
      content: `
        <h3>Incident Reporting</h3>
        <p>All workplace incidents must be reported immediately, including:</p>
        <ul>
          <li>Injuries requiring medical attention</li>
          <li>Near-miss incidents</li>
          <li>Property damage</li>
          <li>Security incidents</li>
          <li>Environmental spills or releases</li>
        </ul>
        
        <h3>Reporting Process</h3>
        <ol>
          <li>Notify supervisor immediately</li>
          <li>Seek medical attention if needed</li>
          <li>Complete incident report form within 24 hours</li>
          <li>Preserve the incident scene if safe to do so</li>
          <li>Cooperate with investigation</li>
        </ol>
        
        <h3>Investigation Procedures</h3>
        <p>All incidents are investigated to:</p>
        <ul>
          <li>Determine root causes</li>
          <li>Identify contributing factors</li>
          <li>Develop corrective actions</li>
          <li>Prevent similar incidents</li>
          <li>Improve safety procedures</li>
        </ul>
        
        <h3>Documentation</h3>
        <p>Incident reports must include:</p>
        <ul>
          <li>Date, time, and location of incident</li>
          <li>Description of what happened</li>
          <li>Names of people involved</li>
          <li>Witness statements</li>
          <li>Photos or diagrams if applicable</li>
          <li>Immediate actions taken</li>
        </ul>
        
        <h3>Corrective Actions</h3>
        <p>Based on investigation findings:</p>
        <ul>
          <li>Implement immediate safety measures</li>
          <li>Update procedures and training</li>
          <li>Provide additional safety equipment</li>
          <li>Conduct follow-up safety inspections</li>
          <li>Monitor effectiveness of changes</li>
        </ul>
      `
    },
    {
      id: "health-wellness",
      title: "Employee Health and Wellness",
      description: "Programs and resources for employee health and wellness",
      content: `
        <h3>Wellness Program</h3>
        <p>We offer various wellness programs including:</p>
        <ul>
          <li>Annual health screenings</li>
          <li>Fitness center membership reimbursement</li>
          <li>Nutrition counseling</li>
          <li>Stress management workshops</li>
          <li>Smoking cessation programs</li>
        </ul>
        
        <h3>Mental Health Support</h3>
        <p>Resources for mental health include:</p>
        <ul>
          <li>Employee Assistance Program (EAP)</li>
          <li>Counseling services</li>
          <li>Mental health awareness training</li>
          <li>Flexible work arrangements</li>
          <li>Stress reduction programs</li>
        </ul>
        
        <h3>Work-Life Balance</h3>
        <p>We support work-life balance through:</p>
        <ul>
          <li>Flexible work schedules</li>
          <li>Remote work options</li>
          <li>Paid time off policies</li>
          <li>Family-friendly benefits</li>
          <li>Employee recognition programs</li>
        </ul>
        
        <h3>Health Screenings</h3>
        <p>Regular health screenings help identify potential health issues early:</p>
        <ul>
          <li>Annual physical examinations</li>
          <li>Vision and hearing tests</li>
          <li>Blood pressure monitoring</li>
          <li>Vaccination programs</li>
          <li>Health risk assessments</li>
        </ul>
        
        <h3>Emergency Medical Information</h3>
        <p>Employees should:</p>
        <ul>
          <li>Keep emergency contact information current</li>
          <li>Inform HR of medical conditions that may require accommodation</li>
          <li>Carry emergency medical information</li>
          <li>Know location of first aid supplies</li>
          <li>Be familiar with emergency procedures</li>
        </ul>
      `
    },
    {
      id: "training",
      title: "Safety Training and Education",
      description: "Required safety training programs for all employees",
      content: `
        <h3>New Employee Orientation</h3>
        <p>All new employees receive safety training covering:</p>
        <ul>
          <li>General safety policies and procedures</li>
          <li>Emergency evacuation procedures</li>
          <li>Location of safety equipment</li>
          <li>Reporting procedures for incidents</li>
          <li>Personal protective equipment requirements</li>
        </ul>
        
        <h3>Ongoing Training</h3>
        <p>Regular training programs include:</p>
        <ul>
          <li>Annual safety refresher training</li>
          <li>Job-specific safety procedures</li>
          <li>Equipment operation training</li>
          <li>Hazard communication training</li>
          <li>Emergency response training</li>
        </ul>
        
        <h3>Specialized Training</h3>
        <p>Additional training for specific roles:</p>
        <ul>
          <li>First aid and CPR certification</li>
          <li>Hazardous materials handling</li>
          <li>Confined space entry procedures</li>
          <li>Lockout/tagout procedures</li>
          <li>Fire safety and prevention</li>
        </ul>
        
        <h3>Training Records</h3>
        <p>All safety training is documented and includes:</p>
        <ul>
          <li>Training topics covered</li>
          <li>Date and duration of training</li>
          <li>Instructor information</li>
          <li>Employee attendance and completion</li>
          <li>Competency assessments</li>
        </ul>
        
        <h3>Training Methods</h3>
        <p>Training is delivered through:</p>
        <ul>
          <li>In-person classroom sessions</li>
          <li>Online learning modules</li>
          <li>Hands-on practical exercises</li>
          <li>Video presentations</li>
          <li>Safety meetings and toolbox talks</li>
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
            <h1 className="text-3xl font-bold text-foreground">Health & Safety Policy</h1>
            <p className="text-muted-foreground">Workplace safety guidelines and health protocols</p>
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
              <div className="p-3 bg-red-100 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Health & Safety Policy 2024</h3>
                <p className="text-sm text-muted-foreground">Version 1.4 • Last updated January 8, 2024</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Current Version
              </Badge>
              <Badge variant="outline">
                22 pages
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-red-900">
            <AlertTriangle className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-600" />
                <span className="font-medium">Emergency Services:</span>
                <span className="text-red-800 font-mono">911</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-600" />
                <span className="font-medium">Security Office:</span>
                <span className="text-red-800">(555) 123-4570</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-600" />
                <span className="font-medium">Facilities:</span>
                <span className="text-red-800">(555) 123-4569</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-600" />
                <span className="font-medium">HR Department:</span>
                <span className="text-red-800">(555) 123-4567</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle>Table of Contents</CardTitle>
          <CardDescription>Navigate to specific sections of the health and safety policy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="p-2 bg-muted rounded-lg">
                  <Heart className="h-4 w-4" />
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
                <Heart className="h-5 w-5" />
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
              This health and safety policy is effective as of January 8, 2024
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
