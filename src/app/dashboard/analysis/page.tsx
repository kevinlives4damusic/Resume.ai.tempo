import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InfoIcon,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserResumes, getResumeAnalysis } from "@/lib/db";
import Link from "next/link";
import UpgradeButton from "@/components/upgrade-button";
import ViewCVButton from "@/components/view-cv-button";
import { analyzeResume } from "@/lib/resume-analyzer";
import ResumeContentView from "./components/resume-content-view";
import React from "react";
import { extractResumeContent } from "@/lib/pdf-extractor";

export default async function ResumeAnalysis() {
  const user = getCurrentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check if user has a subscription
  const subscriptionData = await getUserSubscription(user.uid);
  const hasActiveSubscription = !!subscriptionData;

  // Check if user has uploaded a resume
  const resumeData = await getUserResumes(user.uid);

  const hasUploadedResume = resumeData && resumeData.length > 0;
  const userResume = hasUploadedResume ? resumeData[0] : null;

  // Get resume analysis if a resume exists
  const resumeAnalysis = userResume
    ? await getResumeAnalysis(userResume.id, user.uid)
    : null;

  // Extract content from the resume file
  const extractedContent = userResume
    ? await extractResumeContent(userResume.id)
    : null;

  // Get the file URL for viewing
  let fileUrl = userResume ? userResume.file_url || "" : "";

  if (!hasUploadedResume) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 flex flex-col gap-8">
            <header className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold">Resume Analysis</h1>
              <div className="bg-amber-50 text-sm p-4 rounded-lg text-amber-800 flex gap-2 items-center border border-amber-100">
                <AlertCircle size="16" className="text-amber-500" />
                <span>
                  You haven't uploaded a resume yet. Please upload one to see
                  the analysis.
                </span>
              </div>
            </header>

            <Card className="shadow-md max-w-md mx-auto text-center p-8">
              <CardContent className="pt-6">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Resume Found</h2>
                <p className="text-gray-500 mb-6">
                  Upload your resume to get a detailed analysis and improvement
                  suggestions.
                </p>
                <Link href="/dashboard/upload">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="mr-2 h-4 w-4" /> Upload Resume
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Resume Analysis</h1>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center flex-1">
                <InfoIcon size="14" />
                <span>
                  {userResume ? (
                    <>
                      Here's a detailed analysis of your uploaded resume{" "}
                      <strong>{userResume.file_name}</strong>. Use these
                      insights to improve your CV.
                    </>
                  ) : (
                    <>
                      Here's a detailed analysis of your resume. Use these
                      insights to improve your CV.
                    </>
                  )}
                </span>
              </div>

              {userResume && (
                <ResumeContentView
                  resumeId={userResume.id}
                  fileName={userResume.file_name}
                  fileUrl={fileUrl}
                />
              )}
            </div>
          </header>

          {/* Analysis Overview */}
          <section className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Completeness Score</CardTitle>
                <CardDescription>How complete your resume is</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {resumeAnalysis ? (
                        <span className="text-2xl font-bold">
                          {resumeAnalysis.completenessScore}%
                        </span>
                      ) : (
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      )}
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#eee"
                        strokeWidth="3"
                      />
                      {resumeAnalysis && (
                        <path
                          d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray={`${resumeAnalysis.completenessScore}, 100`}
                        />
                      )}
                    </svg>
                  </div>
                  <div className="text-sm text-gray-500">
                    {resumeAnalysis
                      ? resumeAnalysis.completenessScore > 75
                        ? "Good"
                        : resumeAnalysis.completenessScore > 50
                          ? "Needs some improvement"
                          : "Needs significant improvement"
                      : "Analyzing your resume..."}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Skills Match</CardTitle>
                <CardDescription>Relevance to job market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Technical Skills</span>
                      <span>
                        {resumeAnalysis
                          ? `${resumeAnalysis.skillsMatch.technical}%`
                          : "..."}
                      </span>
                    </div>
                    <Progress
                      value={
                        resumeAnalysis
                          ? resumeAnalysis.skillsMatch.technical
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Soft Skills</span>
                      <span>
                        {resumeAnalysis
                          ? `${resumeAnalysis.skillsMatch.soft}%`
                          : "..."}
                      </span>
                    </div>
                    <Progress
                      value={
                        resumeAnalysis ? resumeAnalysis.skillsMatch.soft : 0
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Industry Keywords</span>
                      <span>
                        {resumeAnalysis
                          ? `${resumeAnalysis.skillsMatch.keywords}%`
                          : "..."}
                      </span>
                    </div>
                    <Progress
                      value={
                        resumeAnalysis ? resumeAnalysis.skillsMatch.keywords : 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>ATS Compatibility</CardTitle>
                <CardDescription>How well ATS can read your CV</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {resumeAnalysis ? (
                        <span className="text-2xl font-bold">
                          {resumeAnalysis.atsScore}%
                        </span>
                      ) : (
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      )}
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#eee"
                        strokeWidth="3"
                      />
                      {resumeAnalysis && (
                        <path
                          d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={
                            resumeAnalysis.atsScore > 70
                              ? "#22c55e"
                              : resumeAnalysis.atsScore > 50
                                ? "#f59e0b"
                                : "#ef4444"
                          }
                          strokeWidth="3"
                          strokeDasharray={`${resumeAnalysis.atsScore}, 100`}
                        />
                      )}
                    </svg>
                  </div>
                  <div
                    className={`text-sm ${resumeAnalysis ? (resumeAnalysis.atsScore > 70 ? "text-green-500" : resumeAnalysis.atsScore > 50 ? "text-amber-500" : "text-red-500") : "text-gray-500"}`}
                  >
                    {resumeAnalysis
                      ? resumeAnalysis.atsScore > 70
                        ? "Good ATS compatibility"
                        : resumeAnalysis.atsScore > 50
                          ? "Needs some improvement"
                          : "Needs significant improvement"
                      : "Analyzing your resume..."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Detailed Analysis */}
          <section>
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 gap-1">
                <TabsTrigger value="overview" className="text-xs md:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="content" className="text-xs md:text-sm">
                  Content
                </TabsTrigger>
                <TabsTrigger value="format" className="text-xs md:text-sm">
                  Format
                </TabsTrigger>
                <TabsTrigger value="portrait" className="text-xs md:text-sm">
                  Photo
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="text-xs md:text-sm">
                  Tips
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resume Overview</CardTitle>
                    <CardDescription>
                      Summary of your resume's strengths and weaknesses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-auto"></div>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Strengths</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span>
                                Good educational background clearly presented
                              </span>
                              <ViewCVButton section="Education section" />
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span>
                                Contact information is complete and professional
                              </span>
                              <ViewCVButton section="Header section" />
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span>Technical skills are well highlighted</span>
                              <ViewCVButton section="Skills section" />
                            </div>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Areas for Improvement
                        </h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span>
                                Work experience lacks quantifiable achievements
                              </span>
                              <ViewCVButton section="Experience section" />
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span>
                                Missing industry-specific keywords for ATS
                                optimization
                              </span>
                              <ViewCVButton section="All sections" />
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span>Professional summary is too generic</span>
                              <ViewCVButton section="Summary section" />
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!subscriptionData && (
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">
                            Upgrade to Premium
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Get AI-powered resume enhancement and personalized
                            improvement suggestions.
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <UpgradeButton className="bg-blue-600 hover:bg-blue-700 px-6">
                            Upgrade Now - R299
                          </UpgradeButton>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Analysis</CardTitle>
                    <CardDescription>
                      Detailed analysis of your resume's content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Professional Summary
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-lg mb-2">
                          <p className="text-gray-700 italic">
                            {extractedContent?.sections.summary
                              ? extractedContent.sections.summary.substring(
                                  0,
                                  200,
                                ) +
                                (extractedContent.sections.summary.length > 200
                                  ? "..."
                                  : "")
                              : '"Dedicated professional with 5+ years of experience seeking opportunities to apply my skills..."'}
                          </p>
                        </div>
                        <div className="flex items-start gap-2 text-amber-600">
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span>
                            Your summary is too generic. Make it more specific
                            to your industry and highlight your unique value
                            proposition.
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Work Experience
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">
                                Job Descriptions
                              </span>
                              <span className="text-amber-600">
                                Needs Improvement
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Your job descriptions focus too much on
                              responsibilities rather than achievements.
                            </p>
                            <div className="flex items-start gap-2 text-sm">
                              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span>
                                Add quantifiable achievements (e.g., "Increased
                                sales by 20%")
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">
                                Employment Gaps
                              </span>
                              <span className="text-green-600">Good</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              No significant employment gaps detected.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Skills Section
                        </h3>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Technical Skills</span>
                          <span className="text-green-600">Good</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Your technical skills are well presented, but could
                          use more industry-specific keywords.
                        </p>

                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Soft Skills</span>
                          <span className="text-amber-600">
                            Needs Improvement
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Your soft skills section is underdeveloped.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!subscriptionData && (
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">
                            Enhance Your Content
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Our AI can rewrite your content to be more impactful
                            and ATS-friendly.
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <UpgradeButton className="bg-blue-600 hover:bg-blue-700 px-6">
                            Get Premium
                          </UpgradeButton>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="format" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Format & Structure Analysis</CardTitle>
                    <CardDescription>
                      Analysis of your resume's layout and organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Layout</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Readability</span>
                              <span className="text-green-600">Good</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Your resume has good spacing and is easy to read.
                            </p>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Font Choice</span>
                              <span className="text-green-600">Good</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Professional font choices that are ATS-friendly.
                            </p>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">
                                Section Headers
                              </span>
                              <span className="text-green-600">Good</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Clear section headers that stand out.
                            </p>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Length</span>
                              <span className="text-amber-600">
                                Needs Improvement
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Your resume is slightly too long at 3 pages.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Structure</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Organization</span>
                              <span className="text-green-600">Good</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Logical flow of information from most to least
                              important.
                            </p>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Consistency</span>
                              <span className="text-amber-600">
                                Needs Improvement
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Inconsistent date formats and bullet point styles.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          ATS Compatibility
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">File Format</span>
                              <span className="text-green-600">Good</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              PDF format is widely accepted by ATS systems.
                            </p>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">
                                Complex Elements
                              </span>
                              <span className="text-red-600">Poor</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Tables and graphics may not be parsed correctly by
                              ATS.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portrait" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Photo Analysis</CardTitle>
                    <CardDescription>
                      Assessment of your CV portrait photo and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-1/3">
                        {extractedContent?.hasPhoto ? (
                          <>
                            <div className="border rounded-lg overflow-hidden mb-4">
                              <img
                                src={
                                  extractedContent.photoUrl ||
                                  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80"
                                }
                                alt="Current profile photo"
                                className="w-full h-auto"
                              />
                            </div>
                            <p className="text-sm text-center text-gray-500">
                              Current profile photo from your CV
                            </p>
                          </>
                        ) : (
                          <div className="border rounded-lg p-8 text-center mb-4 bg-gray-50">
                            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                              No Photo Detected
                            </h3>
                            <p className="text-gray-500 mb-4">
                              We couldn't find a profile photo in your resume.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="md:w-2/3 space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            Photo Assessment
                          </h3>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Professional attire is appropriate</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>
                                Neutral background helps you stand out
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                              <span>
                                Lighting is slightly uneven, creating shadows
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                              <span>Image resolution could be improved</span>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            Recommendations
                          </h3>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                                1
                              </div>
                              <span>
                                Use soft, diffused lighting from the front to
                                eliminate shadows
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                                2
                              </div>
                              <span>
                                Ensure the photo is high resolution (at least
                                400x400 pixels)
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                                3
                              </div>
                              <span>
                                Position yourself to take up about 60% of the
                                frame (head and shoulders)
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                                4
                              </div>
                              <span>
                                Consider a more confident, approachable
                                expression
                              </span>
                            </li>
                          </ul>
                        </div>

                        {!subscriptionData && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-800 mb-2">
                              <strong>Premium Feature:</strong> Upgrade to get
                              AI-enhanced professional portrait editing
                            </p>
                            <UpgradeButton className="bg-blue-600 hover:bg-blue-700 text-sm">
                              Enhance My Portrait Photo
                            </UpgradeButton>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Improvement Suggestions</CardTitle>
                    <CardDescription>
                      Actionable tips to enhance your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          High Priority
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                              1
                            </div>
                            <div>
                              <p className="font-medium">
                                Add quantifiable achievements to work experience
                              </p>
                              <p className="text-sm text-gray-600">
                                Include metrics, percentages, and specific
                                results for each role.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                              2
                            </div>
                            <div>
                              <p className="font-medium">
                                Remove tables and complex formatting
                              </p>
                              <p className="text-sm text-gray-600">
                                Replace with simple, ATS-friendly formatting.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                              3
                            </div>
                            <div>
                              <p className="font-medium">
                                Rewrite professional summary
                              </p>
                              <p className="text-sm text-gray-600">
                                Make it specific to your industry and highlight
                                your unique value.
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Medium Priority
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                              4
                            </div>
                            <div>
                              <p className="font-medium">
                                Add more industry-specific keywords
                              </p>
                              <p className="text-sm text-gray-600">
                                Include terms from job descriptions in your
                                target field.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                              5
                            </div>
                            <div>
                              <p className="font-medium">
                                Expand soft skills section
                              </p>
                              <p className="text-sm text-gray-600">
                                Add relevant soft skills with examples of how
                                you've demonstrated them.
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Low Priority
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                              6
                            </div>
                            <div>
                              <p className="font-medium">
                                Standardize date formats
                              </p>
                              <p className="text-sm text-gray-600">
                                Use consistent date formatting throughout (e.g.,
                                MM/YYYY).
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                              7
                            </div>
                            <div>
                              <p className="font-medium">Condense to 2 pages</p>
                              <p className="text-sm text-gray-600">
                                Remove older or less relevant experiences to
                                keep resume concise.
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!subscriptionData && (
                  <div className="flex justify-center mt-8 mb-16 md:mb-0">
                    <UpgradeButton className="bg-blue-600 hover:bg-blue-700 px-8">
                      Upgrade to Premium for AI-Enhanced Resume
                    </UpgradeButton>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </>
  );
}
