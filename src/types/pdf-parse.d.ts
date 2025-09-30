/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'pdf-parse/lib/pdf-parse.js' {
  export default function pdfParse(buffer: Buffer): Promise<{
    text: string;
    numpages: number;
    info: any;
    metadata: any;
    version: string;
  }>;
}