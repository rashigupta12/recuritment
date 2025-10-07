/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface EmailRequest {
    from_email: string;
    to_email: string;
    subject: string;
    designation?: string;
    message: string;
    job_id: string;
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
        if (!emailData.to_email || !emailData.subject || !emailData.message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        
        // Create transporter using company SMTP configuration
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_SERVER,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: parseInt(process.env.SMTP_PORT || '587') === 465,
            auth: {
                user: process.env.COMPANY_EMAIL,
                pass: process.env.COMPANY_EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Get resume attachments
        const attachments = await getResumeAttachments(emailData.applicants);

        // Email options
        const mailOptions = {
            from: `"${process.env.COMPANY_NAME}" <${process.env.COMPANY_EMAIL}>`,
            to: emailData.to_email,
            subject: emailData.subject,
            text: emailData.message,
html: `
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

      <!-- Candidate Summary -->
      <div style="padding: 25px; background: white; border-top: 1px solid #e5e7eb;">
          <h3 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px;">Candidate Summary:</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
              ${emailData.applicants.map((applicant, index) => `
                  <li style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                      <strong style="color: #0f172a;">${index + 1}. ${applicant.applicant_name || 'N/A'}</strong><br>
                      ${applicant.email_id ? `<span style="color: #475569;">Email:</span> ${applicant.email_id}<br>` : ''}
                      ${applicant.designation ? `<span style="color: #475569;">Position:</span> ${applicant.designation}<br>` : ''}
                  </li>
              `).join('')}
          </ul>
      </div>

      <!-- Attachment Summary -->
      <div style="padding: 15px; background: #eff6ff; border-top: 1px solid #cbd5e1;">
          <p style="margin: 0; color: #1e40af; font-size: 14px; text-align: center;">
              📎 Total resumes attached: ${attachments.length} out of ${emailData.applicants.length} applicants
          </p>
      </div>

      <!-- Footer -->
      <div style="padding: 20px; background: #1e3a8a; text-align: center; color: #f8fafc;">
          <p style="margin: 0; font-size: 14px;">This email was sent from <strong style="color: #ffffff;">HevHire</strong></p>
      </div>
  </div>
`,

            attachments: attachments
        };

        console.log(`📧 Preparing to send email with ${attachments.length} attachments`);

        // Send email
        const result = await transporter.sendMail(mailOptions);
        
        console.log('📧 Email sent successfully:', result.messageId);
        console.log(`📎 Attachments sent: ${attachments.length}`);

        return NextResponse.json({
            success: true,
            messageId: result.messageId,
            attachmentsSent: attachments.length,
            message: 'Email sent successfully'
        });

    } catch (error: any) {
        console.error('❌ Error sending email:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send email' },
            { status: 500 }
        );
    }
}

// Helper function to download file from public URL
async function downloadFileFromUrl(fileUrl: string): Promise<Buffer | null> {
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
            
            console.log(`✅ Successfully downloaded file, size: ${buffer.length} bytes`);
            return buffer;
        } else {
            console.warn(`❌ Failed to download file: ${response.status} ${response.statusText}`);
            return null;
        }

    } catch (error) {
        console.error('❌ Error downloading file:', error);
        return null;
    }
}

// Improved helper function to handle resume attachments
async function getResumeAttachments(applicants: any[]) {
    const attachments = [];
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

                let fileBuffer: Buffer | null = null;
                let filename = `${applicant.applicant_name || applicant.name || 'applicant'}_resume.pdf`;
                const resumePath = applicant.resume_attachment;

                // Handle Frappe file paths (starting with /files/)
                if (resumePath.startsWith('/files/')) {
                    console.log('📁 Detected Frappe file path');
                    
                    // Construct the full public URL
                    const fullUrl = `${baseUrl}${resumePath}`;

                    console.log(`🔗 Constructed full URL: ${fullUrl}`);
                    
                    // Download the file
                    fileBuffer = await downloadFileFromUrl(fullUrl);
                    
                    if (fileBuffer) {
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
                    fileBuffer = await downloadFileFromUrl(resumePath);
                    
                    if (fileBuffer) {
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
                            fileBuffer = Buffer.from(matches[2], 'base64');
                            console.log(`✅ Successfully decoded base64, size: ${fileBuffer.length} bytes`);
                            
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

                // Add attachment if we have the file buffer
                if (fileBuffer && fileBuffer.length > 0) {
                    attachments.push({
                        filename: filename,
                        content: fileBuffer
                    });
                    console.log(`✅ Resume attached: ${filename} (${fileBuffer.length} bytes)`);
                } else {
                    console.warn(`❌ No file buffer created for ${applicant.applicant_name || applicant.name}`);
                    // Don't create placeholder files - we want to know which resumes failed
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
        console.log(`  ${index + 1}. ${att.filename} (${att.content.length} bytes)`);
    });

    return attachments;
}