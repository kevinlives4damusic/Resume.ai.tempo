"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ViewCVButtonProps {
  section: string;
  className?: string;
}

export default function ViewCVButton({
  section,
  className,
}: ViewCVButtonProps) {
  const [open, setOpen] = useState(false);

  const sectionContent = {
    "Education section": {
      title: "Education Section",
      content: (
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            <h4 className="font-bold">University of Cape Town</h4>
            <p className="text-sm">Bachelor of Science in Computer Science</p>
            <p className="text-xs text-gray-500">2015 - 2019</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            <h4 className="font-bold">High School Diploma</h4>
            <p className="text-sm">Pretoria Boys High School</p>
            <p className="text-xs text-gray-500">2011 - 2014</p>
          </div>
        </div>
      ),
    },
    "Header section": {
      title: "Contact Information",
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium w-20">Name:</span>
            <span>John Smith</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-20">Email:</span>
            <span>john.smith@example.com</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-20">Phone:</span>
            <span>+27 82 123 4567</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-20">Location:</span>
            <span>Cape Town, South Africa</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-20">LinkedIn:</span>
            <span>linkedin.com/in/johnsmith</span>
          </div>
        </div>
      ),
    },
    "Skills section": {
      title: "Technical Skills",
      content: (
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-1">Programming Languages</h4>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                JavaScript
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Python
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Java
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                SQL
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-1">Frameworks & Tools</h4>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                React
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Node.js
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Git
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Docker
              </span>
            </div>
          </div>
        </div>
      ),
    },
    "Experience section": {
      title: "Work Experience",
      content: (
        <div className="space-y-4">
          <div className="border-l-4 border-red-300 pl-4 py-1">
            <h4 className="font-bold">Software Developer</h4>
            <p className="text-sm">ABC Tech Solutions, Cape Town</p>
            <p className="text-xs text-gray-500">Jan 2020 - Present</p>
            <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
              <li>Developed and maintained web applications</li>
              <li>Collaborated with cross-functional teams</li>
              <li>Implemented new features and functionality</li>
            </ul>
            <div className="mt-2 bg-red-50 p-2 rounded-md border border-red-200">
              <p className="text-xs text-red-700">
                <strong>Missing:</strong> Quantifiable achievements that
                demonstrate impact
              </p>
            </div>
          </div>
        </div>
      ),
    },
    "All sections": {
      title: "ATS Keywords Analysis",
      content: (
        <div className="space-y-4">
          <p className="text-sm">
            Your resume is missing these industry-specific keywords:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-50 p-2 rounded border border-red-200">
              <p className="text-xs font-medium">Software Development</p>
              <ul className="text-xs list-disc list-inside">
                <li>CI/CD</li>
                <li>Agile methodology</li>
                <li>Unit testing</li>
              </ul>
            </div>
            <div className="bg-red-50 p-2 rounded border border-red-200">
              <p className="text-xs font-medium">Data Analysis</p>
              <ul className="text-xs list-disc list-inside">
                <li>Data visualization</li>
                <li>Business intelligence</li>
                <li>Statistical analysis</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    "Summary section": {
      title: "Professional Summary",
      content: (
        <div className="space-y-3">
          <div className="bg-amber-50 p-3 rounded border border-amber-200">
            <p className="italic text-sm">
              "Dedicated professional with 5+ years of experience seeking
              opportunities to apply my skills..."
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <p className="text-sm text-red-700">
              <strong>Problem:</strong> This summary is too generic and doesn't
              highlight your unique value proposition or specific industry
              expertise.
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <p className="text-sm text-green-700">
              <strong>Recommendation:</strong> Include specific achievements,
              skills relevant to your target role, and your unique professional
              brand.
            </p>
          </div>
        </div>
      ),
    },
  };

  const sectionData = sectionContent[
    section as keyof typeof sectionContent
  ] || {
    title: section,
    content: <p>Section content not available</p>,
  };

  return (
    <>
      <Button
        variant="link"
        size="sm"
        className={`justify-start px-0 text-xs text-blue-600 ${className}`}
        onClick={() => setOpen(true)}
      >
        View in CV ({section})
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{sectionData.title}</DialogTitle>
            <DialogDescription>
              Review this section of your CV to see where improvements are
              needed
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">{sectionData.content}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
