"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Slack, Bell, Shield, Database, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { getSettings, updateSettings } from "@/lib/api/settings"
import type { SettingsData, SettingsUpdatePayload } from "@/lib/api/types"

const DEFAULT_PASSWORD_POLICY =
  "Minimum 8 characters, must include uppercase, lowercase, number, and special character"

const DEFAULT_FORM_DATA: SettingsUpdatePayload = {
  companyName: "",
  standardWorkHours: 8,
  annualLeaveDays: 25,
  slackEnabled: false,
  slackWebhookUrl: "",
  slackVerificationToken: "",
  slackChannel: "#hr-notifications",
  emailNotifications: true,
  sessionTimeout: 480,
  passwordPolicy: DEFAULT_PASSWORD_POLICY,
}

function toSafeNumber(value: string, fallback: number): number {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : fallback
}

function toSettingsFormData(data: SettingsData): SettingsUpdatePayload {
  return {
    companyName: data.companyName || "",
    standardWorkHours: data.standardWorkHours || 8,
    annualLeaveDays: data.annualLeaveDays || 25,
    slackEnabled: data.slackEnabled || false,
    slackWebhookUrl: data.slackWebhookUrl || "",
    slackVerificationToken: data.slackVerificationToken || "",
    slackChannel: data.slackChannel || "#hr-notifications",
    emailNotifications: data.emailNotifications !== undefined ? data.emailNotifications : true,
    sessionTimeout: data.sessionTimeout || 480,
    passwordPolicy: data.passwordPolicy || DEFAULT_PASSWORD_POLICY,
  }
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const user = session?.user
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState<SettingsUpdatePayload>(DEFAULT_FORM_DATA)

  useEffect(() => {
    if (status === "authenticated") {
      void fetchSettings()
      return
    }

    if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await getSettings()
      setFormData(toSettingsFormData(data))
    } catch (err) {
      console.error("[settings] Failed to fetch settings:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch settings")
      toast("Error", {
        description: err instanceof Error ? err.message : "Failed to fetch settings",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const data = await updateSettings(formData)
      setFormData(toSettingsFormData(data))
      setSuccess("Settings saved successfully!")
      toast("Success", {
        description: "Settings have been saved successfully",
      })
    } catch (err) {
      console.error("[settings] Failed to save settings:", err)
      setError(err instanceof Error ? err.message : "Failed to save settings")
      toast("Error", {
        description: err instanceof Error ? err.message : "Failed to save settings",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = <K extends keyof SettingsUpdatePayload>(field: K, value: SettingsUpdatePayload[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Check if user has permission to view settings
  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-cyan-600" />
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-slate-600">Loading settings...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !["ADMIN", "HR"].includes(user.role)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access settings. Only administrators and HR can manage system settings.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-cyan-600" />
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-gray-200 bg-gray-50">
          <CheckCircle className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-700">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Slack className="h-5 w-5 text-purple-600" />
                <CardTitle>Slack Integration</CardTitle>
              </div>
              <CardDescription>
                Connect your HR system with Slack for seamless communication and commands
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Slack Integration</Label>
                  <p className="text-sm text-slate-600">
                    Allow employees to use Slack commands for check-in/out and leave requests
                  </p>
                </div>
                <Switch 
                  checked={formData.slackEnabled} 
                  onCheckedChange={(checked) => handleInputChange("slackEnabled", checked)} 
                />
              </div>

              {formData.slackEnabled && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                    <Input 
                      id="slack-webhook" 
                      placeholder="https://hooks.slack.com/services/..." 
                      type="url"
                      value={formData.slackWebhookUrl}
                      onChange={(e) => handleInputChange("slackWebhookUrl", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slack-token">Verification Token</Label>
                    <Input 
                      id="slack-token" 
                      placeholder="Your Slack app verification token" 
                      type="password"
                      value={formData.slackVerificationToken}
                      onChange={(e) => handleInputChange("slackVerificationToken", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slack-channel">Default Slack Channel</Label>
                    <Input 
                      id="slack-channel" 
                      placeholder="#hr-notifications"
                      value={formData.slackChannel}
                      onChange={(e) => handleInputChange("slackChannel", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Available Commands</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">/checkin</Badge>
                      <Badge variant="secondary">/checkout</Badge>
                      <Badge variant="secondary">/leave</Badge>
                      <Badge variant="secondary">/status</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Setup Instructions</Label>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>1. Create a new Slack app at api.slack.com</p>
                      <p>
                        2. Add slash commands pointing to:{" "}
                        <code className="bg-slate-200 px-1 rounded">/api/slack/commands</code>
                      </p>
                      <p>3. Add incoming webhook for notifications</p>
                      <p>4. Install the app to your workspace</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-slate-600">Receive email alerts for important HR events</p>
                </div>
                <Switch 
                  checked={formData.emailNotifications} 
                  onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Slack Notifications</Label>
                  <p className="text-sm text-slate-600">Send notifications to Slack channels</p>
                </div>
                <Switch checked={formData.slackEnabled} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-channel">Default Slack Channel</Label>
                <Input 
                  id="notification-channel" 
                  placeholder="#hr-notifications" 
                  value={formData.slackChannel}
                  onChange={(e) => handleInputChange("slackChannel", e.target.value)}
                  disabled={!formData.slackEnabled} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-black" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>Manage security policies and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input 
                  id="session-timeout" 
                  type="number" 
                  value={formData.sessionTimeout}
                  onChange={(e) => handleInputChange("sessionTimeout", toSafeNumber(e.target.value, formData.sessionTimeout))}
                  min="30" 
                  max="1440" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-policy">Password Policy</Label>
                <Textarea
                  id="password-policy"
                  value={formData.passwordPolicy}
                  onChange={(e) => handleInputChange("passwordPolicy", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <CardTitle>System Configuration</CardTitle>
              </div>
              <CardDescription>System-wide settings and configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input 
                  id="company-name" 
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work-hours">Standard Work Hours per Day</Label>
                <Input 
                  id="work-hours" 
                  type="number" 
                  value={formData.standardWorkHours}
                  onChange={(e) => handleInputChange("standardWorkHours", toSafeNumber(e.target.value, formData.standardWorkHours))}
                  min="1" 
                  max="24" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annual-leave">Annual Leave Days</Label>
                <Input 
                  id="annual-leave" 
                  type="number" 
                  value={formData.annualLeaveDays}
                  onChange={(e) => handleInputChange("annualLeaveDays", toSafeNumber(e.target.value, formData.annualLeaveDays))}
                  min="0" 
                  max="365" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  )
}
