import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function CheckoutSuccessPage() {
  const user = getCurrentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-16 flex flex-col items-center">
          <Card className="max-w-md w-full shadow-md">
            <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for upgrading to Premium. Your account has been
                upgraded and you now have access to all premium features.
              </p>

              <div className="space-y-4 w-full">
                <Link href="/dashboard">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Go to Dashboard
                  </Button>
                </Link>

                <Link href="/dashboard/analysis">
                  <Button variant="outline" className="w-full">
                    View Resume Analysis
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
