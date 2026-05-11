"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useSession } from "next-auth/react"
import { 
  Mail, 
  User, 
  Building2, 
  Calendar, 
  DollarSign, 
  Users, 
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Phone
} from "lucide-react"
import { toast } from "sonner"

export default function OfferLetterPage() {
  const { data: session } = useSession()
  const user = session?.user
  const [formData, setFormData] = useState({
    candidateEmail: "",
    candidateName: "",
    position: "",
    department: "",
    startDate: "",
    salary: "",
    reportingManager: "",
    offerLetterContent: `We are pleased to offer you the position of [Position] in our [Department] department at [Company Name]. After careful consideration of your qualifications and experience, we believe you will be a valuable addition to our team.

Your employment will commence on [Start Date], and we are confident that your skills and expertise will contribute significantly to our organization's continued success.

We look forward to welcoming you to our team and working together to achieve our common goals.`,
    companyName: "Zero To One",
    companyAddress: "3rd Floor, RJ Mall, Rashid Minhas Road, Karachi, Pakistan",
    hrEmail: "infohr@tech-021.com",
    hrPhone: "+92335-2204608"
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState<any>(null)

  // Check if user has admin/HR access
  useEffect(() => {
    if (user && !["ADMIN", "HR"].includes(user.role)) {
      setError("Access denied. Only administrators and HR personnel can send offer letters.")
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/offer-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send offer letter")
      }

      setSuccess(true)
      toast.success("Offer letter sent successfully!", {
        description: `Offer letter with HR Handbook attached has been sent to ${data.candidateName} at ${data.candidateEmail}`,
      })

      // Reset form after successful submission
      setFormData(prev => ({
        ...prev,
        candidateEmail: "",
        candidateName: "",
        position: "",
        department: "",
        startDate: "",
        salary: "",
        reportingManager: "",
        // Keep company name as it's likely to be reused
      }))

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast.error("Failed to send offer letter", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const testEmailConfiguration = async () => {
    setTestingEmail(true)
    setTestEmailResult(null)
    setError("")

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testEmail: formData.candidateEmail || "test@example.com"
        }),
      })

      const data = await response.json()
      setTestEmailResult(data)

      if (response.ok) {
        toast.success("Email test successful!", {
          description: "SMTP configuration is working correctly.",
        })
      } else {
        toast.error("Email test failed", {
          description: data.error || "Please check your SMTP configuration.",
        })
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setTestEmailResult({ error: errorMessage })
      toast.error("Email test failed", {
        description: errorMessage,
      })
    } finally {
      setTestingEmail(false)
    }
  }

  const getPreviewContent = () => {
    const { candidateName, position, department, startDate, salary, reportingManager, offerLetterContent, companyName } = formData
    
    return offerLetterContent
      .replace(/\[Position\]/g, position || '[Position]')
      .replace(/\[Department\]/g, department || '[Department]')
      .replace(/\[Company Name\]/g, companyName || '[Company Name]')
      .replace(/\[Start Date\]/g, startDate ? new Date(startDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : '[Start Date]')
  }

  if (!user || !["ADMIN", "HR"].includes(user.role)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only administrators and HR personnel can access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Send Offer Letter</h1>
        <p className="text-gray-600 dark:text-gray-400">Send professional offer letters to new employees</p>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Offer letter sent successfully! The candidate has been notified via email with the HR Handbook attached. They will be asked to confirm acceptance and acknowledgment of the handbook.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Candidate Information
              </CardTitle>
              <CardDescription>Enter the candidate's details for the offer letter</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidateName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Candidate Name *
                    </Label>
                    <Input
                      id="candidateName"
                      value={formData.candidateName}
                      onChange={(e) => handleInputChange("candidateName", e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="candidateEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="candidateEmail"
                      type="email"
                      value={formData.candidateEmail}
                      onChange={(e) => handleInputChange("candidateEmail", e.target.value)}
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Position *
                    </Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      placeholder="Software Engineer"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Department *
                    </Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date *
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Salary (Optional)
                    </Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => handleInputChange("salary", e.target.value)}
                      placeholder="75000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportingManager" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Reporting Manager (Optional)
                  </Label>
                  <Input
                    id="reportingManager"
                    value={formData.reportingManager}
                    onChange={(e) => handleInputChange("reportingManager", e.target.value)}
                    placeholder="Jane Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Zero To One"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hrEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      HR Email *
                    </Label>
                    <Input
                      id="hrEmail"
                      type="email"
                      value={formData.hrEmail}
                      onChange={(e) => handleInputChange("hrEmail", e.target.value)}
                      placeholder="infohr@tech-021.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hrPhone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      HR Phone *
                    </Label>
                    <Input
                      id="hrPhone"
                      value={formData.hrPhone}
                      onChange={(e) => handleInputChange("hrPhone", e.target.value)}
                      placeholder="+92335-2204608"
                      required
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="offerLetterContent" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Offer Letter Content *
                  </Label>
                  <Textarea
                    id="offerLetterContent"
                    value={formData.offerLetterContent}
                    onChange={(e) => handleInputChange("offerLetterContent", e.target.value)}
                    placeholder="Enter the offer letter content..."
                    rows={8}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    You can use placeholders like [Position], [Department], [Company Name], [Start Date] in your content.
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showPreview" className="text-sm font-medium">
                      Preview Offer Letter
                    </Label>
                    <Switch
                      id="showPreview"
                      checked={showPreview}
                      onCheckedChange={setShowPreview}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="text-sm font-medium">Email Configuration Test</div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testEmailConfiguration}
                    disabled={testingEmail}
                    className="w-full"
                  >
                    {testingEmail ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing Email Configuration...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Test Email Configuration
                      </>
                    )}
                  </Button>
                  
                  {testEmailResult && (
                    <div className={`p-3 rounded-lg text-sm ${
                      testEmailResult.status === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <div className="font-medium mb-2">
                        {testEmailResult.status === 'success' ? '✓ Test Successful' : '✗ Test Failed'}
                      </div>
                      {testEmailResult.message && (
                        <div className="mb-2">{testEmailResult.message}</div>
                      )}
                      {testEmailResult.connectionStatus && (
                        <div className="mb-2">
                          <strong>Connection:</strong> {testEmailResult.connectionStatus}
                        </div>
                      )}
                      {testEmailResult.error && (
                        <div>
                          <strong>Error:</strong> {testEmailResult.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Offer Letter...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Offer Letter
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Offer Letter Preview
                </CardTitle>
                <CardDescription>Preview of the offer letter that will be sent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-gray-50 max-h-96 overflow-y-auto">
                  <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <img 
                      src="/021-logo.png" 
                      alt="Company Logo" 
                      className="mx-auto mb-4 max-w-32 h-auto"
                    />
                    <div className="text-2xl font-bold text-black">
                      {formData.companyName || "Your Company"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formData.companyAddress || "Company Address"}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-600 mb-4">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-lg">
                      Dear {formData.candidateName || "[Candidate Name]"},
                    </div>
                    
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {getPreviewContent()}
                    </div>
                    
                    {formData.position && (
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="space-y-2 text-sm">
                          <div><strong>Position:</strong> {formData.position}</div>
                          <div><strong>Department:</strong> {formData.department}</div>
                          <div><strong>Start Date:</strong> {formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 'Not specified'}</div>
                          {formData.salary && (
                            <div><strong>Salary:</strong> ${Number(formData.salary).toLocaleString()}</div>
                          )}
                          {formData.reportingManager && (
                            <div><strong>Reporting Manager:</strong> {formData.reportingManager}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm">
                      We are excited about the possibility of you joining our team and look forward to your positive response.
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500 my-4">
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-yellow-700 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-900 text-sm mb-1">📎 Important Document Attached</h4>
                          <p className="text-sm text-yellow-800 mb-2">
                            Please find attached the <strong>"Zero to One HR Handbook"</strong> which contains important information about our company policies, procedures, and employee guidelines.
                          </p>
                          <p className="text-sm text-yellow-900 font-medium">
                            <strong>Action Required:</strong> Please read the attached handbook carefully and confirm your acceptance of this offer along with acknowledgment that you have read and understood the company handbook.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-sm">
                      Best regards,<br />
                      Human Resources Department<br />
                      {formData.companyName || "Your Company"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Fill in all required fields marked with an asterisk (*)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use placeholders like [Position], [Department] in your offer letter content</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Enable preview to see how the offer letter will look</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Make sure SMTP settings are configured for email sending</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>The offer letter will be sent as both HTML and plain text</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="font-medium text-yellow-800">
                    📎 The "Zero to One HR Handbook" PDF will be automatically attached to all offer letters
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="font-medium text-yellow-800">
                    Candidates will be asked to confirm they have read and understood the handbook
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
