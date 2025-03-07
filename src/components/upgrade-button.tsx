"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface UpgradeButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function UpgradeButton({
  className,
  children,
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      console.log("Initiating checkout process...");
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();
      console.log("Checkout response:", responseData);

      if (!response.ok) {
        throw new Error(
          `Failed to create checkout session: ${responseData.error || "Unknown error"}`,
        );
      }

      if (responseData.url) {
        console.log("Redirecting to:", responseData.url);
        window.location.href = responseData.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
      alert(
        `Payment error: ${error instanceof Error ? error.message : "Something went wrong. Please try again."}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleUpgrade} disabled={isLoading} className={className}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children || "Upgrade to Premium"
      )}
    </Button>
  );
}
