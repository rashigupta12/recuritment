/*eslint-disable @typescript-eslint/no-explicit-any*/
import { ClientSecretCredential } from '@azure/identity';

export interface Attachment {
  filename: string;
  content: string; // Base64 encoded content
  contentType?: string;
  disposition?: 'attachment' | 'inline'; // Added for calendar invites
  contentId?: string; // Optional for inline attachments
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  email: string;
  timestamp: string;
}

export interface EmailRecipients {
  to?: string[];
  cc?: string[];
  bcc?: string[];
}

// Azure AD Configuration
const getAzureConfig = () => ({
  tenantId: process.env.AZURE_TENANT_ID!,
  clientId: process.env.AZURE_CLIENT_ID!,
  clientSecret: process.env.AZURE_CLIENT_SECRET!,
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
  if (!attachment.filename) {
    throw new Error('Attachment filename is required');
  }
  
  if (!attachment.content) {
    throw new Error('Attachment content is required (base64 encoded)');
  }

  const graphAttachment: any = {
    '@odata.type': '#microsoft.graph.fileAttachment',
    name: attachment.filename,
    contentType: attachment.contentType || getContentType(attachment.filename),
    contentBytes: attachment.content
  };

  // Add contentId for inline attachments if provided
  if (attachment.contentId) {
    graphAttachment.contentId = attachment.contentId;
    graphAttachment.isInline = attachment.disposition === 'inline';
  }

  return graphAttachment;
}

// Helper function to determine content type from filename
function getContentType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const contentTypes: { [key: string]: string } = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'ics': 'text/calendar; method=REQUEST', // Calendar invite
    'default': 'application/octet-stream'
  };

  return contentTypes[extension || ''] || contentTypes.default;
}

// Validate attachment size (Microsoft Graph has limits)
function validateAttachmentSize(contentBytes: string): void {
  const sizeInBytes = (contentBytes.length * 3) / 4;
  const maxSize = 3 * 1024 * 1024; // 3MB limit for Graph API
  
  if (sizeInBytes > maxSize) {
    throw new Error(`Attachment size exceeds 3MB limit: ${(sizeInBytes / (1024 * 1024)).toFixed(2)}MB`);
  }
}

// Send email using Microsoft Graph API with CC and BCC support
async function sendEmailViaGraph(
  senderHeader: string,
  recipients: EmailRecipients,
  subject: string,
  htmlContent: string,
  userEmail: string,
  attachments?: Attachment[]
): Promise<void> {
  const accessToken = await getGraphAccessToken();

  // Validate userEmail format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
      from: {
        emailAddress: {
          name: senderHeader,
          address: userEmail
        }
      }
    },
    saveToSentItems: true
  };

  // Add To recipients
  if (recipients.to && recipients.to.length > 0) {
    message.message.toRecipients = recipients.to.map(email => ({
      emailAddress: { address: email }
    }));
  }

  // Add CC recipients
  if (recipients.cc && recipients.cc.length > 0) {
    message.message.ccRecipients = recipients.cc.map(email => ({
      emailAddress: { address: email }
    }));
  }

  // Add BCC recipients
  if (recipients.bcc && recipients.bcc.length > 0) {
    message.message.bccRecipients = recipients.bcc.map(email => ({
      emailAddress: { address: email }
    }));
  }

  // Process attachments if provided
  if (attachments?.length) {
    const totalSize = attachments.reduce((total, att) => {
      const sizeInBytes = (att.content.length * 3) / 4;
      return total + sizeInBytes;
    }, 0);
    
    if (totalSize > 25 * 1024 * 1024) {
      throw new Error('Total attachments size exceeds 25MB limit');
    }

    message.message.attachments = attachments.map(attachment => {
      validateAttachmentSize(attachment.content);
      return prepareAttachmentForGraph(attachment);
    });
  }

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${userEmail}/sendMail`,
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

// Updated sendEmail function to support CC and BCC
export const sendEmail = async (
  senderHeader: string,
  recipients: EmailRecipients,
  subject: string,
  content: string,
  userEmail: string,
  attachments?: Attachment[]
): Promise<EmailResult> => {
  const timestamp = new Date().toISOString();

  try {
    await sendEmailViaGraph(senderHeader, recipients, subject, content, userEmail, attachments);

    // Return combined list of all recipients for logging
    const allRecipients = [
      ...(recipients.to || []),
      ...(recipients.cc || []),
      ...(recipients.bcc || [])
    ].join(', ');

    return {
      success: true,
      messageId: `graph-${Date.now()}@${userEmail.split('@')[1]}`,
      email: allRecipients,
      timestamp
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Email sending error:', error);
    
    const allRecipients = [
      ...(recipients.to || []),
      ...(recipients.cc || []),
      ...(recipients.bcc || [])
    ].join(', ');

    return {
      success: false,
      error: errorMessage,
      email: allRecipients,
      timestamp
    };
  }
};