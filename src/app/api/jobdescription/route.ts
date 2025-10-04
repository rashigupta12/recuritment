//app/api/jobdescription/route.ts
import { NextRequest, NextResponse } from "next/server";

// Configuration
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
const MAX_TEXT_LENGTH = 15000;
const MIN_TEXT_LENGTH = 50;

const SUPPORTED_MIME_TYPES: Record<string, string> = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/pdf": "pdf",
  "text/plain": "txt",
};

function determineFileType(fileUrl: string, contentType: string | null, fileName: string): string {
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

async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pages: number; metadata: Record<string, unknown> }> {
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("PDF extraction error:", error);
    throw new Error(`Failed to extract text from PDF: ${message}`);
  }
}

interface Message {
  message: string;
  type: string;
}

interface MammothOptions {
  includeDefaultStyleMap?: boolean;
}

interface Input {
  buffer: Buffer;
  options?: MammothOptions;
}

async function extractTextFromWord(buffer: Buffer): Promise<{ text: string; warnings: string[] }> {
  try {
    const mammoth = (await import("mammoth")).default;
    console.log("Extracting text from Word buffer, size:", buffer.length);
    const result = await mammoth.extractRawText({ buffer, options: { includeDefaultStyleMap: true } } as Input);
    if (!result.value || result.value.trim().length === 0) {
      throw new Error("No text found in the Word document.");
    }
    const cleanText = result.value
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    console.log("Word text extracted successfully, length:", cleanText.length);
    const warnings = result.messages ? result.messages.map((msg: Message) => msg.message) : [];
    return {
      text: cleanText,
      warnings,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Word extraction error:", error);
    throw new Error(`Failed to extract text from Word document: ${message}`);
  }
}

function validateAndCleanText(text: string | undefined, filename: string): string {
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

// Updated prompt to generate concise bullet-point summaries
const createJobDescriptionPrompt = (jdText: string): string => `
You are an expert recruiter summarizing job descriptions. Create a CONCISE bullet-point summary that recruiters can quickly scan.

Your task:
1. Extract ONLY the most important information
2. Format as clean bullet points
3. Keep it brief - recruiters should understand the role in 30 seconds
4. Return ONLY plain text bullet points (no HTML, no markdown, no formatting)

Include ONLY these key points (if available):
• Role title and level
• 2-3 key responsibilities
• 2-3 must-have technical skills or qualifications
• Experience required (years)
• Any standout details (salary range, location, benefits)

Guidelines:
- Use simple bullet points (•)
- Each point should be ONE short line (max 10-15 words)
- NO HTML tags, NO markdown
- Remove fluff and corporate jargon
- Focus on what matters to candidates
- Maximum 6-8 bullet points total

Job Description Content:
${jdText}

Return ONLY the bullet-point summary:
`;

async function callMistralAPIForJobDescription(jdText: string, retries: number = 2): Promise<{ formattedDescription: string; tokensUsed: number }> {
  const prompt = createJobDescriptionPrompt(jdText);

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
          temperature: 0.3,
          max_tokens: 500, // Reduced since we only need a summary
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as { error?: { message?: string } }));
        const errorMessage = errorData.error?.message || "Unknown error";
        throw new Error(`Mistral API error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { total_tokens?: number };
      };
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from Mistral API");
      }

      const formattedDescription = data.choices[0].message.content?.trim() ?? "";
      
      if (!formattedDescription) {
        throw new Error("Empty response from AI service");
      }

      return {
        formattedDescription,
        tokensUsed: data.usage?.total_tokens || 0,
      };
    } catch (error: unknown) {
      console.error(`Job description API attempt ${attempt + 1} failed:`, error);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error("All attempts failed");
}

// Main POST handler
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("=== JOB DESCRIPTION PROCESSING START ===");
    console.log("Request URL:", request.url);
    
    // Validate API key
    if (!MISTRAL_API_KEY) {
      console.error("MISTRAL_API_KEY not configured");
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Parse FormData
    let formData: FormData;
    try {
      formData = await request.formData();
      console.log("FormData parsed successfully");
    } catch (formDataError: unknown) {
      const message = formDataError instanceof Error ? formDataError.message : "Unknown error";
      console.error("Failed to parse FormData:", formDataError);
      return NextResponse.json(
        { error: `Invalid form data: ${message}` },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;
    const fileName = formData.get('fileName') as string | null;

    console.log("Form data extracted:", {
      hasFile: !!file,
      fileName,
      fileSize: file?.size,
      fileType: file?.type
    });

    if (!file) {
      console.error("No file provided");
      return NextResponse.json(
        { error: "No file provided. Please upload a job description file." },
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

    // Convert File to Buffer
    let arrayBuffer: ArrayBuffer;
    let fileBuffer: Buffer;
    try {
      arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      console.log("File converted to buffer successfully, size:", fileBuffer.length);
    } catch (bufferError: unknown) {
      const message = bufferError instanceof Error ? bufferError.message : "Unknown error";
      console.error("Failed to convert file to buffer:", bufferError);
      return NextResponse.json(
        { error: `Failed to process the uploaded file: ${message}` },
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
    let fileType: string;
    try {
      const contentType = file.type || null;
      fileType = determineFileType(fileName, contentType, fileName);
      console.log(`File type determined: ${fileType}`);
    } catch (typeError: unknown) {
      const message = typeError instanceof Error ? typeError.message : "Unknown error";
      console.error("Unsupported file type:", typeError);
      return NextResponse.json(
        { error: message },
        { status: 415 }
      );
    }

    // Extract text based on file type
    let extractionResult: { text: string; pages?: number; metadata?: Record<string, unknown>; warnings?: string[] };
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
    } catch (extractionError: unknown) {
      const message = extractionError instanceof Error ? extractionError.message : "Unknown error";
      console.error("Text extraction failed:", extractionError);
      return NextResponse.json(
        { error: `Failed to extract text from ${fileType.toUpperCase()} file: ${message}` },
        { status: 400 }
      );
    }

    // Validate and clean text
    let jdText: string;
    try {
      jdText = validateAndCleanText(extractionResult.text, fileName);
      console.log(`Text validated and cleaned: ${jdText.length} characters`);
    } catch (validationError: unknown) {
      const message = validationError instanceof Error ? validationError.message : "Unknown error";
      console.error("Text validation failed:", validationError);
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    // Call Mistral API to generate concise summary
    let formattedDescription: string;
    let tokensUsed: number;
    try {
      console.log("Calling Mistral API for summary...");
      const apiResult = await callMistralAPIForJobDescription(jdText);
      if (!apiResult) {
        throw new Error("No result returned from Mistral API");
      }
      formattedDescription = apiResult.formattedDescription;
      tokensUsed = apiResult.tokensUsed;
      console.log("Mistral API call successful");
    } catch (apiError: unknown) {
      console.error("Mistral API call failed:", apiError);
      return NextResponse.json(
        { error: "Failed to process job description with AI service. Please try again." },
        { status: 502 }
      );
    }

    // Calculate processing time
    const processingTime = Date.now() - startTime;
    console.log(`Processing completed successfully in ${processingTime}ms`);

    // Return response
    const response = {
      success: true,
      description: formattedDescription,
      metadata: {
        fileName,
        fileType,
        fileSize: size,
        processingTime,
        tokensUsed,
        textLength: jdText.length,
      },
    };

    console.log("Sending successful response");
    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error("=== JOB DESCRIPTION PROCESSING ERROR ===");
    console.error("Error details:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }

    let statusCode = 500;
    let errorMessage = "An unexpected error occurred while processing the job description.";
    const details: string | undefined = process.env.NODE_ENV === "development" 
      ? (error instanceof Error ? error.message : "Unknown error")
      : undefined;

    if (error instanceof Error) {
      if (error.message.includes("Mistral API error") || error.message.includes("Invalid response")) {
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
    }

    const errorResponse = {
      error: errorMessage,
      details,
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