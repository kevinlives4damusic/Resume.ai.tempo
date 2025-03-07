"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  UserCircle,
  Home,
  FileText,
  BarChart,
  Settings,
  Upload,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" prefetch className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">CV Analyzer</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 ml-10">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 ${isActive("/dashboard") ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboard/upload"
              className={`flex items-center gap-2 ${isActive("/dashboard/upload") ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload CV</span>
            </Link>
            <Link
              href="/dashboard/analysis"
              className={`flex items-center gap-2 ${isActive("/dashboard/analysis") ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
            >
              <BarChart className="h-4 w-4" />
              <span>Analysis</span>
            </Link>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 w-full"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/dashboard/upload"
                  className="flex items-center gap-2 w-full"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload CV</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#" className="flex items-center gap-2 w-full">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.refresh();
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
