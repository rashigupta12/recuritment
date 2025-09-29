// components/JDUploadSection.tsx
"use client";

import { frappeAPI } from "@/lib/api/frappeClient";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface JDUploadSectionProps {
  onJDParsed: (formattedHTML: string, structuredData: any) => void;
  disabled?: boolean;
}

export const JDUploadSection: React.FC<JDUploadSectionProps> = ({ 
  onJDParsed, 
  disabled = false 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseSuccess, setParseSuccess] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setError("");
    setIsUploading(true);
    setUploadedFile(file);

    try {
  
      
      const uploadResult = await frappeAPI.upload(file, {
        is_private: false,
     
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload file");
      }

      // Construct full URL from file_url
      const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || "";
      const fileUrl = `${baseUrl}${uploadResult.file_url}`;

      // Step 2: Parse the JD
      setIsUploading(false);
      setIsParsing(true);

      const parseResponse = await fetch("/api/process-job-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl,
          fileName: file.name,
        }),
      });

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(errorData.error || "Failed to parse job description");
      }

      const parseData = await parseResponse.json();

      // Step 3: Call parent callback with parsed data
      onJDParsed(parseData.formattedHTML, parseData.structuredData);
      
      setParseSuccess(true);
      setTimeout(() => setParseSuccess(false), 3000);
    } catch (err: any) {
      console.error("JD Upload Error:", err);
      setError(err.message || "Failed to process job description");
    } finally {
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  const handlePasteJD = async () => {
    try {
      const text = await navigator.clipboard.readText();
      
      if (!text || text.trim().length < 50) {
        setError("Please copy a valid job description first");
        return;
      }

      setError("");
      setIsParsing(true);

      const parseResponse = await fetch("/api/process-job-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jdText: text,
        }),
      });

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(errorData.error || "Failed to parse job description");
      }

      const parseData = await parseResponse.json();
      onJDParsed(parseData.formattedHTML, parseData.structuredData);
      
      setParseSuccess(true);
      setTimeout(() => setParseSuccess(false), 3000);
    } catch (err: any) {
      console.error("JD Paste Error:", err);
      setError(err.message || "Failed to process pasted text");
    } finally {
      setIsParsing(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setError("");
    setParseSuccess(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
        <FileText className="h-4 w-4 mr-2" />
        Upload Job Description
      </h3>

      <div className="space-y-3">
        {/* File Upload Button */}
        <div className="flex items-center gap-2">
          <label
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded text-sm transition-colors ${
              disabled || isUploading || isParsing
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
            }`}
          >
            {isUploading || isParsing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isUploading ? "Uploading..." : "Parsing..."}</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload JD File</span>
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              disabled={disabled || isUploading || isParsing}
            />
          </label>

          {/* OR Divider */}
          <span className="text-sm text-gray-500">or</span>

          {/* Paste Button */}
          <button
            onClick={handlePasteJD}
            disabled={disabled || isUploading || isParsing}
            className={`flex items-center space-x-2 px-4 py-2 rounded text-sm transition-colors ${
              disabled || isUploading || isParsing
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Paste from Clipboard</span>
          </button>
        </div>

        {/* Uploaded File Display */}
        {uploadedFile && (
          <div className="flex items-center justify-between bg-white rounded p-2 border border-gray-200">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700">{uploadedFile.name}</span>
            </div>
            <button
              onClick={clearFile}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {parseSuccess && (
          <div className="bg-green-50 border border-green-200 rounded p-2 text-sm text-green-800 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Job description parsed successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        {/* Info Text */}
        <p className="text-xs text-gray-600">
          Supported formats: PDF, DOCX, DOC, TXT. Max size: 16MB
        </p>
      </div>
    </div>
  );
};