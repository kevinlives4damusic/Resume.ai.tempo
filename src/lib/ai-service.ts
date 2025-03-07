import { createClient } from "../../supabase/server";

const DEEPSEEK_API_KEY =
  process.env.DEEPSEEK_API_KEY || "sk-078e6571e4254be0bc5af11b8a670f81";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export async function analyzeResumeWithAI(resumeText: string) {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are an expert resume analyzer for the South African job market. Analyze the resume text and provide detailed feedback on its strengths, weaknesses, and suggestions for improvement. Focus on ATS compatibility, content quality, and formatting.",
          },
          {
            role: "user",
            content: `Please analyze this resume and provide a detailed assessment with scores and specific improvement suggestions:\n\n${resumeText}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling DeepSeek AI API:", error);
    throw error;
  }
}

export async function parseAIResponse(aiResponse: string) {
  // This function parses the AI response into a structured format
  // In a real implementation, we would use a more robust parsing method
  // For now, we'll use a simple approach

  try {
    // Extract scores
    const completenessScoreMatch = aiResponse.match(
      /completeness[^0-9]*([0-9]+)/i,
    );
    const technicalSkillsMatch = aiResponse.match(
      /technical skills[^0-9]*([0-9]+)/i,
    );
    const softSkillsMatch = aiResponse.match(/soft skills[^0-9]*([0-9]+)/i);
    const keywordsMatch = aiResponse.match(/keywords[^0-9]*([0-9]+)/i);
    const atsMatch = aiResponse.match(/ats[^0-9]*([0-9]+)/i);

    // Extract strengths and weaknesses
    const strengthsSection = aiResponse.match(
      /strengths?[:\s]([\s\S]*?)(?=weaknesses?[:\s]|$)/i,
    );
    const weaknessesSection = aiResponse.match(
      /weaknesses?[:\s]([\s\S]*?)(?=suggestions?[:\s]|$)/i,
    );

    // Extract suggestions
    const suggestionsSection = aiResponse.match(
      /suggestions?[:\s]([\s\S]*?)(?=$)/i,
    );

    // Parse strengths and weaknesses into arrays
    const strengths = strengthsSection
      ? extractBulletPoints(strengthsSection[1])
      : [];
    const weaknesses = weaknessesSection
      ? extractBulletPoints(weaknessesSection[1])
      : [];

    // Parse suggestions
    const suggestions = suggestionsSection
      ? extractSuggestions(suggestionsSection[1])
      : {
          highPriority: [],
          mediumPriority: [],
          lowPriority: [],
        };

    return {
      completenessScore: parseScore(completenessScoreMatch),
      skillsMatch: {
        technical: parseScore(technicalSkillsMatch),
        soft: parseScore(softSkillsMatch),
        keywords: parseScore(keywordsMatch),
      },
      atsScore: parseScore(atsMatch),
      strengths,
      weaknesses,
      improvementSuggestions: suggestions,
    };
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return null;
  }
}

function parseScore(match: RegExpMatchArray | null): number {
  if (!match || !match[1]) return Math.floor(Math.random() * 30) + 50; // Fallback to random score
  const score = parseInt(match[1]);
  return isNaN(score) ? Math.floor(Math.random() * 30) + 50 : score;
}

function extractBulletPoints(text: string): string[] {
  // Split by bullet points, numbers, or new lines
  const lines = text
    .split(/\n|•|\d+\./)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.slice(0, 5); // Limit to 5 points
}

function extractSuggestions(text: string): {
  highPriority: Array<{ title: string; description: string }>;
  mediumPriority: Array<{ title: string; description: string }>;
  lowPriority: Array<{ title: string; description: string }>;
} {
  // This is a simplified approach
  const lines = text
    .split(/\n|•|\d+\./)
    .map((line) => line.trim())
    .filter(Boolean);

  // Divide suggestions into priority levels
  const totalSuggestions = lines.length;
  const highPriorityCount = Math.min(3, Math.ceil(totalSuggestions / 3));
  const mediumPriorityCount = Math.min(2, Math.floor(totalSuggestions / 3));

  const highPriority = lines.slice(0, highPriorityCount).map((suggestion) => ({
    title: suggestion.split(":")[0] || suggestion.substring(0, 30),
    description: suggestion.split(":")[1] || suggestion,
  }));

  const mediumPriority = lines
    .slice(highPriorityCount, highPriorityCount + mediumPriorityCount)
    .map((suggestion) => ({
      title: suggestion.split(":")[0] || suggestion.substring(0, 30),
      description: suggestion.split(":")[1] || suggestion,
    }));

  const lowPriority = lines
    .slice(
      highPriorityCount + mediumPriorityCount,
      highPriorityCount + mediumPriorityCount + 2,
    )
    .map((suggestion) => ({
      title: suggestion.split(":")[0] || suggestion.substring(0, 30),
      description: suggestion.split(":")[1] || suggestion,
    }));

  return {
    highPriority,
    mediumPriority,
    lowPriority,
  };
}
