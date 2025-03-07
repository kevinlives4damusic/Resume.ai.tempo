"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Eye } from "lucide-react";

interface ResumeContentViewProps {
  resumeId: string;
  fileName: string;
  fileUrl?: string;
}

export default function ResumeContentView({
  resumeId,
  fileName,
  fileUrl,
}: ResumeContentViewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-4 w-4" />
        <span>View Original CV</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {fileName}
            </DialogTitle>
            <DialogDescription>
              This is your original uploaded resume that was analyzed
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {fileUrl && fileUrl.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={fileUrl}
                className="w-full h-[60vh] border rounded"
                title="Resume PDF"
              />
            ) : (
              <div className="border rounded p-4 bg-gray-50 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">
                  Preview not available for this file format. Please download to
                  view.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => window.open(fileUrl, "_blank")}
                >
                  Download File
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
