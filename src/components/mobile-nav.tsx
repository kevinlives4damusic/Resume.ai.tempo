"use client";

import Link from "next/link";
import { Home, Upload, BarChart, Settings, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  // Only show on dashboard pages and for mobile devices
  if (!pathname.includes("/dashboard")) {
    return null;
  }

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center p-2 ${isActive("/dashboard") ? "text-blue-600" : "text-gray-600"}`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          href="/dashboard/upload"
          className={`flex flex-col items-center p-2 ${isActive("/dashboard/upload") ? "text-blue-600" : "text-gray-600"}`}
        >
          <Upload className="h-6 w-6" />
          <span className="text-xs mt-1">Upload</span>
        </Link>
        <Link
          href="/dashboard/analysis"
          className={`flex flex-col items-center p-2 ${isActive("/dashboard/analysis") ? "text-blue-600" : "text-gray-600"}`}
        >
          <BarChart className="h-6 w-6" />
          <span className="text-xs mt-1">Analysis</span>
        </Link>
        <Link
          href="/dashboard"
          className="flex flex-col items-center p-2 text-gray-600"
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}
