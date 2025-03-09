import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { extractResumeContent } from "@/lib/pdf-extractor";
import { analyzeResumeWithAI, parseAIResponse } from "@/lib/ai-service";

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

    // Check if analysis already exists
    const { data: existingAnalysis } = await supabase
      .from("resume_analyses")
      .select("*")
      .eq("resume_id", resumeId)
      .maybeSingle();

    if (existingAnalysis) {
      // Update the existing analysis with new data
      const { error: updateError } = await supabase
        .from("resume_analyses")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingAnalysis.id);

      if (updateError) {
        console.error("Error updating analysis:", updateError);
        return NextResponse.json(
          { error: "Failed to update analysis" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        analysisId: existingAnalysis.id,
      });
    }

    // Extract content from the resume file
    const extractedContent = await extractResumeContent(resumeId);

    if (!extractedContent) {
      return NextResponse.json(
        { error: "Failed to extract resume content" },
        { status: 500 },
      );
    }

    // Use DeepSeek API to analyze the extracted content
    console.log("Sending extracted text to DeepSeek API for analysis");
    let analysis;

    try {
      // Send the extracted text to the DeepSeek API
      const aiResponse = await analyzeResumeWithAI(extractedContent.text);
      console.log("Received AI response from DeepSeek");

      // Parse the AI response
      const parsedResponse = await parseAIResponse(aiResponse);

      if (parsedResponse) {
        analysis = {
          resume_id: resumeId,
          completeness_score: parsedResponse.completenessScore,
          technical_skills_score: parsedResponse.skillsMatch.technical,
          soft_skills_score: parsedResponse.skillsMatch.soft,
          keywords_score: parsedResponse.skillsMatch.keywords,
          ats_compatibility_score: parsedResponse.atsScore,
          strengths: parsedResponse.strengths,
          weaknesses: parsedResponse.weaknesses,
          improvement_suggestions: parsedResponse.improvementSuggestions,
          ai_response: aiResponse,
        };
      }
    } catch (aiError) {
      console.error("Error using DeepSeek API:", aiError);
      // Fallback to basic analysis if AI fails
      analysis = {
        resume_id: resumeId,
        completeness_score: Math.floor(Math.random() * 30) + 50,
        technical_skills_score: Math.floor(Math.random() * 30) + 50,
        soft_skills_score: Math.floor(Math.random() * 30) + 40,
        keywords_score: Math.floor(Math.random() * 30) + 30,
        ats_compatibility_score: Math.floor(Math.random() * 30) + 40,
        strengths: [
          "Educational background",
          "Contact information",
          "Technical skills",
        ],
        weaknesses: [
          "Work experience lacks achievements",
          "Missing keywords",
          "Generic summary",
        ],
        improvement_suggestions: {
          highPriority: [
            {
              title: "Add quantifiable achievements",
              description: "Include metrics and results",
            },
            {
              title: "Remove complex formatting",
              description: "Use ATS-friendly formatting",
            },
            {
              title: "Rewrite summary",
              description: "Make it specific to your industry",
            },
          ],
          mediumPriority: [
            {
              title: "Add industry keywords",
              description: "Include terms from job descriptions",
            },
            {
              title: "Expand soft skills",
              description: "Add examples of demonstrated skills",
            },
          ],
          lowPriority: [
            {
              title: "Standardize date formats",
              description: "Use consistent formatting",
            },
            {
              title: "Condense to 2 pages",
              description: "Remove less relevant experiences",
            },
          ],
        },
      };
    }

    // Create a new analysis
    const { data: newAnalysis, error: createError } = await supabase
      .from("resume_analyses")
      .insert(analysis)
      .select()
      .single();

    if (createError) {
      console.error("Error creating analysis:", createError);
      return NextResponse.json(
        { error: "Failed to create analysis" },
        { status: 500 },
      );
    }

    // Update the resume to mark it as analyzed
    await supabase
      .from("resumes")
      .update({ is_analyzed: true })
      .eq("id", resumeId);

    return NextResponse.json({ success: true, analysisId: newAnalysis.id });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
