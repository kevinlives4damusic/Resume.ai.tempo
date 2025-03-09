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

      // Firebase implementation would go here
      // For now, we'll just show a message
      alert(
        "Payment processing is being implemented with Firebase. Please check back soon!",
      );
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
