"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  FileText,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Recipient {
  id: string;
  name: string;
  email: string;
}

export default function SendEmailPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [allEmployees, setAllEmployees] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();
  const [sendTo, setSendTo] = useState<"single" | "multiple">("single");

  const [formData, setFormData] = useState({
    singleEmail: "",
    singleName: "",
    subject: "",
    message: "",
  });

  // Fetch all employees on mount
  useEffect(() => {
    if (!["ADMIN", "HR"].includes(user?.role || "")) {
      setError(
        "Access denied. Only administrators and HR personnel can send emails."
      );
      setFetchingEmployees(false);
      return;
    }

    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees?limit=1000");
        if (response.ok) {
          const data = await response.json();
          const employees = data.employees.map((emp: any) => ({
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            email:
              emp.email ||
              `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@tech-021.com`,
          }));
          setAllEmployees(employees);
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      } finally {
        setFetchingEmployees(false);
      }
    };

    fetchEmployees();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addRecipient = (recipient: Recipient) => {
    if (!selectedRecipients.find((r) => r.id === recipient.id)) {
      setSelectedRecipients([...selectedRecipients, recipient]);
    }
  };

  const removeRecipient = (id: string) => {
    setSelectedRecipients(selectedRecipients.filter((r) => r.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Build recipients array based on mode
    let recipients: Recipient[] = [];

    if (sendTo === "single") {
      if (!formData.singleEmail || !formData.singleName) {
        setError("Please enter recipient name and email");
        setLoading(false);
        return;
      }
      recipients = [
        {
          id: formData.singleEmail,
          name: formData.singleName,
          email: formData.singleEmail,
        },
      ];
    } else {
      if (selectedRecipients.length === 0) {
        setError("Please select at least one recipient");
        setLoading(false);
        return;
      }
      recipients = selectedRecipients;
    }

    console.log("=== SEND EMAIL DEBUG ===");
    console.log("Mode:", sendTo);
    console.log("Recipients:", recipients);
    console.log("Subject:", formData.subject);

    try {
      const payload = {
        recipients,
        subject: formData.subject,
        message: formData.message,
      };

      console.log("Sending payload:", payload);

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      setSuccess(true);
      toast.success("Email sent successfully!", {
        description: `Email sent to ${recipients.length} recipient(s)`,
      });

      // Reset form
      setFormData((prev) => ({
        ...prev,
        singleEmail: "",
        singleName: "",
        subject: "",
        message: "",
      }));
      setSelectedRecipients([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error details:", err);
      toast.error("Failed to send email", { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!["ADMIN", "HR"].includes(user?.role || "")) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Send Email</h1>
          <p className="text-muted-foreground">Email communication</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              You don't have permission to send emails.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Send Email</h1>
        <p className="text-muted-foreground">
          Send emails to employees directly
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-300">
            Email(s) sent successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Compose Email
              </CardTitle>
              <CardDescription>
                Send personalized emails to your team
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Send To Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Send To</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="single"
                        name="sendTo"
                        value="single"
                        checked={sendTo === "single"}
                        onChange={(e) =>
                          setSendTo(e.target.value as "single" | "multiple")
                        }
                        className="h-4 w-4 cursor-pointer"
                      />
                      <Label
                        htmlFor="single"
                        className="font-normal cursor-pointer"
                      >
                        Single Recipient
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="multiple"
                        name="sendTo"
                        value="multiple"
                        checked={sendTo === "multiple"}
                        onChange={(e) =>
                          setSendTo(e.target.value as "single" | "multiple")
                        }
                        className="h-4 w-4 cursor-pointer"
                      />
                      <Label
                        htmlFor="multiple"
                        className="font-normal cursor-pointer"
                      >
                        Multiple Recipients
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Single Recipient Form */}
                {sendTo === "single" && (
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="singleName"
                        className="text-sm font-medium"
                      >
                        Recipient Name
                      </Label>
                      <Input
                        id="singleName"
                        placeholder="Enter recipient name"
                        value={formData.singleName}
                        onChange={(e) =>
                          handleInputChange("singleName", e.target.value)
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="singleEmail"
                        className="text-sm font-medium"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="singleEmail"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.singleEmail}
                        onChange={(e) =>
                          handleInputChange("singleEmail", e.target.value)
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                {/* Multiple Recipients Form */}
                {sendTo === "multiple" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Select Employees
                      </Label>
                      {fetchingEmployees ? (
                        <div className="mt-2 p-4 bg-muted rounded-lg flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Loading employees...
                          </span>
                        </div>
                      ) : (
                        <Select
                          onValueChange={(value) => {
                            const employee = allEmployees.find(
                              (e) => e.id === value
                            );
                            if (employee) {
                              addRecipient(employee);
                            }
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Choose employees to send to..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {allEmployees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name} ({employee.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Click to select employees from the dropdown, or use
                        search to filter
                      </p>
                    </div>

                    {/* Selected Recipients Display */}
                    {selectedRecipients.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Selected Recipients ({selectedRecipients.length})
                        </Label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {selectedRecipients.map((recipient) => (
                            <div
                              key={recipient.id}
                              className="flex items-center justify-between bg-muted p-3 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  {recipient.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {recipient.email}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRecipient(recipient.id)}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Email Content */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      placeholder="Enter email subject"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Write your email message here..."
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      className="mt-2 min-h-64 resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {formData.message.length} characters
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    className="flex-1"
                    disabled={!formData.subject || !formData.message}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !formData.subject ||
                      !formData.message ||
                      (sendTo === "single" &&
                        (!formData.singleEmail || !formData.singleName)) ||
                      (sendTo === "multiple" && selectedRecipients.length === 0)
                    }
                    className="flex-1 bg-black hover:bg-gray-800 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Email Info */}
        <div className="space-y-4">
          {/* Email Stats */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Email Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Total Employees:
                  </span>
                  <span className="font-semibold">{allEmployees.length}</span>
                </div>
              </div>

              {sendTo === "multiple" && selectedRecipients.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">Selected:</span>
                  <span className="font-semibold text-green-600">
                    {selectedRecipients.length}
                  </span>
                </div>
              )}

              {formData.message && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Message Length:</span>
                  <span className="font-semibold">
                    {formData.message.length} chars
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="shadow-sm bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Tips for Better Emails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-blue-900 dark:text-blue-300">
                • Keep subject lines clear and concise
              </p>
              <p className="text-blue-900 dark:text-blue-300">
                • Use professional and friendly tone
              </p>
              <p className="text-blue-900 dark:text-blue-300">
                • Include relevant details and action items
              </p>
              <p className="text-blue-900 dark:text-blue-300">
                • Review email before sending
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Email Preview</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  TO
                </Label>
                <p className="font-medium mt-1">
                  {sendTo === "single"
                    ? formData.singleEmail || "Select recipient"
                    : selectedRecipients.map((r) => r.email).join(", ") ||
                      "No recipients selected"}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  SUBJECT
                </Label>
                <p className="font-medium mt-1 text-lg">
                  {formData.subject || "(No subject)"}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  MESSAGE
                </Label>
                <div className="mt-3 p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                  {formData.message || "(No message)"}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPreview(false)}
                >
                  Back to Edit
                </Button>
                <Button
                  className="flex-1 bg-black hover:bg-gray-800 text-white"
                  disabled={loading}
                  onClick={() => {
                    setShowPreview(false);
                    document
                      .querySelector("form")
                      ?.dispatchEvent(new Event("submit", { bubbles: true }));
                  }}
                >
                  {loading ? "Sending..." : "Confirm & Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
