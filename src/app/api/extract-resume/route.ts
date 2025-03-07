import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { extractResumeContent } from "@/lib/pdf-extractor";

export async function POST(request: Request) {
  try {
    const { resumeId } = await request.json();
    const supabase = await createClient();

    // Get the user to verify ownership
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the resume to verify ownership
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Extract content from the resume file
    const extractedContent = await extractResumeContent(resumeId);

    if (!extractedContent) {
      return NextResponse.json(
        { error: "Failed to extract resume content" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, content: extractedContent });
  } catch (error) {
    console.error("Error extracting resume content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
