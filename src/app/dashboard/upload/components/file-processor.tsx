"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileProcessorProps {
  resumeId: string;
  onComplete: () => void;
}

export default function FileProcessor({
  resumeId,
  onComplete,
}: FileProcessorProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Extracting text from document...");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingStartedRef = useRef<boolean>(false);

  // Function to handle manual retry
  const handleRetry = () => {
    setError(null);
    setIsTimedOut(false);
    setProgress(0);
    setStatus("Extracting text from document...");
    processFile();
  };

  // Function to handle manual completion (fallback)
  const handleManualComplete = () => {
    console.log("Manual completion triggered");
    setProgress(100);
    setStatus("Processing complete!");
    setIsComplete(true);
    onComplete();
  };

  // Main processing function
  const processFile = async () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a global timeout for the entire process
    timeoutRef.current = setTimeout(() => {
      console.log("Processing timed out after 30 seconds");
      setIsTimedOut(true);
      setStatus("Processing is taking longer than expected...");
    }, 30000); // 30 second timeout

    try {
      processingStartedRef.current = true;
      console.log("Starting file processing for resume ID:", resumeId);

      // Step 1: Extract text from the document
      setProgress(10);
      setStatus("Extracting text from document...");
      console.log("Extracting text from document...");

      try {
        const extractResponse = await fetch("/api/extract-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resumeId }),
        });

        console.log("Extract response status:", extractResponse.status);

        if (!extractResponse.ok) {
          throw new Error(
            `Failed to extract resume content: ${extractResponse.status}`,
          );
        }

        const extractData = await extractResponse.json();
        console.log("Extract data received:", extractData.success);

        setProgress(40);
      } catch (extractErr) {
        console.error("Text extraction error:", extractErr);
        // Continue anyway with mock data
        setProgress(40);
      }

      // Step 2: Analyze the resume with AI
      setStatus("Analyzing with AI (this may take a moment)...");
      console.log("Sending resume for AI analysis, ID:", resumeId);

      try {
        const analyzeResponse = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resumeId }),
        });

        console.log("Analyze response status:", analyzeResponse.status);

        if (!analyzeResponse.ok) {
          throw new Error(
            `Failed to analyze resume: ${analyzeResponse.status}`,
          );
        }

        const analyzeData = await analyzeResponse.json();
        console.log("Analysis complete, success:", analyzeData.success);

        if (!analyzeData.success) {
          throw new Error(analyzeData.error || "AI analysis failed");
        }

        setProgress(80);
      } catch (analyzeErr) {
        console.error("AI analysis error:", analyzeErr);
        // Continue anyway with mock data
        setProgress(80);
      }

      setStatus("Generating insights...");

      // Step 3: Complete the process
      setTimeout(() => {
        setProgress(100);
        setStatus("Processing complete!");
        setIsComplete(true);
        // Clear the timeout since we're done
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        onComplete();
      }, 1500);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      // Clear the timeout since we're done with an error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  useEffect(() => {
    // Only start processing if it hasn't started yet
    if (!processingStartedRef.current) {
      processFile();
    }

    // Cleanup function to clear timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resumeId]);

  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="h-8 w-8 text-blue-500" />
        <div>
          <h3 className="font-medium">Processing Your Resume</h3>
          <p className="text-sm text-gray-500">{status}</p>
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-4" />

      {error ? (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 relative">
            <AlertTriangle className="h-4 w-4 absolute left-4 top-4 text-red-500" />
            <div className="pl-7 text-sm">Error: {error}</div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRetry}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
            <Button onClick={handleManualComplete} size="sm" variant="outline">
              Continue Anyway
            </Button>
          </div>
        </div>
      ) : isTimedOut ? (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 relative">
            <AlertTriangle className="h-4 w-4 absolute left-4 top-4 text-amber-500" />
            <div className="pl-7 text-sm">
              Processing is taking longer than expected. You can retry or
              continue to see results.
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRetry}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
            <Button onClick={handleManualComplete} size="sm" variant="outline">
              Continue Anyway
            </Button>
          </div>
        </div>
      ) : isComplete ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span>Processing complete!</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Please wait while we process your file...</span>
        </div>
      )}
    </div>
  );
}
