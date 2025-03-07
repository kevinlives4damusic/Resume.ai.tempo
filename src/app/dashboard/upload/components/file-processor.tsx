"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, CheckCircle } from "lucide-react";

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

  useEffect(() => {
    const processFile = async () => {
      try {
        // Step 1: Extract text from the document
        setProgress(10);
        setStatus("Extracting text from document...");

        const extractResponse = await fetch("/api/extract-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resumeId }),
        });

        if (!extractResponse.ok) {
          throw new Error("Failed to extract resume content");
        }

        setProgress(40);
        setStatus("Analyzing with DeepSeek AI...");

        // Step 2: Analyze the resume with DeepSeek AI
        const analyzeResponse = await fetch("/api/ai-analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resumeId }),
        });

        if (!analyzeResponse.ok) {
          throw new Error("Failed to analyze resume with AI");
        }

        const analyzeData = await analyzeResponse.json();
        if (!analyzeData.success) {
          throw new Error(analyzeData.error || "AI analysis failed");
        }

        setProgress(80);
        setStatus("Generating insights...");

        // Step 3: Complete the process
        setTimeout(() => {
          setProgress(100);
          setStatus("Processing complete!");
          setIsComplete(true);
          onComplete();
        }, 1000);
      } catch (err) {
        console.error("Error processing file:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    };

    processFile();
  }, [resumeId, onComplete]);

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
        <div className="text-red-500 text-sm mt-2">Error: {error}</div>
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
