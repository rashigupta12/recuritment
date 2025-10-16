
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, Attachment as GraphAttachment } from '@/lib/mail/mailer3'; // Import from mailer3

interface EmailRequest {
    from_email: string;
    to_email: string;
    cc?: string; // Add optional CC field
    bcc?: string; // Add optional BCC field
    subject: string;
    designation?: string;
    message: string;
    job_id: string;
    username?: string;
    applicants: Array<{
        name: string;
        applicant_name: string;
        email_id: string;
        designation: string;
        resume_attachment?: string;
    }>;
}

export async function POST(request: NextRequest) {
    try {
        const emailData: EmailRequest = await request.json();

        // Validate required fields
        if (!emailData.to_email && !emailData.cc && !emailData.bcc) {
            return NextResponse.json(
                { error: 'At least one recipient (To, CC, or BCC) is required' },
                { status: 400 }
            );
        }

        // Validate email addresses
        const validateEmails = (emails?: string): string[] => {
            if (!emails) return [];
            const emailArray = emails.split(',').map(email => email.trim()).filter(email => email);
            const invalidEmails = emailArray.filter(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
            if (invalidEmails.length > 0) {
                throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
            }
            return emailArray;
        };

        const toEmails = validateEmails(emailData.to_email);
        const ccEmails = validateEmails(emailData.cc);
        const bccEmails = validateEmails(emailData.bcc);

        if (toEmails.length === 0 && ccEmails.length === 0 && bccEmails.length === 0) {
            return NextResponse.json(
                { error: 'No valid recipient email addresses provided' },
                { status: 400 }
            );
        }

        let senderName = process.env.COMPANY_NAME || 'HevHire';
        let senderEmail = emailData.username; // This will be used as the sender email

        // If username is provided, try to get full name for sender name
        if (emailData.username) {
            console.log('🔍 Fetching user details for:', emailData.username);
            
            try {
                const cookies = request.headers.get('cookie') || '';
                const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_dev_prod_FRAPPE_BASE_URL;

                // Fetch user's full name
                const userResponse = await fetch(
                    `${FRAPPE_BASE_URL}/resource/User/${encodeURIComponent(emailData.username)}?fields=["full_name","email"]`,
                    {
                        method: 'GET',
                        headers: {
                            'Cookie': cookies,
                        },
                    }
                );

                console.log('User Response Status:', userResponse.status);

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    console.log('User Data:', JSON.stringify(userData, null, 2));
                    
                    const fullName = userData.data?.full_name;
                    if (fullName) {
                        senderName = fullName;
                    }
                    
                    // Use the email from user data if available, otherwise use username as email
                    senderEmail = userData.data?.email || emailData.username;
                } else {
                    console.warn('⚠️ Could not fetch User details:', await userResponse.text());
                }
            } catch (fetchError) {
                console.error('⚠️ Error fetching user details:', fetchError);
            }
        }

        // Validate sender email
        if (!senderEmail) {
            return NextResponse.json(
                { error: 'Sender email (username) is required' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(senderEmail)) {
            return NextResponse.json(
                { error: 'Invalid sender email format' },
                { status: 400 }
            );
        }

        console.log(`📧 Sending email using Microsoft Graph API`);
        console.log(`Sender: ${senderName} <${senderEmail}>`);
        console.log(`To: ${toEmails.join(',') || 'none'}`);
        console.log(`CC: ${ccEmails.join(',') || 'none'}`);
        console.log(`BCC: ${bccEmails.join(',') || 'none'}`);

        // Prepare HTML content with the same template
        const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
      
      <!-- Header with White Background for Logo -->
      <div style="background: #ffffff; padding: 25px; text-align: center; border-bottom: 4px solid #1e3a8a;">
          <img src="https://recruitment-hevhire.vercel.app/_next/image?url=%2Fbrands%2Fdefault%2Fimage.png&w=384&q=75" 
               alt="HevHire Logo" 
               style="max-width: 160px; margin-bottom: 4px;" />
          <p style="color: #1e3a8a; font-size: 14px; margin: 0; font-weight: 500;">The Hiring Evolution</p>
      </div>

      <!-- Message Body -->
      <div style="padding: 25px; background: #f9fafb;">
          <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin: 0;">
              ${emailData.message.replace(/\n/g, '<br>')}
          </p>
      </div>

      <!-- Footer -->
      <div style="padding: 20px; background: #1e3a8a; text-align: center; color: #f8fafc;">
          <p style="margin: 0; font-size: 14px;">This email was sent from <strong style="color: #ffffff;">HevHire</strong></p>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Sent by ${senderName}</p>
      </div>
  </div>
`;

        // Get resume attachments in Graph API format
        const attachments = await getResumeAttachmentsForGraph(emailData.applicants);

        console.log(`📧 Preparing to send email with ${attachments.length} attachments`);
        console.log(`To: ${toEmails.join(',') || 'none'}`);
        console.log(`CC: ${ccEmails.join(',') || 'none'}`);
        console.log(`BCC: ${bccEmails.join(',') || 'none'}`);

        // Send emails to all recipients using mailer3.ts function
        const emailResults = [];
        
        // Send to "To" recipients
        for (const recipient of toEmails) {
            console.log(`📨 Sending email to: ${recipient}`);
            const result = await sendEmail(
                senderName,           // senderHeader
                recipient,            // email (recipient)
                emailData.subject,    // subject
                htmlContent,          // content
                senderEmail,          // userEmail (sender's email - logged in user)
                attachments           // attachments
            );
            emailResults.push(result);
            console.log(`✅ Email to ${recipient}: ${result.success ? 'Success' : 'Failed'}`);
            if (!result.success) {
                console.log(`❌ Error: ${result.error}`);
            }
        }

        // Send to "CC" recipients
        for (const recipient of ccEmails) {
            console.log(`📨 Sending CC email to: ${recipient}`);
            const result = await sendEmail(
                senderName,           // senderHeader
                recipient,            // email (recipient)
                emailData.subject,    // subject
                htmlContent,          // content
                senderEmail,          // userEmail (sender's email - logged in user)
                attachments           // attachments
            );
            emailResults.push(result);
            console.log(`✅ CC Email to ${recipient}: ${result.success ? 'Success' : 'Failed'}`);
            if (!result.success) {
                console.log(`❌ Error: ${result.error}`);
            }
        }

        // Send to "BCC" recipients
        for (const recipient of bccEmails) {
            console.log(`📨 Sending BCC email to: ${recipient}`);
            const result = await sendEmail(
                senderName,           // senderHeader
                recipient,            // email (recipient)
                emailData.subject,    // subject
                htmlContent,          // content
                senderEmail,          // userEmail (sender's email - logged in user)
                attachments           // attachments
            );
            emailResults.push(result);
            console.log(`✅ BCC Email to ${recipient}: ${result.success ? 'Success' : 'Failed'}`);
            if (!result.success) {
                console.log(`❌ Error: ${result.error}`);
            }
        }

        // Check if all emails were sent successfully
        const successfulEmails = emailResults.filter(result => result.success);
        const failedEmails = emailResults.filter(result => !result.success);

        console.log(`📧 Email sending completed:`);
        console.log(`✅ Successful: ${successfulEmails.length}`);
        console.log(`❌ Failed: ${failedEmails.length}`);
        console.log(`📎 Attachments sent: ${attachments.length}`);

        if (failedEmails.length > 0) {
            console.error('Failed emails:', failedEmails);
            return NextResponse.json({
                success: false,
                message: `Some emails failed to send (${successfulEmails.length} successful, ${failedEmails.length} failed)`,
                results: emailResults,
                sentFrom: senderEmail,
                totalSent: successfulEmails.length,
                totalFailed: failedEmails.length,
                attachmentsSent: attachments.length,
                errors: failedEmails.map(e => ({ email: e.email, error: e.error }))
            }, { status: 207 }); // 207 Multi-Status
        }

        return NextResponse.json({
            success: true,
            message: `All emails sent successfully (${successfulEmails.length} emails)`,
            results: emailResults,
            sentFrom: senderEmail,
            totalSent: successfulEmails.length,
            totalFailed: failedEmails.length,
            attachmentsSent: attachments.length
        });

    } catch (error: any) {
        console.error('❌ Error sending email:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send email' },
            { status: 500 }
        );
    }
}

// Helper function to download file from public URL and convert to base64
async function downloadFileFromUrl(fileUrl: string): Promise<{ buffer: Buffer; base64: string } | null> {
    try {
        console.log(`🔗 Downloading file from: ${fileUrl}`);

        const response = await fetch(fileUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log(`📡 Response status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            
            console.log(`✅ Successfully downloaded file, size: ${buffer.length} bytes, base64 length: ${base64.length}`);
            return { buffer, base64 };
        } else {
            console.warn(`❌ Failed to download file: ${response.status} ${response.statusText}`);
            return null;
        }

    } catch (error) {
        console.error('❌ Error downloading file:', error);
        return null;
    }
}

// Improved helper function to handle resume attachments for Graph API
async function getResumeAttachmentsForGraph(applicants: any[]): Promise<GraphAttachment[]> {
    const attachments: GraphAttachment[] = [];
    const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL;

    console.log('🔍 API - Processing applicants for attachments:');
    applicants.forEach((applicant, index) => {
        console.log(`Applicant ${index + 1}:`, {
            name: applicant.applicant_name,
            resume_attachment: applicant.resume_attachment,
            hasResume: !!applicant.resume_attachment
        });
    });

    for (const applicant of applicants) {
        if (applicant.resume_attachment) {
            try {
                console.log(`\n📎 Processing resume for: ${applicant.applicant_name || applicant.name}`);
                console.log(`Resume value: "${applicant.resume_attachment}"`);

                let fileData: { buffer: Buffer; base64: string } | null = null;
                let filename = `${applicant.applicant_name || applicant.name || 'applicant'}_resume.pdf`;
                const resumePath = applicant.resume_attachment;

                // Handle Frappe file paths (starting with /files/)
                if (resumePath.startsWith('/files/')) {
                    console.log('📁 Detected Frappe file path');
                    
                    // Construct the full public URL
                    const fullUrl = `${baseUrl}${resumePath}`;

                    console.log(`🔗 Constructed full URL: ${fullUrl}`);
                    
                    // Download the file
                    fileData = await downloadFileFromUrl(fullUrl);
                    
                    if (fileData) {
                        // Extract filename from path
                        const pathParts = resumePath.split('/');
                        const originalFilename = pathParts[pathParts.length - 1];
                        if (originalFilename && originalFilename.includes('.')) {
                            filename = originalFilename;
                            console.log(`📁 Using filename from path: ${filename}`);
                        }
                    }
                }
                // Handle HTTP URLs (direct full URLs)
                else if (resumePath.startsWith('http')) {
                    console.log('🔗 Detected HTTP URL');
                    fileData = await downloadFileFromUrl(resumePath);
                    
                    if (fileData) {
                        // Try to get filename from URL
                        const url = new URL(resumePath);
                        const pathname = url.pathname;
                        if (pathname.includes('.') && !pathname.endsWith('/')) {
                            const urlFilename = pathname.split('/').pop();
                            if (urlFilename) {
                                filename = urlFilename;
                                console.log(`📁 Using filename from URL: ${filename}`);
                            }
                        }
                    }
                }
                // Handle Base64 data URLs
                else if (resumePath.startsWith('data:')) {
                    console.log('📄 Detected Base64 data URL');
                    try {
                        const matches = resumePath.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
                        if (matches && matches.length === 3) {
                            const base64Content = matches[2];
                            const buffer = Buffer.from(base64Content, 'base64');
                            fileData = { buffer, base64: base64Content };
                            console.log(`✅ Successfully decoded base64, size: ${buffer.length} bytes`);
                            
                            const mimeType = matches[1];
                            const ext = mimeType.split('/')[1] || 'pdf';
                            filename = `${applicant.applicant_name || applicant.name || 'applicant'}_resume.${ext}`;
                            console.log(`📁 Using filename: ${filename}`);
                        } else {
                            console.warn('❌ Invalid base64 data URL format');
                        }
                    } catch (base64Error) {
                        console.warn(`❌ Error processing base64 resume:`, base64Error);
                    }
                }
                // Unknown format
                else {
                    console.log('❓ Unknown resume format:', resumePath);
                }

                // Add attachment if we have the file data
                if (fileData && fileData.buffer.length > 0) {
                    // Determine content type from filename
                    const getContentTypeFromFilename = (filename: string): string => {
                        const extension = filename.split('.').pop()?.toLowerCase();
                        const contentTypes: { [key: string]: string } = {
                            'pdf': 'application/pdf',
                            'doc': 'application/msword',
                            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'xls': 'application/vnd.ms-excel',
                            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            'ppt': 'application/vnd.ms-powerpoint',
                            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            'txt': 'text/plain',
                            'csv': 'text/csv',
                            'png': 'image/png',
                            'jpg': 'image/jpeg',
                            'jpeg': 'image/jpeg',
                            'gif': 'image/gif',
                            'webp': 'image/webp',
                            'bmp': 'image/bmp',
                            'svg': 'image/svg+xml',
                            'zip': 'application/zip',
                            'rar': 'application/x-rar-compressed'
                        };
                        return contentTypes[extension || ''] || 'application/octet-stream';
                    };

                    const attachment: GraphAttachment = {
                        filename: filename,
                        content: fileData.base64, // Base64 encoded content for Graph API
                        contentType: getContentTypeFromFilename(filename)
                    };

                    attachments.push(attachment);
                    console.log(`✅ Resume attached: ${filename} (${fileData.buffer.length} bytes)`);
                } else {
                    console.warn(`❌ No file data created for ${applicant.applicant_name || applicant.name}`);
                }

            } catch (error) {
                console.error(`❌ Failed to attach resume for ${applicant.applicant_name || applicant.name}:`, error);
            }
        } else {
            console.log(`📭 No resume_attachment field for: ${applicant.applicant_name || applicant.name}`);
        }
    }

    console.log(`\n📦 Final attachments: ${attachments.length} files`);
    attachments.forEach((att, index) => {
        console.log(`  ${index + 1}. ${att.filename} (content length: ${att.content.length} chars)`);
    });

    return attachments;
}