// app/api/process-jd/route.ts

import { NextRequest, NextResponse } from "next/server";

// Configuration
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
const MAX_TEXT_LENGTH = 15000;
const MIN_TEXT_LENGTH = 50;

// Supported file types
const SUPPORTED_MIME_TYPES = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "application/pdf": "pdf",
  "text/plain": "txt",
} as const;

interface JDStructuredData {
  jobInfo: {
    title: string;
    company: string;
    location: string;
    workMode: string;
    employmentType: string;
    duration: string;
    stipend: string;
    salary: string;
    workingDays: string;
  };
  aboutCompany: string;
  roleDescription: string;
  responsibilities: string[];
  requiredSkills: string[];
  qualifications: string[];
  preferredSkills: string[];
  benefits: string[];
  contactInfo: {
    email: string;
    phone: string;
    website: string;
    applyLink: string;
  };
  extractedUrls: string[];
}

// URL Extraction Functions
function extractUrlsFromText(text: string): string[] {
  const urlPatterns = [
    /https?:\/\/(?:[-\w.])+(?:\.[a-zA-Z]{2,})+(?:\/(?:[\w\._~!$&'()*+,;=:@]|%[0-9a-fA-F]{2})*)*(?:\?(?:[\w\._~!$&'()*+,;=:@/?]|%[0-9a-fA-F]{2})*)?(?:#(?:[\w\._~!$&'()*+,;=:@/?]|%[0-9a-fA-F]{2})*)?/gi,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
    /(?:^|\s)((?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+(?:com|org|net|edu|gov|io|co|ai|dev|in))(?:\s|$)/gi,
  ];

  const extractedUrls = new Set<string>();
  
  urlPatterns.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      let url = match[0].trim().replace(/^[\s\(\[\{]+|[\s\)\]\}.,;:!?]+$/g, '');
      
      if (!url.startsWith('http') && !url.includes('@') && url.includes('.')) {
        url = 'https://' + url;
      }
      
      if (url.length > 5) {
        extractedUrls.add(url);
      }
    });
  });

  return Array.from(extractedUrls);
}

// Create JD parsing prompt
const createJDExtractionPrompt = (jdText: string, extractedUrls: string[]) => `
You are an expert Job Description parser. Extract all information from the following job description and convert it into a structured JSON format.

EXTRACTED URLS FROM JD:
${JSON.stringify(extractedUrls, null, 2)}

Return ONLY valid JSON in this exact structure:

{
  "jobInfo": {
    "title": "",
    "company": "",
    "location": "",
    "workMode": "",
    "employmentType": "",
    "duration": "",
    "stipend": "",
    "salary": "",
    "workingDays": ""
  },
  "aboutCompany": "",
  "roleDescription": "",
  "responsibilities": [],
  "requiredSkills": [],
  "qualifications": [],
  "preferredSkills": [],
  "benefits": [],
  "contactInfo": {
    "email": "",
    "phone": "",
    "website": "",
    "applyLink": ""
  },
  "extractedUrls": []
}

EXTRACTION INSTRUCTIONS:
1. Extract job title, company name, location, and work mode (Remote/Hybrid/On-site)
2. Identify employment type (Full-time/Part-time/Internship/Contract)
3. Extract stipend/salary information including currency
4. List all responsibilities as separate bullet points
5. Separate required skills from preferred/nice-to-have skills
6. Extract educational qualifications and experience requirements
7. List all benefits and perks offered
8. Extract all contact information (email, phone, website, apply links)
9. Include all URLs found in the JD

Job Description Content:
${jdText}`;

// Create HTML formatted JD
const createFormattedJDHTML = (structuredData: JDStructuredData): string => {
  const sections: string[] = [];

  // About Company
  if (structuredData.aboutCompany) {
    sections.push(`<h4>About Us</h4><p>${structuredData.aboutCompany}</p>`);
  }

  // Role Description
  if (structuredData.roleDescription) {
    sections.push(`<p>${structuredData.roleDescription}</p>`);
  }

  // Responsibilities
  if (structuredData.responsibilities.length > 0) {
    sections.push(`<h4>Key Responsibilities</h4><ul>${structuredData.responsibilities.map(r => `<li>${r}</li>`).join('')}</ul>`);
  }

  // Required Skills
  if (structuredData.requiredSkills.length > 0) {
    sections.push(`<h4>Required Skills & Qualifications</h4><ul>${structuredData.requiredSkills.map(s => `<li>${s}</li>`).join('')}</ul>`);
  }

  // Qualifications
  if (structuredData.qualifications.length > 0) {
    sections.push(`<ul>${structuredData.qualifications.map(q => `<li>${q}</li>`).join('')}</ul>`);
  }

  // Duration
  if (structuredData.jobInfo.duration) {
    sections.push(`<h4>Duration</h4><p>${structuredData.jobInfo.duration}</p>`);
  }

  // Benefits
  if (structuredData.benefits.length > 0) {
    sections.push(`<h4>What We Offer</h4><ul>${structuredData.benefits.map(b => `<li>${b}</li>`).join('')}</ul>`);
  }

  return `<div class="ql-editor read-mode">\n  ${sections.join('\n\n  ')}\n</div>`;
};

