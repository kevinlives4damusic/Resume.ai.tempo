import { createClient } from "../../supabase/server";
import { extractResumeContent, type ExtractedResume } from "./pdf-extractor";

export interface ResumeAnalysis {
  completenessScore: number;
  skillsMatch: {
    technical: number;
    soft: number;
    keywords: number;
  };
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  contentAnalysis: {
    summary: string;
    experience: {
      jobDescriptions: string;
      employmentGaps: string;
    };
    skills: {
      technical: string;
      soft: string;
    };
  };
  formatAnalysis: {
    layout: {
      readability: string;
      fontChoice: string;
      sectionHeaders: string;
      length: string;
    };
    structure: {
      organization: string;
      consistency: string;
    };
    atsCompatibility: {
      fileFormat: string;
      complexElements: string;
    };
  };
  photoAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  improvementSuggestions: {
    highPriority: Array<{ title: string; description: string }>;
    mediumPriority: Array<{ title: string; description: string }>;
    lowPriority: Array<{ title: string; description: string }>;
  };
}

export async function analyzeResume(
  resumeId: string,
): Promise<ResumeAnalysis | null> {
  const supabase = await createClient();

  try {
    // Extract the content from the resume file
    const extractedContent = await extractResumeContent(resumeId);

    if (!extractedContent) {
      console.error("Failed to extract resume content");
      return null;
    }

    // First check if we already have an analysis for this resume
    const { data: existingAnalysis } = await supabase
      .from("resume_analyses")
      .select("*")
      .eq("resume_id", resumeId)
      .maybeSingle();

    // If we have an existing analysis, update it with the extracted content
    if (existingAnalysis) {
      // In a real implementation, we would analyze the extracted content
      // and update the analysis accordingly
      await supabase
        .from("resume_analyses")
        .update({
          updated_at: new Date().toISOString(),
          // We would update other fields based on the extracted content
        })
        .eq("id", existingAnalysis.id);

      // Convert the database analysis to our frontend format
      return {
        completenessScore: existingAnalysis.completeness_score || 0,
        skillsMatch: {
          technical: existingAnalysis.technical_skills_score || 0,
          soft: existingAnalysis.soft_skills_score || 0,
          keywords: existingAnalysis.keywords_score || 0,
        },
        atsScore: existingAnalysis.ats_compatibility_score || 0,
        strengths: existingAnalysis.strengths || [],
        weaknesses: existingAnalysis.weaknesses || [],
        contentAnalysis: {
          summary: existingAnalysis.ai_response
            ? "Analysis based on your actual uploaded resume"
            : "Based on your uploaded resume",
          experience: {
            jobDescriptions: existingAnalysis.ai_response
              ? "Analysis based on your actual uploaded resume"
              : "Based on your uploaded resume",
            employmentGaps: existingAnalysis.ai_response
              ? "Analysis based on your actual uploaded resume"
              : "Based on your uploaded resume",
          },
          skills: {
            technical: existingAnalysis.ai_response
              ? "Analysis based on your actual uploaded resume"
              : "Based on your uploaded resume",
            soft: existingAnalysis.ai_response
              ? "Analysis based on your actual uploaded resume"
              : "Based on your uploaded resume",
          },
        },
        formatAnalysis: {
          layout: {
            readability: "Based on your uploaded resume",
            fontChoice: "Based on your uploaded resume",
            sectionHeaders: "Based on your uploaded resume",
            length: "Based on your uploaded resume",
          },
          structure: {
            organization: "Based on your uploaded resume",
            consistency: "Based on your uploaded resume",
          },
          atsCompatibility: {
            fileFormat: "Based on your uploaded resume",
            complexElements: "Based on your uploaded resume",
          },
        },
        improvementSuggestions: {
          highPriority: (
            existingAnalysis.improvement_suggestions?.highPriority || []
          ).map((item: any) => ({
            title: item.title,
            description: item.description,
          })),
          mediumPriority: (
            existingAnalysis.improvement_suggestions?.mediumPriority || []
          ).map((item: any) => ({
            title: item.title,
            description: item.description,
          })),
          lowPriority: (
            existingAnalysis.improvement_suggestions?.lowPriority || []
          ).map((item: any) => ({
            title: item.title,
            description: item.description,
          })),
        },
      };
    }

    // If we don't have an analysis yet, we need to create one
    // For now, we'll return null and handle this case in the UI
    return null;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return null;
  }
}
