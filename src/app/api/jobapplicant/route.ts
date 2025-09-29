//  /api/jobapplicant/route.ts
import { NextRequest, NextResponse } from "next/server";

// Configuration
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
const MAX_TEXT_LENGTH = 15000;
const MIN_TEXT_LENGTH = 100;

const SUPPORTED_MIME_TYPES = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/pdf": "pdf",
  "text/plain": "txt",
};

function determineFileType(fileUrl:any, contentType:any, fileName:any) {
  if (contentType && SUPPORTED_MIME_TYPES[contentType]) {
    return SUPPORTED_MIME_TYPES[contentType];
  }
  const url = fileName || fileUrl;
  const extension = url.toLowerCase().split(".").pop();
  switch (extension) {
    case "pdf": return "pdf";
    case "docx": return "docx";
    case "txt": return "txt";
    default: throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT files.");
  }
}

async function extractTextFromPDF(buffer:any) {
  try {
    const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
    console.log("Extracting text from PDF buffer, size:", buffer.length);
    const data = await pdfParse(buffer);
    if (!data.text || data.text.trim().length === 0) {
      throw new Error("No readable text found in PDF.");
    }
    const cleanText = data.text
      .replace(/\f/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    console.log("PDF text extracted successfully, length:", cleanText.length);
    return {
      text: cleanText,
      pages: data.numpages,
      metadata: data.info,
    };
  } catch (error:any) {
    console.error("PDF extraction error:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

async function extractTextFromWord(buffer:any) {
  try {
    const mammoth = (await import("mammoth")).default;
    console.log("Extracting text from Word buffer, size:", buffer.length);
    const result = await mammoth.extractRawText({ buffer, options: { includeDefaultStyleMap: true } });
    if (!result.value || result.value.trim().length === 0) {
      throw new Error("No text found in the Word document.");
    }
    const cleanText = result.value
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    console.log("Word text extracted successfully, length:", cleanText.length);
    return {
      text: cleanText,
      warnings: result.messages || [],
    };
  } catch (error) {
    console.error("Word extraction error:", error);
    throw new Error(`Failed to extract text from Word document: ${error.message}`);
  }
}

function validateAndCleanText(text, filename) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text extracted from document");
  }
  const trimmedText = text.trim();
  if (trimmedText.length < MIN_TEXT_LENGTH) {
    throw new Error(`Document too short (${trimmedText.length} characters).`);
  }
  if (trimmedText.length > MAX_TEXT_LENGTH) {
    console.log(`Truncating text from ${trimmedText.length} to ${MAX_TEXT_LENGTH} characters for ${filename}`);
    return trimmedText.substring(0, MAX_TEXT_LENGTH) + "\n\n[Document truncated for processing...]";
  }
  return trimmedText;
}

const createAutofillPrompt = (resumeText) => `
You are an expert resume parser. Extract information from the provided resume and return a JSON object matching the exact structure below. Fill in all fields based on the resume content, and leave fields empty ("" for strings, [] for arrays, 0 for numbers) if the information is not found. Pay special attention to identifying the current company (set "current_company": 1 if the position is ongoing, otherwise 0).

Return ONLY valid JSON in this structure:

{
  "applicant_name": "",
  "email_id": "",
  "phone_number": "",
  "country": "",
  "job_title": "",
  "resume_attachment": "",
  "custom_experience": [
    {
      "company_name": "",
      "designation": "",
      "start_date": "",
      "end_date": "",
      "current_company": 0
    }
  ],
  "custom_education": [
    {
      "degree": "",
      "specialization": "",
      "institution": "",
      "year_of_passing": 0,
      "percentagecgpa": 0
    }
  ]
}

EXTRACTION INSTRUCTIONS:
1. **Personal Info**: Extract name, email, phone, and country from contact sections or headers.
2. **Job Title**: Use the job title mentioned in the resume or the most recent position title if no specific job title is provided.
3. **Experience**: Include all work experiences, with accurate start/end dates (format: "YYYY-MM-DD"). Set "current_company": 1 for the current role (no end date or marked as "Present").
4. **Education**: Extract degree, specialization, institution, year of passing, and CGPA/percentage. Use 0 for missing numerical fields.
5. **Dates**: Use "YYYY-MM-DD" format for dates. If only the year is provided, use "YYYY-01-01". If no end date or "Present", set "end_date": "" and "current_company": 1.
6. **Resume Attachment**: Leave as "" (will be filled by the API).
7. **Missing Data**: Use empty strings, empty arrays, or 0 for missing fields.

Resume Content:
${resumeText}
`;

async function callMistralAPIForAutofill(resumeText, retries = 2) {
  const prompt = createAutofillPrompt(resumeText);

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
          max_tokens: 2000,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Mistral API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from Mistral API");
      }

      const jsonString = data.choices[0].message.content.trim();
      let parsedJSON;
      try {
        const cleanJsonString = jsonString.replace(/^```json\n?/, "").replace(/\n?```$/, "");
        parsedJSON = JSON.parse(cleanJsonString);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from AI: ${parseError.message}`);
      }

      return {
        structuredData: parsedJSON,
        tokensUsed: data.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error(`Autofill API attempt ${attempt + 1} failed:`, error);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Main POST handler with enhanced debugging
export async function POST(request) {
  const startTime = Date.now();
  
  try {
    console.log("=== AUTOFILL APPLICATION PROCESSING START ===");
    console.log("Request URL:", request.url);
    console.log("Request method:", request.method);
    
    // Validate API key first
    if (!MISTRAL_API_KEY) {
      console.error("MISTRAL_API_KEY not configured");
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Parse FormData with error handling
    let formData;
    try {
      formData = await request.formData();
      console.log("FormData parsed successfully");
    } catch (formDataError) {
      console.error("Failed to parse FormData:", formDataError);
      return NextResponse.json(
        { error: "Invalid form data. Please ensure you're uploading a valid file." },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const jobTitle = formData.get('jobTitle') as string;

    console.log("Form data extracted:", {
      hasFile: !!file,
      fileName,
      jobTitle,
      fileSize: file?.size,
      fileType: file?.type
    });

    if (!file) {
      console.error("No file provided");
      return NextResponse.json(
        { error: "No file provided. Please upload a resume file." },
        { status: 400 }
      );
    }

    if (!fileName) {
      console.error("No fileName provided");
      return NextResponse.json(
        { error: "File name is required." },
        { status: 400 }
      );
    }

    // Convert File to Buffer with error handling
    let arrayBuffer;
    let fileBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      console.log("File converted to buffer successfully, size:", fileBuffer.length);
    } catch (bufferError) {
      console.error("Failed to convert file to buffer:", bufferError);
      return NextResponse.json(
        { error: "Failed to process the uploaded file. Please try again." },
        { status: 400 }
      );
    }

    const size = fileBuffer.length;

    // Validate file size
    if (size > MAX_FILE_SIZE) {
      console.error(`File too large: ${size} bytes`);
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 413 }
      );
    }

    // Determine file type
    let fileType;
    try {
      const contentType = file.type;
      fileType = determineFileType(fileName, contentType, fileName);
      console.log(`File type determined: ${fileType} (content-type: ${contentType})`);
    } catch (typeError) {
      console.error("Unsupported file type:", typeError);
      return NextResponse.json(
        { error: typeError.message },
        { status: 415 }
      );
    }

    // Extract text based on file type
    let extractionResult;
    try {
      console.log(`Starting text extraction for ${fileType}...`);
      switch (fileType) {
        case "docx":
          extractionResult = await extractTextFromWord(fileBuffer);
          break;
        case "pdf":
          extractionResult = await extractTextFromPDF(fileBuffer);
          break;
        case "txt":
          extractionResult = { text: fileBuffer.toString("utf-8") };
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
      console.log("Text extraction completed successfully");
    } catch (extractionError) {
      console.error("Text extraction failed:", extractionError);
      return NextResponse.json(
        { error: `Failed to extract text from ${fileType.toUpperCase()} file: ${extractionError.message}` },
        { status: 400 }
      );
    }

    // Validate and clean text
    let resumeText;
    try {
      resumeText = validateAndCleanText(extractionResult.text, fileName);
      console.log(`Text validated and cleaned: ${resumeText.length} characters`);
    } catch (validationError) {
      console.error("Text validation failed:", validationError);
      return NextResponse.json(
        { error: validationError.message },
        { status: 400 }
      );
    }

    // Call Mistral API for autofill JSON
    let structuredData, tokensUsed;
    try {
      console.log("Calling Mistral API...");
      const apiResult = await callMistralAPIForAutofill(resumeText);
      structuredData = apiResult.structuredData;
      tokensUsed = apiResult.tokensUsed;
      console.log("Mistral API call successful");
    } catch (apiError) {
      console.error("Mistral API call failed:", apiError);
      return NextResponse.json(
        { error: "Failed to process resume with AI service. Please try again." },
        { status: 502 }
      );
    }

    // Add job_title and resume_attachment
    structuredData.job_title = jobTitle || structuredData.job_title || "";
    structuredData.resume_attachment = fileName;

    // Calculate processing time
    const processingTime = Date.now() - startTime;
    console.log(`Processing completed successfully in ${processingTime}ms`);

    // Return response
    const response = {
      success: true,
      data: structuredData,
      metadata: {
        fileName,
        fileType,
        fileSize: size,
        processingTime,
        tokensUsed,
        textLength: resumeText.length,
      },
    };

    console.log("Sending successful response");
    return NextResponse.json(response);

  } catch (error) {
    console.error("=== AUTOFILL APPLICATION PROCESSING ERROR ===");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);

    // Determine error type and status
    let statusCode = 500;
    let errorMessage = "An unexpected error occurred while processing the resume.";

    if (error.message.includes("Mistral API error") || error.message.includes("Invalid JSON response")) {
      statusCode = 502;
      errorMessage = "AI service unavailable or returned invalid data.";
    } else if (error.message.includes("File too large")) {
      statusCode = 413;
      errorMessage = error.message;
    } else if (error.message.includes("Unsupported file type")) {
      statusCode = 415;
      errorMessage = error.message;
    } else if (error.message.includes("Failed to extract") || error.message.includes("too short")) {
      statusCode = 400;
      errorMessage = error.message;
    }

    const errorResponse = {
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending error response:", errorResponse);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}