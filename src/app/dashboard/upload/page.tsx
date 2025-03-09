"use client";

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
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import UpgradeButton from "@/components/upgrade-button";
import FileProcessor from "./components/file-processor";

export default function UploadResume() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<any>(authUser);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const { onAuthStateChange } = await import("@/lib/auth");
      const unsubscribe = onAuthStateChange((user) => {
        if (user) {
          setUser(user);
        } else {
          router.push("/sign-in");
        }
      });

      return () => unsubscribe();
    };
    checkUser();
  }, [router]);

  const validateFile = (file: File) => {
    setFileError(null);

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size exceeds 5MB limit");
      return false;
    }

    // Check file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setFileError("Invalid file format. Please upload a PDF or DOC/DOCX file");
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  }, []);

  const uploadFile = async () => {
    if (!file || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { getUserSubscription, uploadResume } = await import("@/lib/db");

      // Check if user has a subscription
      const subscriptionData = await getUserSubscription(user.uid);
      const hasActiveSubscription = !!subscriptionData;

      setUploadProgress(30); // Set initial progress

      // Upload file to Firebase Storage and save record in Firestore
      const { id, file_path } = await uploadResume(user.uid, file);

      // Set progress to 70% after upload completes
      setUploadProgress(70);

      console.log("Resume uploaded successfully, ID:", id);

      // Success - set progress to 100% after database entry is complete
      setUploadSuccess(true);
      setUploadProgress(100);
      setUploadedResumeId(id);
    } catch (error: any) {
      console.error("Upload error:", error);
      setFileError(`Upload failed: ${error.message || "Unknown error"}`);
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setFileError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Upload Your Resume</h1>
            <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
              <InfoIcon size="14" />
              <span>Upload your CV in PDF or DOC format for AI analysis</span>
            </div>
          </header>

          {/* Upload Section */}
          <section className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Upload Resume</CardTitle>
                <CardDescription>
                  Drag and drop your file or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!file ? (
                  <div
                    className={`border-2 border-dashed ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"} rounded-lg p-8 text-center transition-colors cursor-pointer`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <Upload className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {isDragging
                        ? "Drop your file here"
                        : "Drop your file here"}
                    </h3>
                    <p className="text-gray-500 mb-4">or</p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Browse Files
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                    />
                    <div className="mt-4 text-sm text-gray-500">
                      Supported formats: PDF, DOC, DOCX
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      Include a professional portrait photo in your CV for
                      additional analysis
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="h-10 w-10 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {!isUploading && !uploadSuccess && (
                        <Button variant="ghost" size="sm" onClick={resetUpload}>
                          <XCircle className="h-5 w-5 text-gray-500" />
                        </Button>
                      )}
                    </div>

                    {isUploading && (
                      <div className="mb-4">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-center mt-2 text-gray-600">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}

                    {uploadSuccess && uploadedResumeId ? (
                      <FileProcessor
                        resumeId={uploadedResumeId}
                        onComplete={() => router.push("/dashboard/analysis")}
                      />
                    ) : fileError ? (
                      <Alert className="bg-red-50 border-red-200 text-red-800">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <AlertTitle>Upload Failed</AlertTitle>
                        <AlertDescription>{fileError}</AlertDescription>
                      </Alert>
                    ) : (
                      !isUploading && (
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                          onClick={uploadFile}
                        >
                          Upload Resume
                        </Button>
                      )
                    )}
                  </div>
                )}

                {fileError && !file && (
                  <Alert className="mt-4 bg-red-50 border-red-200 text-red-800">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{fileError}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resume Guidelines</CardTitle>
                <CardDescription>
                  For best results, ensure your resume follows these guidelines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Include your full contact information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>
                      List your work experience in reverse chronological order
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Include relevant skills and qualifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Mention your education background</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Maximum file size: 5MB</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Premium Upgrade Section - Only show if user doesn't have an active subscription */}
          {!user?.subscription && (
            <section className="mt-8">
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
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                          <span>AI content enhancement</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                          <span>ATS keyword optimization</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                          <span>Before & after comparison</span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex-shrink-0">
                      <UpgradeButton className="bg-blue-600 hover:bg-blue-700 px-6">
                        Upgrade Now - R299
                      </UpgradeButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
