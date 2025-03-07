import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InfoIcon,
  UserCircle,
  Upload,
  BarChart,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Link from "next/link";
import UpgradeButton from "@/components/upgrade-button";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check if user has a subscription
  const { data: subscriptionData } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const hasActiveSubscription = !!subscriptionData;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
            <div className="bg-blue-50 text-sm p-4 rounded-lg text-blue-800 flex gap-2 items-center border border-blue-100">
              <InfoIcon size="16" className="text-blue-500" />
              <span>
                Upload your CV to get started with AI-powered analysis and
                enhancement
              </span>
            </div>
          </header>

          {/* Quick Actions */}
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-500" />
                  Upload Resume
                </CardTitle>
                <CardDescription>Upload your CV for analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Supported formats: PDF, DOC, DOCX (Max 5MB)
                </p>
                <Link href="/dashboard/upload">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Upload Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-blue-500" />
                  Resume Analysis
                </CardTitle>
                <CardDescription>
                  View your resume analysis results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Get insights on completeness, skills, and improvement areas
                </p>
                <Button className="w-full" variant="outline">
                  View Analysis
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Resume Templates
                </CardTitle>
                <CardDescription>
                  Browse professional CV templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  South African focused templates for various industries
                </p>
                <Button className="w-full" variant="outline">
                  Browse Templates
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Premium Upgrade - Only show if user doesn't have an active subscription */}
          {!hasActiveSubscription && !user?.subscription && (
            <section className="mt-4">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        Upgrade to Premium
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Get AI-powered resume enhancement, keyword optimization,
                        and more with our premium service.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                            ✓
                          </div>
                          <span className="text-sm">
                            AI content enhancement
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                            ✓
                          </div>
                          <span className="text-sm">
                            ATS keyword optimization
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                            ✓
                          </div>
                          <span className="text-sm">
                            Before & after comparison
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                            ✓
                          </div>
                          <span className="text-sm">
                            Downloadable enhanced CV
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-center">
                      <div className="text-2xl font-bold mb-2">R299</div>
                      <UpgradeButton className="bg-blue-600 hover:bg-blue-700 px-6">
                        Upgrade Now
                      </UpgradeButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* User Profile Section */}
          <section className="bg-white rounded-xl p-6 border shadow-sm mt-4">
            <div className="flex items-center gap-4 mb-6">
              <UserCircle size={48} className="text-primary" />
              <div>
                <h2 className="font-semibold text-xl">User Profile</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Account Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-500">Email:</div>
                    <div>{user.email}</div>
                    <div className="text-gray-500">User ID:</div>
                    <div className="truncate">{user.id}</div>
                    <div className="text-gray-500">Account Type:</div>
                    <div>Free Plan</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Recent Activity
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <p className="text-gray-500 italic">No recent activity</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
