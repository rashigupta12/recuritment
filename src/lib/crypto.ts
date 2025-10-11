// lib/crypto.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

// Generate a consistent key from the environment variable
function getKey(): Buffer {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  
  if (!encryptionKey) {
    throw new Error("ENCRYPTION_KEY is not set in environment variables");
  }
  
  // Create a 32-byte key from the encryption key
  return crypto.createHash("sha256").update(encryptionKey).digest();
}

/**
 * Encrypts a text string using AES-256-CBC encryption
 * @param text - The plain text to encrypt
 * @returns Encrypted text in format: "iv:encryptedData"
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error("Text to encrypt cannot be empty");
  }
  
  const KEY = getKey();
  const IV = crypto.randomBytes(16); // Generate new IV for each encryption
  
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  // Return IV:encryptedData format
  return `${IV.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts an encrypted text string
 * @param encryptedText - Encrypted text in format: "iv:encryptedData"
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(":")) {
    throw new Error("Invalid encrypted text format");
  }
  
  const KEY = getKey();
  const [ivHex, encrypted] = encryptedText.split(":");
  
  if (!ivHex || !encrypted) {
    throw new Error("Invalid encrypted text format");
  }
  
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}