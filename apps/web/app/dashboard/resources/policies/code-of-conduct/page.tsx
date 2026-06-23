"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Shield, Users, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CodeOfConductPage() {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      description: "Purpose and scope of our code of conduct",
      content: `
        <h3>Our Commitment</h3>
        <p>This Code of Conduct outlines the standards of behavior expected from all employees, contractors, and representatives of our company. It reflects our commitment to maintaining the highest ethical standards in all our business activities.</p>
        
        <h3>Scope</h3>
        <p>This code applies to all employees regardless of position, level, or location. It covers interactions with colleagues, customers, suppliers, and the broader community.</p>
        
        <h3>Living Our Values</h3>
        <p>Our code of conduct is not just a document—it's a reflection of our values and a guide for how we conduct business every day. We expect all employees to embody these principles in their daily work.</p>
      `
    },
    {
      id: "ethical-principles",
      title: "Ethical Principles",
      description: "Core ethical standards for all employees",
      content: `
        <h3>Integrity</h3>
        <p>We conduct all business activities with honesty, transparency, and fairness. We do not compromise our integrity for any reason, regardless of the potential benefit to the company or ourselves.</p>
        
        <h3>Respect</h3>
        <p>We treat all individuals with dignity and respect, regardless of their position, background, or personal characteristics. We value diversity and inclusion in all aspects of our business.</p>
        
        <h3>Accountability</h3>
        <p>We take responsibility for our actions and decisions. We acknowledge mistakes, learn from them, and work to correct any issues that arise from our actions.</p>
        
        <h3>Excellence</h3>
        <p>We strive for excellence in everything we do, continuously improving our performance and delivering the highest quality products and services to our customers.</p>
        
        <h3>Innovation</h3>
        <p>We encourage creativity and innovation while maintaining ethical standards. We support new ideas and approaches that benefit our company and stakeholders.</p>
      `
    },
    {
      id: "workplace-conduct",
      title: "Workplace Conduct",
      description: "Standards for professional behavior at work",
      content: `
        <h3>Professional Behavior</h3>
        <p>All employees are expected to maintain professional behavior in the workplace. This includes:</p>
        <ul>
          <li>Treating colleagues, customers, and visitors with courtesy and respect</li>
          <li>Maintaining appropriate language and communication</li>
          <li>Dressing appropriately for the work environment</li>
          <li>Being punctual and reliable in attendance</li>
          <li>Following company policies and procedures</li>
        </ul>
        
        <h3>Teamwork and Collaboration</h3>
        <p>We value teamwork and encourage employees to:</p>
        <ul>
          <li>Work collaboratively with colleagues across departments</li>
          <li>Share knowledge and expertise to help others succeed</li>
          <li>Support team decisions and work toward common goals</li>
          <li>Communicate openly and constructively</li>
        </ul>
        
        <h3>Conflict Resolution</h3>
        <p>When conflicts arise, employees should:</p>
        <ul>
          <li>Address issues directly and professionally</li>
          <li>Seek resolution through appropriate channels</li>
          <li>Avoid gossip or negative discussions about colleagues</li>
          <li>Involve supervisors or HR when necessary</li>
        </ul>
      `
    },
    {
      id: "harassment-discrimination",
      title: "Anti-Harassment and Anti-Discrimination",
      description: "Zero tolerance policy for harassment and discrimination",
      content: `
        <h3>Zero Tolerance Policy</h3>
        <p>We maintain a zero-tolerance policy for harassment, discrimination, and retaliation. All employees have the right to work in an environment free from such behavior.</p>
        
        <h3>Prohibited Conduct</h3>
        <p>The following behaviors are strictly prohibited:</p>
        <ul>
          <li><strong>Harassment:</strong> Unwelcome conduct based on protected characteristics</li>
          <li><strong>Discrimination:</strong> Treating someone unfavorably due to protected characteristics</li>
          <li><strong>Bullying:</strong> Intimidating, threatening, or humiliating behavior</li>
          <li><strong>Retaliation:</strong> Punishing someone for reporting misconduct</li>
          <li><strong>Inappropriate Relationships:</strong> Romantic relationships between supervisors and subordinates</li>
        </ul>
        
        <h3>Protected Characteristics</h3>
        <p>We prohibit discrimination based on:</p>
        <ul>
          <li>Race, color, or ethnicity</li>
          <li>Religion or creed</li>
          <li>Sex, gender identity, or sexual orientation</li>
          <li>Age (40 and over)</li>
          <li>National origin or ancestry</li>
          <li>Disability or medical condition</li>
          <li>Marital or family status</li>
          <li>Veteran status</li>
        </ul>
        
        <h3>Reporting Procedures</h3>
        <p>If you experience or witness harassment or discrimination:</p>
        <ol>
          <li>Report the incident immediately to your supervisor, HR, or through our anonymous reporting system</li>
          <li>Document the incident with dates, times, and details</li>
          <li>Cooperate with any investigation</li>
          <li>Know that retaliation is prohibited and will be addressed</li>
        </ol>
      `
    },
    {
      id: "conflicts-interest",
      title: "Conflicts of Interest",
      description: "Guidelines for managing potential conflicts of interest",
      content: `
        <h3>Definition</h3>
        <p>A conflict of interest occurs when an employee's personal interests interfere with their ability to make objective business decisions in the best interest of the company.</p>
        
        <h3>Common Conflicts</h3>
        <p>Examples of potential conflicts include:</p>
        <ul>
          <li>Having a financial interest in a competitor, supplier, or customer</li>
          <li>Accepting gifts or favors from business partners</li>
          <li>Using company information for personal gain</li>
          <li>Hiring family members or close friends</li>
          <li>Engaging in outside business activities that compete with the company</li>
        </ul>
        
        <h3>Disclosure Requirements</h3>
        <p>Employees must:</p>
        <ul>
          <li>Disclose any potential conflicts of interest to their supervisor or HR</li>
          <li>Seek approval before engaging in outside business activities</li>
          <li>Recuse themselves from decisions involving potential conflicts</li>
          <li>Update disclosures when circumstances change</li>
        </ul>
        
        <h3>Gifts and Entertainment</h3>
        <p>Guidelines for accepting gifts and entertainment:</p>
        <ul>
          <li>Modest gifts (under $50) may be accepted with supervisor approval</li>
          <li>Meals and entertainment should be reasonable and business-related</li>
          <li>Never accept gifts that could influence business decisions</li>
          <li>When in doubt, consult with your supervisor or HR</li>
        </ul>
      `
    },
    {
      id: "confidentiality",
      title: "Confidentiality and Privacy",
      description: "Protecting company and customer information",
      content: `
        <h3>Confidential Information</h3>
        <p>Employees may have access to confidential information including:</p>
        <ul>
          <li>Business strategies and plans</li>
          <li>Financial information</li>
          <li>Customer data and personal information</li>
          <li>Proprietary technology and processes</li>
          <li>Employee personal information</li>
        </ul>
        
        <h3>Protection Requirements</h3>
        <p>All employees must:</p>
        <ul>
          <li>Keep confidential information secure and private</li>
          <li>Use information only for legitimate business purposes</li>
          <li>Not share information with unauthorized persons</li>
          <li>Return or destroy confidential materials when leaving the company</li>
          <li>Follow data security protocols and password requirements</li>
        </ul>
        
        <h3>Privacy Rights</h3>
        <p>We respect employee privacy and:</p>
        <ul>
          <li>Collect only necessary personal information</li>
          <li>Use information only for legitimate business purposes</li>
          <li>Maintain secure storage and transmission of personal data</li>
          <li>Provide access to personal information upon request</li>
          <li>Comply with all applicable privacy laws and regulations</li>
        </ul>
      `
    },
    {
      id: "compliance",
      title: "Legal Compliance",
      description: "Following all applicable laws and regulations",
      content: `
        <h3>Compliance Obligations</h3>
        <p>All employees must comply with:</p>
        <ul>
          <li>All applicable federal, state, and local laws</li>
          <li>Industry-specific regulations and standards</li>
          <li>Company policies and procedures</li>
          <li>Professional standards and ethics codes</li>
        </ul>
        
        <h3>Reporting Violations</h3>
        <p>If you become aware of a legal violation:</p>
        <ul>
          <li>Report it immediately to your supervisor, HR, or legal department</li>
          <li>Do not attempt to investigate or resolve on your own</li>
          <li>Cooperate fully with any investigation</li>
          <li>Maintain confidentiality during the investigation</li>
        </ul>
        
        <h3>Anti-Corruption</h3>
        <p>We prohibit:</p>
        <ul>
          <li>Bribery or kickbacks</li>
          <li>Improper payments to government officials</li>
          <li>Falsifying records or documents</li>
          <li>Engaging in money laundering</li>
          <li>Violating trade sanctions or export controls</li>
        </ul>
      `
    },
    {
      id: "violations",
      title: "Violations and Enforcement",
      description: "Consequences of code violations and reporting procedures",
      content: `
        <h3>Consequences</h3>
        <p>Violations of this code may result in:</p>
        <ul>
          <li>Counseling or retraining</li>
          <li>Written warnings</li>
          <li>Suspension without pay</li>
          <li>Demotion or transfer</li>
          <li>Termination of employment</li>
          <li>Legal action when appropriate</li>
        </ul>
        
        <h3>Investigation Process</h3>
        <p>When violations are reported:</p>
        <ol>
          <li>We conduct a thorough and impartial investigation</li>
          <li>All parties are treated fairly and with respect</li>
          <li>Information is kept confidential to the extent possible</li>
          <li>Appropriate corrective action is taken</li>
          <li>Retaliation against reporters is strictly prohibited</li>
        </ol>
        
        <h3>Anonymous Reporting</h3>
        <p>Employees can report violations anonymously through:</p>
        <ul>
          <li>Our ethics hotline: 1-800-ETHICS-1</li>
          <li>Online reporting system at ethics.company.com</li>
          <li>Email to ethics@company.com</li>
          <li>Direct contact with HR or legal department</li>
        </ul>
        
        <h3>Non-Retaliation</h3>
        <p>We strictly prohibit retaliation against employees who report violations in good faith. Any employee who engages in retaliation will be subject to disciplinary action up to and including termination.</p>
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
            <h1 className="text-3xl font-bold text-foreground">Code of Conduct</h1>
            <p className="text-muted-foreground">Professional behavior standards and ethical guidelines</p>
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
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Code of Conduct 2024</h3>
                <p className="text-sm text-muted-foreground">Version 1.2 • Last updated January 10, 2024</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Current Version
              </Badge>
              <Badge variant="outline">
                28 pages
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Report Concerns</h4>
                <p className="text-sm text-green-800">Ethics Hotline: 1-800-ETHICS-1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Need Help?</h4>
                <p className="text-sm text-blue-800">Contact HR: hr@company.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle>Table of Contents</CardTitle>
          <CardDescription>Navigate to specific sections of the code of conduct</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="p-2 bg-muted rounded-lg">
                  <Shield className="h-4 w-4" />
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

      {/* Code Content */}
      {sections.map((section) => (
        <Card key={section.id} id={section.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Shield className="h-5 w-5" />
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
              This code of conduct is effective as of January 10, 2024
            </p>
            <p className="text-xs text-muted-foreground">
              For questions about this code, please contact HR at hr@company.com or call the ethics hotline at 1-800-ETHICS-1
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