// Call Mistral API for JD parsing
async function callMistralAPIForJD(jdText: string, retries = 2) {
  const extractedUrls = extractUrlsFromText(jdText);
  console.log('Extracted URLs:', extractedUrls);

  const prompt = createJDExtractionPrompt(jdText, extractedUrls);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 8000,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Mistral API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`
        );
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message) {
        throw new Error("Invalid response format from Mistral API");
      }

      const jsonString = data.choices[0].message.content.trim();
      const cleanJsonString = jsonString.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      const parsedJSON: JDStructuredData = JSON.parse(cleanJsonString);

      // Add extracted URLs to the structure
      parsedJSON.extractedUrls = extractedUrls;

      // Generate formatted HTML
      const formattedHTML = createFormattedJDHTML(parsedJSON);

      return {
        structuredData: parsedJSON,
        formattedHTML,
        rawJSON: jsonString,
        tokensUsed: data.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error(`JD parsing attempt ${attempt + 1} failed:`, error);

      if (attempt === retries) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw new Error("All retry attempts failed");
}

// Fetch file from URL
async function fetchFileFromUrl(fileUrl: string) {
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  const buffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(buffer),
    contentType: response.headers.get("content-type") || "",
    size: Buffer.from(buffer).length,
  };
}

// Determine file type
function determineFileType(fileUrl: string, contentType: string, fileName: string): string {
  if (contentType && SUPPORTED_MIME_TYPES[contentType as keyof typeof SUPPORTED_MIME_TYPES]) {
    return SUPPORTED_MIME_TYPES[contentType as keyof typeof SUPPORTED_MIME_TYPES];
  }

  const extension = (fileName || fileUrl).toLowerCase().split(".").pop();
  
  if (extension === "pdf") return "pdf";
  if (extension === "docx") return "docx";
  if (extension === "doc") return "doc";
  if (extension === "txt") return "txt";
  
  throw new Error("Unsupported file type. Please upload PDF, DOCX, DOC, or TXT files.");
}

// PDF text extraction
async function extractTextFromPDF(buffer: Buffer) {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);

  if (!data.text || data.text.trim().length === 0) {
    throw new Error("No readable text found in PDF.");
  }

  return {
    text: data.text.replace(/\f/g, "\n").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim(),
    pages: data.numpages,
  };
}

// Word document extraction
async function extractTextFromWord(buffer: Buffer) {
  const mammoth = (await import("mammoth")).default;
  const result = await mammoth.extractRawText({ buffer });

  if (!result.value || result.value.trim().length === 0) {
    throw new Error("No text found in Word document.");
  }

  return {
    text: result.value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim(),
  };
}

// Validate text
function validateAndCleanText(text: string): string {
  const trimmedText = text.trim();

  if (trimmedText.length < MIN_TEXT_LENGTH) {
    throw new Error(`Document too short (${trimmedText.length} characters).`);
  }

  if (trimmedText.length > MAX_TEXT_LENGTH) {
    return trimmedText.substring(0, MAX_TEXT_LENGTH) + "\n\n[Document truncated...]";
  }

  return trimmedText;
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    console.log("=== JD PROCESSING START ===");

    if (!MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: "JD analysis service not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { fileUrl, fileName, jdText } = body;

    let extractedText = jdText;

    // If file URL provided, extract text from file
    if (fileUrl && fileName) {
      const { buffer, contentType, size } = await fetchFileFromUrl(fileUrl);
      const fileType = determineFileType(fileUrl, contentType, fileName);

      console.log(`Processing: ${fileName} (${fileType}, ${size} bytes)`);

      let extractionResult;
      switch (fileType) {
        case "pdf":
          extractionResult = await extractTextFromPDF(buffer);
          break;
        case "docx":
          extractionResult = await extractTextFromWord(buffer);
          break;
        case "txt":
          extractionResult = { text: buffer.toString("utf-8") };
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      extractedText = extractionResult.text;
    }

    if (!extractedText) {
      return NextResponse.json(
        { error: "No job description text provided." },
        { status: 400 }
      );
    }

    const validatedText = validateAndCleanText(extractedText);
    console.log(`Text extracted: ${validatedText.length} characters`);

    // Parse JD
    const result = await callMistralAPIForJD(validatedText);

    return NextResponse.json({
      success: true,
      structuredData: result.structuredData,
      formattedHTML: result.formattedHTML,
      metadata: {
        textLength: validatedText.length,
        tokensUsed: result.tokensUsed,
        urlsFound: result.structuredData.extractedUrls.length,
      },
    });
  } catch (error: any) {
    console.error("=== JD PROCESSING ERROR ===", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to process job description",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}