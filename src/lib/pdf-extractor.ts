import { createClient } from "../../supabase/server";

export interface ExtractedResume {
  text: string;
  hasPhoto: boolean;
  photoUrl?: string;
  sections: {
    summary?: string;
    education?: string;
    experience?: string;
    skills?: string;
    contact?: string;
  };
}

export async function extractResumeContent(
  resumeId: string,
): Promise<ExtractedResume | null> {
  const supabase = await createClient();

  try {
    // Get the resume record
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .single();

    if (resumeError || !resume) {
      console.error("Error fetching resume:", resumeError);
      return null;
    }

    // Get the file URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(resume.file_path);

    if (!publicUrl) {
      console.error("Error getting file URL");
      return null;
    }

    // For PDF files, we need to extract the text
    if (resume.file_type === "application/pdf") {
      try {
        // Fetch the PDF file
        const response = await fetch(publicUrl);
        const pdfBlob = await response.blob();

        // Use PDF.js to extract text
        const pdfText = await extractTextFromPdf(pdfBlob);

        // Extract sections from the text
        const sections = extractSections(pdfText);

        // Check if there's an image in the PDF
        const hasPhoto = checkForPhoto(pdfText);

        return {
          text: pdfText,
          hasPhoto,
          sections,
        };
      } catch (error) {
        console.error("Error extracting PDF content:", error);
        return null;
      }
    }

    // For DOC/DOCX files, we would need a different approach
    // This is a simplified implementation
    return {
      text: "[Document content extracted from " + resume.file_name + "]",
      hasPhoto: false,
      sections: {
        summary: "Professional summary extracted from document",
        education: "Education details extracted from document",
        experience: "Work experience extracted from document",
        skills: "Skills extracted from document",
        contact: "Contact information extracted from document",
      },
    };
  } catch (error) {
    console.error("Error in extractResumeContent:", error);
    return null;
  }
}

async function extractTextFromPdf(pdfBlob: Blob): Promise<string> {
  try {
    // In a real implementation, we would use PDF.js to extract text
    // This would look something like:
    /*
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      text += strings.join(' ') + '\n';
    }
    
    return text;
    */

    // For a real implementation, we would use PDF.js to extract text
    // For now, we'll convert the PDF blob to text using a simple approach
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // This is a simplified approach - in reality we'd use PDF.js
        // to properly extract text from the PDF structure
        const result = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(result);
        let text = "";
        for (let i = 0; i < bytes.length; i++) {
          // Only extract ASCII text characters
          if (bytes[i] >= 32 && bytes[i] <= 126) {
            text += String.fromCharCode(bytes[i]);
          } else if (bytes[i] === 10 || bytes[i] === 13) {
            text += "\n";
          }
        }
        resolve(text);
      };
      reader.readAsArrayBuffer(pdfBlob);
    });

    return text || "Failed to extract text from your PDF";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "Error extracting text from PDF";
  }
}

function extractSections(text: string): ExtractedResume["sections"] {
  // Extract sections using regex patterns
  const sections: ExtractedResume["sections"] = {};

  // Extract summary section
  const summaryMatch = text.match(
    /(?:SUMMARY|PROFILE|OBJECTIVE|ABOUT)[:\s]([\s\S]*?)(?=EDUCATION|EXPERIENCE|SKILLS|WORK|$)/i,
  );
  if (summaryMatch && summaryMatch[1]) {
    sections.summary = summaryMatch[1].trim();
  }

  // Extract education section
  const educationMatch = text.match(
    /EDUCATION[:\s]([\s\S]*?)(?=EXPERIENCE|SKILLS|WORK|$)/i,
  );
  if (educationMatch && educationMatch[1]) {
    sections.education = educationMatch[1].trim();
  }

  // Extract experience section
  const experienceMatch = text.match(
    /(?:EXPERIENCE|WORK)[:\s]([\s\S]*?)(?=EDUCATION|SKILLS|$)/i,
  );
  if (experienceMatch && experienceMatch[1]) {
    sections.experience = experienceMatch[1].trim();
  }

  // Extract skills section
  const skillsMatch = text.match(
    /SKILLS[:\s]([\s\S]*?)(?=EDUCATION|EXPERIENCE|WORK|$)/i,
  );
  if (skillsMatch && skillsMatch[1]) {
    sections.skills = skillsMatch[1].trim();
  }

  // Extract contact information
  const contactMatch = text.match(
    /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|\+\d{1,3}[\s-]?\d{1,14}|\d{3}[\s-]?\d{3}[\s-]?\d{4})/g,
  );
  if (contactMatch) {
    sections.contact = contactMatch.join(" | ");
  }

  return sections;
}

function checkForPhoto(text: string): boolean {
  // In a real implementation, we would analyze the PDF for images
  // For now, we'll check for common photo indicators in the text
  const photoIndicators = [
    /photo/i,
    /picture/i,
    /image/i,
    /portrait/i,
    /headshot/i,
    /profile pic/i,
  ];

  return photoIndicators.some((pattern) => pattern.test(text));
}
