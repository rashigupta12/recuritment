/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, Attachment as GraphAttachment, EmailRecipients } from '@/lib/mail/mailer3';

interface EmailRequest {
    from_email: string;
    to_email: string;
    cc?: string;
    bcc?: string;
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
        let senderEmail = emailData.username;

        // Fetch user details
        if (emailData.username) {
            console.log('🔍 Fetching user details for:', emailData.username);
            
            try {
                const cookies = request.headers.get('cookie') || '';
                const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_dev_prod_FRAPPE_BASE_URL;

                const userResponse = await fetch(
                    `${FRAPPE_BASE_URL}/resource/User/${encodeURIComponent(emailData.username)}?fields=["full_name","email"]`,
                    {
                        method: 'GET',
                        headers: {
                            'Cookie': cookies,
                        },
                    }
                );

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    const fullName = userData.data?.full_name;
                    if (fullName) {
                        senderName = fullName;
                    }
                    senderEmail = userData.data?.email || emailData.username;
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

        // Prepare HTML content
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

        // Get resume attachments
        const attachments = await getResumeAttachmentsForGraph(emailData.applicants);

        console.log(`📧 Preparing to send email with ${attachments.length} attachments`);

        // Prepare recipients object
        const recipients: EmailRecipients = {};
        if (toEmails.length > 0) recipients.to = toEmails;
        if (ccEmails.length > 0) recipients.cc = ccEmails;
        if (bccEmails.length > 0) recipients.bcc = bccEmails;

        // Send ONE email with all recipients (To, CC, BCC)
        const result = await sendEmail(
            senderName,
            recipients,
            emailData.subject,
            htmlContent,
            senderEmail,
            attachments
        );

        console.log(`📧 Email sending completed:`);
        console.log(`Status: ${result.success ? 'Success' : 'Failed'}`);
        if (!result.success) {
            console.log(`❌ Error: ${result.error}`);
        }
        console.log(`📎 Attachments sent: ${attachments.length}`);

        if (!result.success) {
            return NextResponse.json({
                success: false,
                message: 'Email failed to send',
                result: result,
                sentFrom: senderEmail,
                error: result.error
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Email sent successfully to ${toEmails.length} recipients (${ccEmails.length} CC, ${bccEmails.length} BCC)`,
            result: result,
            sentFrom: senderEmail,
            recipients: {
                to: toEmails.length,
                cc: ccEmails.length,
                bcc: bccEmails.length
            },
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
            
            console.log(`✅ Successfully downloaded file, size: ${buffer.length} bytes`);
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

// Helper function to handle resume attachments for Graph API
async function getResumeAttachmentsForGraph(applicants: any[]): Promise<GraphAttachment[]> {
    const attachments: GraphAttachment[] = [];
    const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL;

    console.log('🔍 Processing applicants for attachments...');

    for (const applicant of applicants) {
        if (applicant.resume_attachment) {
            try {
                console.log(`\n📎 Processing resume for: ${applicant.applicant_name || applicant.name}`);

                let fileData: { buffer: Buffer; base64: string } | null = null;
                let filename = `${applicant.applicant_name || applicant.name || 'applicant'}_resume.pdf`;
                const resumePath = applicant.resume_attachment;

                if (resumePath.startsWith('/files/')) {
                    const fullUrl = `${baseUrl}${resumePath}`;
                    fileData = await downloadFileFromUrl(fullUrl);
                    
                    if (fileData) {
                        const pathParts = resumePath.split('/');
                        const originalFilename = pathParts[pathParts.length - 1];
                        if (originalFilename && originalFilename.includes('.')) {
                            filename = originalFilename;
                        }
                    }
                }
                else if (resumePath.startsWith('http')) {
                    fileData = await downloadFileFromUrl(resumePath);
                    
                    if (fileData) {
                        const url = new URL(resumePath);
                        const pathname = url.pathname;
                        if (pathname.includes('.') && !pathname.endsWith('/')) {
                            const urlFilename = pathname.split('/').pop();
                            if (urlFilename) {
                                filename = urlFilename;
                            }
                        }
                    }
                }
                else if (resumePath.startsWith('data:')) {
                    const matches = resumePath.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
                    if (matches && matches.length === 3) {
                        const base64Content = matches[2];
                        const buffer = Buffer.from(base64Content, 'base64');
                        fileData = { buffer, base64: base64Content };
                        
                        const mimeType = matches[1];
                        const ext = mimeType.split('/')[1] || 'pdf';
                        filename = `${applicant.applicant_name || applicant.name || 'applicant'}_resume.${ext}`;
                    }
                }

                if (fileData && fileData.buffer.length > 0) {
                    const getContentTypeFromFilename = (filename: string): string => {
                        const extension = filename.split('.').pop()?.toLowerCase();
                        const contentTypes: { [key: string]: string } = {
                            'pdf': 'application/pdf',
                            'doc': 'application/msword',
                            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'txt': 'text/plain'
                        };
                        return contentTypes[extension || ''] || 'application/octet-stream';
                    };

                    const attachment: GraphAttachment = {
                        filename: filename,
                        content: fileData.base64,
                        contentType: getContentTypeFromFilename(filename)
                    };

                    attachments.push(attachment);
                    console.log(`✅ Resume attached: ${filename}`);
                }

            } catch (error) {
                console.error(`❌ Failed to attach resume for ${applicant.applicant_name || applicant.name}:`, error);
            }
        }
    }

    console.log(`\n📦 Total attachments: ${attachments.length}`);
    return attachments;
}