"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Shield,
  Heart,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function ResourcesPage() {
  const resources = [
    {
      category: "HR Policies",
      icon: FileText,
      items: [
        {
          title: "Employee Handbook",
          description: "Complete guide to company policies and procedures",
        },
        {
          title: "Code of Conduct",
          description: "Professional behavior and ethics guidelines",
        },
        {
          title: "Leave Policy",
          description: "Vacation, sick leave, and time-off procedures",
        },
        {
          title: "Remote Work Policy",
          description: "Guidelines for working from home",
        },
      ],
    },
    {
      category: "Benefits & Wellness",
      icon: Heart,
      items: [
        {
          title: "Health Insurance",
          description: "Medical, dental, and vision coverage details",
        },
        {
          title: "Retirement Plans",
          description: "401(k) and pension information",
        },
        {
          title: "Wellness Programs",
          description: "Fitness, mental health, and wellness resources",
        },
        {
          title: "Employee Assistance",
          description: "Counseling and support services",
        },
      ],
    },
    {
      category: "Learning & Development",
      icon: BookOpen,
      items: [
        {
          title: "Training Catalog",
          description: "Available courses and certifications",
        },
        {
          title: "Career Development",
          description: "Growth paths and advancement opportunities",
        },
        {
          title: "Mentorship Program",
          description: "Connect with mentors and mentees",
        },
        {
          title: "Conference & Events",
          description: "Professional development opportunities",
        },
      ],
    },
    {
      category: "IT & Security",
      icon: Shield,
      items: [
        {
          title: "IT Support",
          description: "Technical help and troubleshooting",
        },
        {
          title: "Security Guidelines",
          description: "Data protection and cybersecurity policies",
        },
        {
          title: "Software Access",
          description: "Request access to tools and applications",
        },
        {
          title: "Equipment Requests",
          description: "Hardware and equipment procurement",
        },
      ],
    },
  ];

  const contacts = [
    {
      department: "Human Resources",
      email: "hr@company.com",
      phone: "+1 (555) 123-4567",
      location: "Building A, Floor 2",
    },
    {
      department: "IT Support",
      email: "it@company.com",
      phone: "+1 (555) 123-4568",
      location: "Building B, Floor 1",
    },
    {
      department: "Facilities",
      email: "facilities@company.com",
      phone: "+1 (555) 123-4569",
      location: "Building A, Floor 1",
    },
    {
      department: "Security",
      email: "security@company.com",
      phone: "+1 (555) 123-4570",
      location: "Main Entrance",
    },
  ];

  const announcements = [
    {
      title: "Company All-Hands Meeting",
      date: "2024-02-15",
      type: "Meeting",
      description:
        "Join us for our quarterly all-hands meeting to discuss company updates and Q1 goals.",
    },
    {
      title: "New Health & Wellness Program",
      date: "2024-02-10",
      type: "Benefits",
      description:
        "We're excited to announce our new wellness program with fitness reimbursements and mental health resources.",
    },
    {
      title: "Office Renovation Update",
      date: "2024-02-05",
      type: "Facilities",
      description:
        "The renovation of Building C will begin next month. Temporary workspace assignments will be communicated soon.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Company Resources
        </h1>
        <p className="text-muted-foreground">
          Access important information, policies, and support resources
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/dashboard/checkin">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-black mx-auto mb-2" />
              <h3 className="font-medium text-foreground">Time Off Request</h3>
              <p className="text-sm text-muted-foreground">
                Submit leave requests
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/employees">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-chart-1 mx-auto mb-2" />
              <h3 className="font-medium text-foreground">
                Employee Directory
              </h3>
              <p className="text-sm text-muted-foreground">Find colleagues</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="#">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Phone className="h-8 w-8 text-chart-2 mx-auto mb-2" />
              <h3 className="font-medium text-foreground">IT Support</h3>
              <p className="text-sm text-muted-foreground">
                Get technical help
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="#">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 text-destructive mx-auto mb-2" />
              <h3 className="font-medium text-foreground">Expense Reports</h3>
              <p className="text-sm text-muted-foreground">Submit expenses</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resources */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Announcements</CardTitle>
              <CardDescription>Latest news and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground">
                        {announcement.title}
                      </h3>
                      <Badge variant="outline">{announcement.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {announcement.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(announcement.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {resources.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.items.map((item, itemIndex) => {
                    // Create links for HR Policies items
                    const getPolicyLink = (title: string) => {
                      switch (title) {
                        case "Employee Handbook":
                          return "/dashboard/resources/policies/employee-handbook";
                        case "Code of Conduct":
                          return "/dashboard/resources/policies/code-of-conduct";
                        case "Leave Policy":
                          return "/dashboard/resources/policies/leave-policy";
                        case "Remote Work Policy":
                          return "/dashboard/resources/policies/remote-work-policy";
                        default:
                          return "#";
                      }
                    };

                    const policyLink =
                      category.category === "HR Policies"
                        ? getPolicyLink(item.title)
                        : "#";

                    return (
                      <Link key={itemIndex} href={policyLink}>
                        <div className="p-3 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-foreground">
                                {item.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Important Contacts</CardTitle>
              <CardDescription>Key departments and support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contacts.map((contact, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-foreground">
                      {contact.department}
                    </h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {contact.location}
                      </div>
                    </div>
                    {index < contacts.length - 1 && (
                      <hr className="border-border" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/dashboard/resources/policies">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    HR Policies
                  </Button>
                </Link>
                <Link href="/dashboard/resources/policies/employee-handbook">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Employee Handbook
                  </Button>
                </Link>
                <Link href="/dashboard/resources/policies/code-of-conduct">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Code of Conduct
                  </Button>
                </Link>
                <Link href="/dashboard/resources/policies/leave-policy">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Leave Policy
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Office Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-medium">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
