"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SentEmailPage({ params }: any) {
  const emailData = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("sent_email") || "{}")
    : {}

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Email Sent Successfully</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>To:</strong> {emailData.to}</p>
          <p><strong>Subject:</strong> {emailData.subject}</p>

          <div className="mt-4 p-4 bg-muted rounded-lg whitespace-pre-wrap">
            {emailData.message}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
