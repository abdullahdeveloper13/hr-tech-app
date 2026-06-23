"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Shield, Users, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AntiDiscriminationPolicyPage() {
  const sections = [
    {
      id: "policy-statement",
      title: "Policy Statement",
      description: "Our commitment to equal opportunity and non-discrimination",
      content: `
        <h3>Equal Opportunity Commitment</h3>
        <p>We are committed to providing equal employment opportunities to all employees and applicants for employment without regard to race, color, religion, sex, national origin, age, disability, genetic information, veteran status, sexual orientation, gender identity, or any other characteristic protected by applicable federal, state, or local law.</p>
        
        <h3>Scope of Policy</h3>
        <p>This policy applies to all aspects of employment including:</p>
        <ul>
          <li>Recruitment and hiring</li>
          <li>Compensation and benefits</li>
          <li>Training and development</li>
          <li>Promotion and advancement</li>
          <li>Discipline and termination</li>
          <li>Working conditions</li>
          <li>All other terms and conditions of employment</li>
        </ul>
        
        <h3>Legal Compliance</h3>
        <p>This policy complies with all applicable laws including:</p>
        <ul>
          <li>Title VII of the Civil Rights Act of 1964</li>
          <li>Americans with Disabilities Act (ADA)</li>
          <li>Age Discrimination in Employment Act (ADEA)</li>
          <li>Equal Pay Act</li>
          <li>Pregnancy Discrimination Act</li>
          <li>State and local anti-discrimination laws</li>
        </ul>
        
        <h3>Management Responsibility</h3>
        <p>All managers and supervisors are responsible for:</p>
        <ul>
          <li>Ensuring compliance with this policy</li>
          <li>Creating an inclusive work environment</li>
          <li>Addressing discrimination complaints promptly</li>
          <li>Taking appropriate corrective action</li>
          <li>Leading by example</li>
        </ul>
      `
    },
    {
      id: "protected-characteristics",
      title: "Protected Characteristics",
      description: "Characteristics protected from discrimination",
      content: `
        <h3>Federal Protected Classes</h3>
        <p>Discrimination is prohibited based on:</p>
        <ul>
          <li><strong>Race:</strong> Physical characteristics associated with race</li>
          <li><strong>Color:</strong> Skin color or complexion</li>
          <li><strong>Religion:</strong> Religious beliefs, practices, or observances</li>
          <li><strong>Sex:</strong> Gender, including pregnancy and related conditions</li>
          <li><strong>National Origin:</strong> Country of origin or ancestry</li>
          <li><strong>Age:</strong> 40 years of age or older</li>
          <li><strong>Disability:</strong> Physical or mental impairments</li>
          <li><strong>Genetic Information:</strong> Family medical history</li>
          <li><strong>Veteran Status:</strong> Military service history</li>
        </ul>
        
        <h3>Additional Protected Classes</h3>
        <p>We also prohibit discrimination based on:</p>
        <ul>
          <li><strong>Sexual Orientation:</strong> Gay, lesbian, bisexual, heterosexual</li>
          <li><strong>Gender Identity:</strong> Transgender, non-binary, gender non-conforming</li>
          <li><strong>Marital Status:</strong> Single, married, divorced, widowed</li>
          <li><strong>Family Status:</strong> Parental status, caregiver status</li>
          <li><strong>Political Affiliation:</strong> Political beliefs or activities</li>
          <li><strong>Citizenship Status:</strong> Immigration status</li>
        </ul>
        
        <h3>Examples of Discrimination</h3>
        <p>Discrimination can take many forms including:</p>
        <ul>
          <li>Refusing to hire qualified applicants</li>
          <li>Paying different wages for similar work</li>
          <li>Denying promotions or advancement opportunities</li>
          <li>Providing different benefits or working conditions</li>
          <li>Using derogatory language or slurs</li>
          <li>Creating hostile work environments</li>
          <li>Retaliating against those who report discrimination</li>
        </ul>
        
        <h3>Reasonable Accommodations</h3>
        <p>We provide reasonable accommodations for:</p>
        <ul>
          <li>Religious practices and observances</li>
          <li>Disabilities and medical conditions</li>
          <li>Pregnancy and related conditions</li>
          <li>Breastfeeding mothers</li>
        </ul>
      `
    },
    {
      id: "harassment-prevention",
      title: "Harassment Prevention",
      description: "Zero tolerance policy for workplace harassment",
      content: `
        <h3>Definition of Harassment</h3>
        <p>Harassment is unwelcome conduct based on protected characteristics that:</p>
        <ul>
          <li>Creates an intimidating, hostile, or offensive work environment</li>
          <li>Interferes with work performance</li>
          <li>Affects employment opportunities</li>
          <li>Is severe or pervasive enough to alter working conditions</li>
        </ul>
        
        <h3>Types of Harassment</h3>
        <p><strong>Sexual Harassment:</strong></p>
        <ul>
          <li>Unwelcome sexual advances</li>
          <li>Requests for sexual favors</li>
          <li>Sexual jokes, comments, or gestures</li>
          <li>Display of sexual materials</li>
          <li>Physical contact of a sexual nature</li>
        </ul>
        
        <p><strong>Other Forms of Harassment:</strong></p>
        <ul>
          <li>Racial slurs or derogatory comments</li>
          <li>Religious discrimination or mockery</li>
          <li>Age-related jokes or comments</li>
          <li>Disability-related harassment</li>
          <li>Bullying or intimidation</li>
        </ul>
        
        <h3>Prohibited Conduct</h3>
        <p>The following behaviors are strictly prohibited:</p>
        <ul>
          <li>Verbal harassment including slurs, jokes, or derogatory comments</li>
          <li>Physical harassment including unwanted touching or assault</li>
          <li>Visual harassment including offensive images or materials</li>
          <li>Cyber harassment through email, social media, or other electronic means</li>
          <li>Third-party harassment from customers, vendors, or contractors</li>
        </ul>
        
        <h3>Prevention Measures</h3>
        <p>We prevent harassment through:</p>
        <ul>
          <li>Regular training and education programs</li>
          <li>Clear policies and procedures</li>
          <li>Prompt investigation of complaints</li>
          <li>Appropriate disciplinary action</li>
          <li>Regular policy reviews and updates</li>
        </ul>
      `
    },
    {
      id: "reporting-procedures",
      title: "Reporting Procedures",
      description: "How to report discrimination and harassment",
      content: `
        <h3>Who Can Report</h3>
        <p>The following individuals can report discrimination or harassment:</p>
        <ul>
          <li>Employees who experience discrimination or harassment</li>
          <li>Employees who witness discrimination or harassment</li>
          <li>Third parties who observe inappropriate conduct</li>
          <li>Former employees with relevant information</li>
        </ul>
        
        <h3>Reporting Channels</h3>
        <p>Reports can be made through multiple channels:</p>
        <ul>
          <li><strong>Direct Supervisor:</strong> Report to your immediate supervisor</li>
          <li><strong>HR Department:</strong> Contact HR directly</li>
          <li><strong>Senior Management:</strong> Report to department heads or executives</li>
          <li><strong>Anonymous Hotline:</strong> Call 1-800-ETHICS-1</li>
          <li><strong>Online Portal:</strong> Submit reports through ethics.company.com</li>
          <li><strong>Email:</strong> Send reports to ethics@company.com</li>
        </ul>
        
        <h3>What to Report</h3>
        <p>Include the following information in your report:</p>
        <ul>
          <li>Date, time, and location of incident(s)</li>
          <li>Names of people involved</li>
          <li>Description of what happened</li>
          <li>Names of witnesses</li>
          <li>Any supporting documentation</li>
          <li>Impact on your work or well-being</li>
        </ul>
        
        <h3>Investigation Process</h3>
        <p>All reports are investigated promptly and thoroughly:</p>
        <ol>
          <li>Report is received and acknowledged within 24 hours</li>
          <li>Preliminary assessment is conducted</li>
          <li>Investigation is launched if warranted</li>
          <li>All parties are interviewed</li>
          <li>Evidence is collected and analyzed</li>
          <li>Conclusions are reached and documented</li>
          <li>Appropriate action is taken</li>
          <li>Complainant is notified of outcome</li>
        </ol>
        
        <h3>Confidentiality</h3>
        <p>We maintain confidentiality to the extent possible while conducting a thorough investigation. Information is shared only with those who need to know.</p>
      `
    },
    {
      id: "retaliation-protection",
      title: "Retaliation Protection",
      description: "Protection against retaliation for reporting discrimination",
      content: `
        <h3>No Retaliation Policy</h3>
        <p>We strictly prohibit retaliation against anyone who:</p>
        <ul>
          <li>Reports discrimination or harassment</li>
          <li>Participates in an investigation</li>
          <li>Opposes discriminatory practices</li>
          <li>Assists others in reporting violations</li>
          <li>Exercises their rights under anti-discrimination laws</li>
        </ul>
        
        <h3>Forms of Retaliation</h3>
        <p>Retaliation can include:</p>
        <ul>
          <li>Termination or demotion</li>
          <li>Denial of promotions or raises</li>
          <li>Negative performance evaluations</li>
          <li>Transfer to less desirable positions</li>
          <li>Exclusion from meetings or activities</li>
          <li>Increased scrutiny or micromanagement</li>
          <li>Hostile treatment or behavior</li>
          <li>Threats or intimidation</li>
        </ul>
        
        <h3>Protection Measures</h3>
        <p>We protect against retaliation by:</p>
        <ul>
          <li>Monitoring work environments after complaints</li>
          <li>Providing regular check-ins with complainants</li>
          <li>Ensuring fair treatment of all parties</li>
          <li>Taking immediate action against retaliatory behavior</li>
          <li>Training managers on retaliation prevention</li>
        </ul>
        
        <h3>Reporting Retaliation</h3>
        <p>If you experience retaliation:</p>
        <ul>
          <li>Report it immediately using the same channels</li>
          <li>Document all incidents with dates and details</li>
          <li>Keep copies of all communications</li>
          <li>Contact HR or legal department if needed</li>
          <li>Consider external reporting options</li>
        </ul>
        
        <h3>Consequences of Retaliation</h3>
        <p>Retaliation is a serious violation that may result in:</p>
        <ul>
          <li>Disciplinary action up to and including termination</li>
          <li>Legal action against the company</li>
          <li>Personal liability for individuals involved</li>
          <li>Damage to company reputation</li>
        </ul>
      `
    },
    {
      id: "accommodations",
      title: "Reasonable Accommodations",
      description: "Process for requesting workplace accommodations",
      content: `
        <h3>What Are Reasonable Accommodations</h3>
        <p>Reasonable accommodations are modifications or adjustments that enable qualified individuals with disabilities or religious needs to perform their job duties effectively.</p>
        
        <h3>Types of Accommodations</h3>
        <p><strong>Disability Accommodations:</strong></p>
        <ul>
          <li>Modifications to work schedules</li>
          <li>Changes to work environment</li>
          <li>Assistive technology or equipment</li>
          <li>Job restructuring or reassignment</li>
          <li>Modification of policies or procedures</li>
        </ul>
        
        <p><strong>Religious Accommodations:</strong></p>
        <ul>
          <li>Schedule changes for religious observances</li>
          <li>Dress code modifications</li>
          <li>Prayer or meditation breaks</li>
          <li>Dietary accommodations</li>
          <li>Holiday scheduling adjustments</li>
        </ul>
        
        <h3>Request Process</h3>
        <p>To request an accommodation:</p>
        <ol>
          <li>Submit request in writing to HR</li>
          <li>Provide documentation if required</li>
          <li>Participate in interactive process</li>
          <li>Cooperate with assessment process</li>
          <li>Implement approved accommodations</li>
        </ol>
        
        <h3>Documentation Requirements</h3>
        <p>Documentation may be required for:</p>
        <ul>
          <li>Medical conditions and limitations</li>
          <li>Religious practices and requirements</li>
          <li>Functional limitations and needs</li>
          <li>Alternative accommodation options</li>
        </ul>
        
        <h3>Interactive Process</h3>
        <p>We engage in an interactive process to:</p>
        <ul>
          <li>Understand the specific needs</li>
          <li>Explore accommodation options</li>
          <li>Assess feasibility and effectiveness</li>
          <li>Consider alternative solutions</li>
          <li>Implement the best accommodation</li>
        </ul>
        
        <h3>Undue Hardship</h3>
        <p>Accommodations that create undue hardship may be denied if they:</p>
        <ul>
          <li>Require significant expense</li>
          <li>Disrupt business operations</li>
          <li>Compromise workplace safety</li>
          <li>Fundamentally alter job requirements</li>
          <li>Create significant difficulty</li>
        </ul>
      `
    },
    {
      id: "training-education",
      title: "Training and Education",
      description: "Anti-discrimination training programs for all employees",
      content: `
        <h3>Mandatory Training</h3>
        <p>All employees must complete anti-discrimination training including:</p>
        <ul>
          <li>New employee orientation</li>
          <li>Annual refresher training</li>
          <li>Supervisor-specific training</li>
          <li>Updated training when policies change</li>
        </ul>
        
        <h3>Training Topics</h3>
        <p>Training covers the following topics:</p>
        <ul>
          <li>Anti-discrimination laws and regulations</li>
          <li>Company policies and procedures</li>
          <li>Types of discrimination and harassment</li>
          <li>Reporting procedures and resources</li>
          <li>Investigation and resolution processes</li>
          <li>Retaliation prevention</li>
          <li>Reasonable accommodation processes</li>
          <li>Bystander intervention techniques</li>
        </ul>
        
        <h3>Management Training</h3>
        <p>Managers receive additional training on:</p>
        <ul>
          <li>Legal obligations and responsibilities</li>
          <li>How to recognize and prevent discrimination</li>
          <li>Proper handling of complaints</li>
          <li>Investigation techniques</li>
          <li>Disciplinary actions and consequences</li>
          <li>Creating inclusive work environments</li>
        </ul>
        
        <h3>Training Methods</h3>
        <p>Training is delivered through:</p>
        <ul>
          <li>In-person workshops and seminars</li>
          <li>Online learning modules</li>
          <li>Video presentations and case studies</li>
          <li>Interactive scenarios and role-playing</li>
          <li>Regular communications and updates</li>
        </ul>
        
        <h3>Training Records</h3>
        <p>We maintain records of all training including:</p>
        <ul>
          <li>Employee attendance and completion</li>
          <li>Training content and materials</li>
          <li>Assessment scores and competency</li>
          <li>Feedback and evaluations</li>
          <li>Follow-up training needs</li>
        </ul>
        
        <h3>Continuous Education</h3>
        <p>We provide ongoing education through:</p>
        <ul>
          <li>Regular policy updates and communications</li>
          <li>Best practices sharing</li>
          <li>Industry updates and legal changes</li>
          <li>Employee feedback and suggestions</li>
          <li>External training opportunities</li>
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
            <h1 className="text-3xl font-bold text-foreground">Anti-Discrimination & Harassment Policy</h1>
            <p className="text-muted-foreground">Equal opportunity employment and workplace harassment prevention</p>
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
                <h3 className="font-semibold text-lg">Anti-Discrimination Policy 2024</h3>
                <p className="text-sm text-muted-foreground">Version 1.1 • Last updated January 5, 2024</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Current Version
              </Badge>
              <Badge variant="outline">
                26 pages
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-900">Report Discrimination</h4>
                <p className="text-sm text-red-800">Ethics Hotline: 1-800-ETHICS-1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Zero Tolerance</h4>
                <p className="text-sm text-green-800">No retaliation policy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle>Table of Contents</CardTitle>
          <CardDescription>Navigate to specific sections of the anti-discrimination policy</CardDescription>
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

      {/* Policy Content */}
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
              This anti-discrimination policy is effective as of January 5, 2024
            </p>
            <p className="text-xs text-muted-foreground">
              For questions about this policy, please contact HR at hr@company.com or call the ethics hotline at 1-800-ETHICS-1
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
