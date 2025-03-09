"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { FileText } from "lucide-react";
import UserProfile from "./user-profile";
import { useAuth } from "./auth-provider";

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <nav className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold">CV Analyzer</span>
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link
            href="#features"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Resources
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          {!loading && user ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Button>Dashboard</Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
