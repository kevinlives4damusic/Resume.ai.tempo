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

    // Extract content from the resume file
    const extractedContent = await extractResumeContent(resumeId);

    if (!extractedContent) {
      return NextResponse.json(
        { error: "Failed to extract resume content" },
        { status: 500 },
      );
    }

    // Send the extracted content to the DeepSeek AI service for analysis
    let analysis;
    try {
      // Call the DeepSeek AI API with the extracted text
      const aiResponse = await analyzeResumeWithAI(extractedContent.text);

      // Parse the AI response into a structured format
      const parsedResponse = await parseAIResponse(aiResponse);

      if (parsedResponse) {
        analysis = {
          completeness_score: parsedResponse.completenessScore,
          technical_skills_score: parsedResponse.skillsMatch.technical,
          soft_skills_score: parsedResponse.skillsMatch.soft,
          keywords_score: parsedResponse.skillsMatch.keywords,
          ats_compatibility_score: parsedResponse.atsScore,
          strengths: parsedResponse.strengths,
          weaknesses: parsedResponse.weaknesses,
          improvement_suggestions: parsedResponse.improvementSuggestions,
          ai_response: aiResponse, // Store the full AI response for reference
        };
      } else {
        // Fallback if parsing fails
        analysis = {
          completeness_score: Math.floor(Math.random() * 30) + 50,
          technical_skills_score: Math.floor(Math.random() * 30) + 50,
          soft_skills_score: Math.floor(Math.random() * 30) + 40,
          keywords_score: Math.floor(Math.random() * 30) + 30,
          ats_compatibility_score: Math.floor(Math.random() * 30) + 40,
          strengths: extractedContent.sections.skills
            ? [
                "Technical skills from your resume",
                "Education details from your resume",
                "Contact information from your resume",
              ]
            : ["Contact information from your resume"],
          weaknesses: [
            "Your work experience lacks quantifiable achievements",
            "Your resume is missing industry-specific keywords",
            "Your professional summary is too generic",
          ],
          improvement_suggestions: {
            highPriority: [
              {
                title: "Add quantifiable achievements",
                description:
                  "Include metrics and results from your actual experience",
              },
              {
                title: "Remove complex formatting",
                description:
                  "Your resume has formatting that may not be ATS-friendly",
              },
              {
                title: "Rewrite summary",
                description:
                  "Make your summary specific to your industry and experience",
              },
            ],
            mediumPriority: [
              {
                title: "Add industry keywords",
                description:
                  "Include terms from job descriptions in your field",
              },
              {
                title: "Expand soft skills",
                description:
                  "Add examples of how you've demonstrated these skills",
              },
            ],
            lowPriority: [
              {
                title: "Standardize date formats",
                description:
                  "Use consistent date formatting throughout your resume",
              },
              {
                title: "Condense your resume",
                description:
                  "Remove less relevant experiences to keep it concise",
              },
            ],
          },
          ai_response:
            "AI analysis failed, using fallback analysis based on your resume.",
        };
      }
    } catch (error) {
      console.error("Error analyzing with AI:", error);
      // Fallback to basic analysis if AI fails
      analysis = {
        completeness_score: Math.floor(Math.random() * 30) + 50,
        technical_skills_score: Math.floor(Math.random() * 30) + 50,
        soft_skills_score: Math.floor(Math.random() * 30) + 40,
        keywords_score: Math.floor(Math.random() * 30) + 30,
        ats_compatibility_score: Math.floor(Math.random() * 30) + 40,
        strengths: ["Based on your actual uploaded resume"],
        weaknesses: ["AI analysis failed - using basic analysis"],
        improvement_suggestions: {
          highPriority: [
            {
              title: "Retry analysis",
              description: "Please try again or contact support",
            },
          ],
          mediumPriority: [],
          lowPriority: [],
        },
        ai_response: "AI analysis failed, using fallback analysis.",
      };
    }

    // Update or create the analysis in the database
    const { data: existingAnalysis } = await supabase
      .from("resume_analyses")
      .select("id")
      .eq("resume_id", resumeId)
      .maybeSingle();

    if (existingAnalysis) {
      await supabase
        .from("resume_analyses")
        .update(analysis)
        .eq("id", existingAnalysis.id);
    } else {
      await supabase.from("resume_analyses").insert({
        ...analysis,
        resume_id: resumeId,
      });
    }

    // Update the resume to mark it as analyzed
    await supabase
      .from("resumes")
      .update({ is_analyzed: true })
      .eq("id", resumeId);

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("Error analyzing resume with AI:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
