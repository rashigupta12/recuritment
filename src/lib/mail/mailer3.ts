/*eslint-disable @typescript-eslint/no-explicit-any*/
import { ClientSecretCredential } from '@azure/identity';

export interface Attachment {
  filename: string;
  content: string; // Base64 encoded content
  contentType?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  email: string;
  timestamp: string;
}

// Azure AD Configuration
const getAzureConfig = () => ({
  tenantId: process.env.AZURE_TENANT_ID!,
  clientId: process.env.AZURE_CLIENT_ID!,
  clientSecret: process.env.AZURE_CLIENT_SECRET!,
  // mailUser is now removed from here since we'll use the parameter
});

// Get Azure OAuth2 access token for Graph API
async function getGraphAccessToken(): Promise<string> {
  const config = getAzureConfig();
  const credential = new ClientSecretCredential(
    config.tenantId,
    config.clientId,
    config.clientSecret
  );
  
  const token = await credential.getToken('https://graph.microsoft.com/.default');
  return token.token;
}

// Prepare attachment for Graph API
function prepareAttachmentForGraph(attachment: Attachment) {
  // Validate required fields
  if (!attachment.filename) {
    throw new Error('Attachment filename is required');
  }
  
  if (!attachment.content) {
    throw new Error('Attachment content is required (base64 encoded)');
  }

  return {
    '@odata.type': '#microsoft.graph.fileAttachment',
    name: attachment.filename,
    contentType: attachment.contentType || getContentType(attachment.filename),
    contentBytes: attachment.content
  };
}

// Helper function to determine content type from filename
function getContentType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const contentTypes: { [key: string]: string } = {
    // Images
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Text files
    'txt': 'text/plain',
    'csv': 'text/csv',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    
    // Default
    'default': 'application/octet-stream'
  };

  return contentTypes[extension || ''] || contentTypes.default;
}

// Validate attachment size (Microsoft Graph has limits)
function validateAttachmentSize(contentBytes: string): void {
  // Convert base64 to approximate size in bytes
  const sizeInBytes = (contentBytes.length * 3) / 4;
  const maxSize = 3 * 1024 * 1024; // 3MB limit for Graph API
  
  if (sizeInBytes > maxSize) {
    throw new Error(`Attachment size exceeds 3MB limit: ${(sizeInBytes / (1024 * 1024)).toFixed(2)}MB`);
  }
}

// Send email using Microsoft Graph API
async function sendEmailViaGraph(
  senderHeader: string,
  recipientEmail: string,
  subject: string,
  htmlContent: string,
  userEmail: string, // Added userEmail parameter
  attachments?: Attachment[]
): Promise<void> {
  const config = getAzureConfig();
  const accessToken = await getGraphAccessToken();

  // Validate recipient email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipientEmail)) {
    throw new Error('Invalid recipient email format');
  }

  // Validate userEmail format as well
  if (!emailRegex.test(userEmail)) {
    throw new Error('Invalid user email format');
  }

  const message: any = {
    message: {
      subject,
      body: {
        contentType: 'HTML',
        content: htmlContent
      },
      toRecipients: [{
        emailAddress: { address: recipientEmail }
      }],
      from: {
        emailAddress: {
          name: senderHeader,
          address: userEmail // Use the userEmail parameter instead of config.mailUser
        }
      }
    },
    saveToSentItems: true
  };

  // Process attachments if provided
  if (attachments?.length) {
    // Validate total attachments size
    const totalSize = attachments.reduce((total, att) => {
      const sizeInBytes = (att.content.length * 3) / 4;
      return total + sizeInBytes;
    }, 0);
    
    if (totalSize > 25 * 1024 * 1024) { // 25MB total limit
      throw new Error('Total attachments size exceeds 25MB limit');
    }

    message.message.attachments = attachments.map(attachment => {
      validateAttachmentSize(attachment.content);
      return prepareAttachmentForGraph(attachment);
    });
  }

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${userEmail}/sendMail`, // Use userEmail in the URL
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Graph API error: ${response.status} - ${errorText}`);
  }
}

export const sendEmail = async (
  senderHeader: string,
  email: string,
  subject: string,
  content: string,
  userEmail: string, // Moved before optional attachments parameter
  attachments?: Attachment[]
): Promise<EmailResult> => {
  const timestamp = new Date().toISOString();

  try {
    await sendEmailViaGraph(senderHeader, email, subject, content, userEmail, attachments);

    return {
      success: true,
      messageId: `graph-${Date.now()}@${userEmail.split('@')[1]}`, // Use userEmail for messageId
      email,
      timestamp
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Email sending error:', error);
    
    return {
      success: false,
      error: errorMessage,
      email,
      timestamp
    };
  }
};