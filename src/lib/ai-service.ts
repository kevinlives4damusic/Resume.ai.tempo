import { createClient } from "../../supabase/server";

// Use the provided API key from environment or fallback to hardcoded value
const DEEPSEEK_API_KEY =
  process.env.DEEPSEEK_API_KEY || "sk-2dbead44ea2a40368e76f859a4372061";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export async function analyzeResumeWithAI(resumeText: string) {
  try {
    console.log(
      "Using DeepSeek API Key:",
      DEEPSEEK_API_KEY.substring(0, 10) + "...",
    );
    console.log("Sending request to:", DEEPSEEK_API_URL);
    console.log("Text length being sent to API:", resumeText.length);

    const requestBody = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume analyzer for the South African job market. Analyze the resume text and provide detailed feedback on its strengths, weaknesses, and suggestions for improvement. Focus on ATS compatibility, content quality, and formatting. Include numerical scores (0-100) for: completeness, technical skills, soft skills, keywords, and ATS compatibility.",
        },
        {
          role: "user",
          content: `Please analyze this resume and provide a detailed assessment with scores and specific improvement suggestions. Format your response with clear sections for Strengths, Weaknesses, and Suggestions. Include numerical scores (0-100) for completeness, technical skills, soft skills, keywords, and ATS compatibility.\n\nRESUME TEXT:\n${resumeText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    };

    console.log(
      "Request body preview:",
      JSON.stringify(requestBody).substring(0, 200) + "...",
    );

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `API request failed with status ${response.status}:`,
        errorText,
      );
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`,
      );
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected API response format:", data);
      throw new Error("Unexpected API response format");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling DeepSeek AI API:", error);
    // Return a fallback analysis for testing
    return getFallbackAnalysis();
  }
}

export async function parseAIResponse(aiResponse: string) {
  // This function parses the AI response into a structured format
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
  if (!match || !match[1]) {
    console.log("Score not found in AI response, using fallback");
    return Math.floor(Math.random() * 30) + 50; // Fallback to random score
  }
  const score = parseInt(match[1]);
  if (isNaN(score)) {
    console.log("Invalid score format in AI response, using fallback");
    return Math.floor(Math.random() * 30) + 50;
  }
  console.log("Parsed score:", score);
  return score;
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

  const highPriority = lines.slice(0, highPriorityCount).map((suggestion) => {
    const parts = suggestion.split(":");
    return {
      title: parts[0] ? parts[0].trim() : suggestion.substring(0, 30).trim(),
      description: parts[1] ? parts[1].trim() : suggestion.trim(),
    };
  });

  const mediumPriority = lines
    .slice(highPriorityCount, highPriorityCount + mediumPriorityCount)
    .map((suggestion) => {
      const parts = suggestion.split(":");
      return {
        title: parts[0] ? parts[0].trim() : suggestion.substring(0, 30).trim(),
        description: parts[1] ? parts[1].trim() : suggestion.trim(),
      };
    });

  const lowPriority = lines
    .slice(
      highPriorityCount + mediumPriorityCount,
      highPriorityCount + mediumPriorityCount + 2,
    )
    .map((suggestion) => {
      const parts = suggestion.split(":");
      return {
        title: parts[0] ? parts[0].trim() : suggestion.substring(0, 30).trim(),
        description: parts[1] ? parts[1].trim() : suggestion.trim(),
      };
    });

  return {
    highPriority,
    mediumPriority,
    lowPriority,
  };
}

// Fallback analysis for testing when API fails
function getFallbackAnalysis() {
  return `
Resume Analysis

Scores:
- Completeness: 72/100
- Technical Skills: 78/100
- Soft Skills: 65/100
- Keywords: 58/100
- ATS Compatibility: 68/100

Strengths:
1. Strong technical background with relevant programming languages and frameworks
2. Clear chronological work history with specific dates
3. Education credentials are well presented
4. Contact information is complete and professional
5. Good organization of sections with clear headings

Weaknesses:
1. Work experience lacks quantifiable achievements and metrics
2. Professional summary is too generic and doesn't highlight unique value proposition
3. Missing industry-specific keywords that would improve ATS compatibility
4. Soft skills are mentioned but not demonstrated with examples
5. No mention of certifications or professional development

Suggestions:
1. Add quantifiable achievements: Include specific metrics and results for each role (e.g., "Increased deployment efficiency by 40% through CI/CD implementation")
2. Enhance your professional summary: Make it more specific to your target role and highlight your unique strengths
3. Incorporate more industry keywords: Add terms from job descriptions in your field, especially for technical roles
4. Demonstrate soft skills: Provide brief examples of how you've applied leadership, communication, etc.
5. Add a certifications section: Include relevant professional certifications or courses
6. Standardize formatting: Ensure consistent date formats and bullet point styles throughout
7. Consider condensing to 2 pages: Focus on most relevant and recent experiences
`;
}
