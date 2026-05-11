"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";

function MockEmailContent() {
  const params = useSearchParams();
  const message = params.get("message");

  return (
    <div className="w-full bg-gray-100 py-2">
      <div className="max-w-2xl mx-auto">
        {/* Gmail Header */}
        <div className="bg-black rounded-t-lg border border-gray-300">
          <div className="flex items-center justify-center py-4">
            <div className="rounded-lg">
              <Image
                src="/secondary logo white copy.png"
                alt="Tech-021 Logo"
                width={200}
                height={220}
                className=""
              />
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="bg-white border border-t-0 border-gray-300 p-8">
          <div className="flex flex-col items-start space-y-4 text-left">
            {/* Greeting */}
            <p className="text-gray-900 text-base">Hey there 👋</p>

            {/* Main Content */}
            <div className="space-y-4 text-gray-700 leading-relaxed max-w-2xl">
              <p>
                <span className="font-semibold text-gray-900">
                  It looks like your organization has important updates from the
                  HR system.
                </span>
              </p>
              <p className="text-gray-700">
                {message ||
                  "You have received a notification from the Tech-021 HR System regarding your employment records, leave balance, or important company announcements. Please log in to your dashboard to view more details and take any necessary actions."}
              </p>

              {/* CTA Button */}

              <p className="text-sm text-gray-600">
                If you need further assistance or have any questions about this
                notification, please don't hesitate to contact the HR department
                at hr@tech-021.com or visit our resources section for more
                information.
              </p>
            </div>
          </div>

          {/* Footer Divider */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3 text-center">
            <p className="text-xs text-gray-500">
              If you no longer wish to receive emails from Tech-021, you can{" "}
              <a href="#" className="text-teal-600 hover:underline">
                unsubscribe here
              </a>
            </p>
            <p className="text-xs text-gray-500">©2025 Tech-021 HR System</p>
            <p className="text-xs text-gray-500">Tech-021 | HR Department</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black rounded-b-lg border border-t-0 border-gray-500 pb-6 text-center">
          <div className="flex items-center justify-center">
            <div className="rounded">
              <Image
                src="/icon white.png"
                alt="Tech-021 Logo"
                width={60}
                height={60}
              />
            </div>
            <span className="text-white font-medium text-sm">
              Powered by Zerotoone
            </span>
          </div>
          <p className="text-gray-300 ml-8 text-xs">
            Every one deserves a zero
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MockEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MockEmailContent />
    </Suspense>
  );
}