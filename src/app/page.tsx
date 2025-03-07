import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  BarChart,
  Sparkles,
  Upload,
  Shield,
} from "lucide-react";
import { createClient } from "../../supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />
        <div className="container relative mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Elevate Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  South African
                </span>{" "}
                CV with AI Analysis
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Get instant feedback on your resume, tailored to South African
                job market standards, and unlock AI-powered enhancements to
                stand out from the competition.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  Analyze My Resume
                  <ArrowUpRight className="ml-2 w-5 h-5" />
                </Link>

                <Link
                  href="#features"
                  className="inline-flex items-center justify-center px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
                >
                  Learn More
                </Link>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Free basic analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>South African focused</span>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-auto">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <Upload className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload your CV</h3>
                  <p className="text-gray-500 mb-4">
                    Drag and drop your PDF or DOC file here
                  </p>
                  <Link href="/dashboard/upload">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Browse Files
                    </button>
                  </Link>
                </div>
                <div className="mt-4 text-center text-sm text-gray-500">
                  Supported formats: PDF, DOC, DOCX
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How Our Platform Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI-powered system analyzes your CV against South African job
              market standards and provides actionable insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Upload className="w-6 h-6" />,
                title: "Easy Upload",
                description:
                  "Simply upload your CV in PDF or DOC format with our drag-and-drop interface",
              },
              {
                icon: <BarChart className="w-6 h-6" />,
                title: "Instant Analysis",
                description:
                  "Get immediate feedback on your CV's completeness, skills, and structure",
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Detailed Report",
                description:
                  "Receive a comprehensive report with specific improvement suggestions",
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "AI Enhancement",
                description:
                  "Upgrade to premium for AI-powered CV improvements and optimization",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "South African Focus",
                description:
                  "Tailored to local job market requirements and terminology",
              },
              {
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: "Before & After",
                description:
                  "Compare your original and enhanced CV to see the improvements",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">CVs Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started with our free analysis or upgrade for premium
              features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <h3 className="text-xl font-bold mb-2">Basic Analysis</h3>
              <div className="text-3xl font-bold mb-4">Free</div>
              <p className="text-gray-600 mb-6">
                Perfect for getting started with basic CV feedback
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "CV completeness score",
                  "Basic skill matching",
                  "Structure analysis",
                  "Simple improvement tips",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard"
                className="block text-center py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-500 relative">
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                RECOMMENDED
              </div>

              <h3 className="text-xl font-bold mb-2">Premium Enhancement</h3>
              <div className="text-3xl font-bold mb-4">R299</div>
              <p className="text-gray-600 mb-6">
                Advanced AI-powered CV enhancement and optimization
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Basic Analysis",
                  "AI-powered content enhancement",
                  "Industry-specific optimization",
                  "Keyword optimization for ATS",
                  "Before & after comparison",
                  "Downloadable enhanced CV",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard"
                className="block text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Upgrade to Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Improve Your CV?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of South African job seekers who have improved their
            chances with our platform.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analyze My CV Now
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
