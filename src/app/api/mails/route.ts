/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { decrypt } from '@/lib/crypto';

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

        let userSmtpEmail = null;
        let userSmtpPassword = null;
        let senderName = process.env.COMPANY_NAME || 'HevHire';

        // Fetch user's SMTP credentials if username is provided
        if (emailData.username) {
            console.log('🔍 Fetching SMTP credentials for user:', emailData.username);
            
            try {
                const cookies = request.headers.get('cookie') || '';
                const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_dev_prod_FRAPPE_BASE_URL;

                // Fetch encrypted password from User Setting
                const userSettingResponse = await fetch(
                    `${FRAPPE_BASE_URL}/resource/User%20Setting/${encodeURIComponent(emailData.username)}?fields=["custom_mailp","full_name"]`,
                    {
                        method: 'GET',
                        headers: {
                            'Cookie': cookies,
                        },
                    }
                );

                console.log('User Setting Response Status:', userSettingResponse.status);

                let encryptedPassword = null;
                let fullName = null;

                if (userSettingResponse.ok) {
                    const userSettingData = await userSettingResponse.json();
                    console.log('User Setting Data:', JSON.stringify(userSettingData, null, 2));
                    
                    encryptedPassword = userSettingData.data?.custom_mailp;
                    fullName = userSettingData.data?.full_name;
                } else {
                    console.warn('⚠️ Could not fetch User Setting:', await userSettingResponse.text());
                }

                // Fetch SMTP email from User doctype
                const userResponse = await fetch(
                    `${FRAPPE_BASE_URL}/resource/User/${encodeURIComponent(emailData.username)}?fields=["custom_smtp_email","full_name","email"]`,
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
                    
                    userSmtpEmail = userData.data?.custom_smtp_email || userData.data?.email;
                    
                    if (!fullName) {
                        fullName = userData.data?.full_name;
                    }

                    if (userSmtpEmail && encryptedPassword) {
                        console.log('✅ Found user SMTP credentials');
                        console.log('SMTP Email:', userSmtpEmail);
                        console.log('Has encrypted password:', !!encryptedPassword);
                        
                        try {
                            userSmtpPassword = decrypt(encryptedPassword);
                            console.log('🔓 Password decrypted successfully');
                        } catch (decryptError) {
                            console.error('❌ Failed to decrypt password:', decryptError);
                            userSmtpPassword = null;
                        }

                        if (fullName) {
                            senderName = fullName;
                        }
                    } else {
                        console.log('ℹ️ No complete SMTP credentials found, using company credentials');
                        console.log('- SMTP Email:', userSmtpEmail ? 'Found' : 'Missing');
                        console.log('- Encrypted Password:', encryptedPassword ? 'Found' : 'Missing');
                    }
                } else {
                    console.warn('⚠️ Could not fetch User:', await userResponse.text());
                }
            } catch (fetchError) {
                console.error('⚠️ Error fetching user SMTP credentials:', fetchError);
                console.log('ℹ️ Falling back to company credentials');
            }
        }

        // Determine which credentials to use
        const useUserCredentials = !!(userSmtpEmail && userSmtpPassword);
        
        console.log(`📧 Sending email using ${useUserCredentials ? 'USER' : 'COMPANY'} credentials`);
        if (useUserCredentials) {
            console.log('Using email:', userSmtpEmail);
        }

        // Create transporter with appropriate credentials
        const transportOptions: SMTPTransport.Options = {
            host: process.env.SMTP_SERVER || 'crystal.herosite.pro',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true,
            auth: {
                user: (useUserCredentials ? userSmtpEmail : process.env.COMPANY_EMAIL) || '',
                pass: (useUserCredentials ? userSmtpPassword : process.env.COMPANY_EMAIL_PASSWORD) || '',
            },
            tls: {
                rejectUnauthorized: false
            }
        };

        const transporter = nodemailer.createTransport(transportOptions);


        // Email options
        const mailOptions = {
            from: `"${senderName}" <${useUserCredentials ? userSmtpEmail : process.env.COMPANY_EMAIL}>`,
            to: toEmails.length > 0 ? toEmails.join(',') : undefined,
            cc: ccEmails.length > 0 ? ccEmails.join(',') : undefined,
            bcc: bccEmails.length > 0 ? bccEmails.join(',') : undefined,
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




      <!-- Footer -->
      <div style="padding: 20px; background: #1e3a8a; text-align: center; color: #f8fafc;">
          <p style="margin: 0; font-size: 14px;">This email was sent from <strong style="color: #ffffff;">HevHire</strong></p>
          ${useUserCredentials ? `<p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Sent by ${senderName}</p>` : ''}
      </div>
  </div>
`,
            // attachments: attachments
        };

        // console.log(`📧 Preparing to send email with ${attachments.length} attachments`);
        console.log(`To: ${toEmails.join(',') || 'none'}`);
        console.log(`CC: ${ccEmails.join(',') || 'none'}`);
        console.log(`BCC: ${bccEmails.join(',') || 'none'}`);

        // Send email
        const result = await transporter.sendMail(mailOptions);
        
        console.log('📧 Email sent successfully:', result.messageId);
        // console.log(`📎 Attachments sent: ${attachments.length}`);

        return NextResponse.json({
            success: true,
            messageId: result.messageId,
            // attachmentsSent: attachments.length,
            message: 'Email sent successfully',
            sentFrom: useUserCredentials ? userSmtpEmail : process.env.COMPANY_EMAIL
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
// async function downloadFileFromUrl(fileUrl: string): Promise<Buffer | null> {
//     try {
//         console.log(`🔗 Downloading file from: ${fileUrl}`);

//         const response = await fetch(fileUrl, {
//             method: 'GET',
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//             }
//         });

//         console.log(`📡 Response status: ${response.status} ${response.statusText}`);

//         if (response.ok) {
//             const arrayBuffer = await response.arrayBuffer();
//             const buffer = Buffer.from(arrayBuffer);
            
//             console.log(`✅ Successfully downloaded file, size: ${buffer.length} bytes`);
//             return buffer;
//         } else {
//             console.warn(`❌ Failed to download file: ${response.status} ${response.statusText}`);
//             return null;
//         }

//     } catch (error) {
//         console.error('❌ Error downloading file:', error);
//         return null;
//     }
// }

// Improved helper function to handle resume attachments
// async function getResumeAttachments(applicants: any[]) {
//     const attachments = [];
//     const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL;

//     console.log('🔍 API - Processing applicants for attachments:');
//     applicants.forEach((applicant, index) => {
//         console.log(`Applicant ${index + 1}:`, {
//             name: applicant.applicant_name,
//             resume_attachment: applicant.resume_attachment,
//             hasResume: !!applicant.resume_attachment
//         });
//     });

//     for (const applicant of applicants) {
//         if (applicant.resume_attachment) {
//             try {
//                 console.log(`\n📎 Processing resume for: ${applicant.applicant_name || applicant.name}`);
//                 console.log(`Resume value: "${applicant.resume_attachment}"`);

//                 let fileBuffer: Buffer | null = null;
//                 let filename = `${applicant.applicant_name || applicant.name || 'applicant'}_resume.pdf`;
//                 const resumePath = applicant.resume_attachment;

//                 // Handle Frappe file paths (starting with /files/)
//                 if (resumePath.startsWith('/files/')) {
//                     console.log('📁 Detected Frappe file path');
                    
//                     // Construct the full public URL
//                     const fullUrl = `${baseUrl}${resumePath}`;

//                     console.log(`🔗 Constructed full URL: ${fullUrl}`);
                    
//                     // Download the file
//                     fileBuffer = await downloadFileFromUrl(fullUrl);
                    
//                     if (fileBuffer) {
//                         // Extract filename from path
//                         const pathParts = resumePath.split('/');
//                         const originalFilename = pathParts[pathParts.length - 1];
//                         if (originalFilename && originalFilename.includes('.')) {
//                             filename = originalFilename;
//                             console.log(`📁 Using filename from path: ${filename}`);
//                         }
//                     }
//                 }
//                 // Handle HTTP URLs (direct full URLs)
//                 else if (resumePath.startsWith('http')) {
//                     console.log('🔗 Detected HTTP URL');
//                     fileBuffer = await downloadFileFromUrl(resumePath);
                    
//                     if (fileBuffer) {
//                         // Try to get filename from URL
//                         const url = new URL(resumePath);
//                         const pathname = url.pathname;
//                         if (pathname.includes('.') && !pathname.endsWith('/')) {
//                             const urlFilename = pathname.split('/').pop();
//                             if (urlFilename) {
//                                 filename = urlFilename;
//                                 console.log(`📁 Using filename from URL: ${filename}`);
//                             }
//                         }
//                     }
//                 }
//                 // Handle Base64 data URLs
//                 else if (resumePath.startsWith('data:')) {
//                     console.log('📄 Detected Base64 data URL');
//                     try {
//                         const matches = resumePath.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
//                         if (matches && matches.length === 3) {
//                             fileBuffer = Buffer.from(matches[2], 'base64');
//                             console.log(`✅ Successfully decoded base64, size: ${fileBuffer.length} bytes`);
                            
//                             const mimeType = matches[1];
//                             const ext = mimeType.split('/')[1] || 'pdf';
//                             filename = `${applicant.applicant_name || applicant.name || 'applicant'}_resume.${ext}`;
//                             console.log(`📁 Using filename: ${filename}`);
//                         } else {
//                             console.warn('❌ Invalid base64 data URL format');
//                         }
//                     } catch (base64Error) {
//                         console.warn(`❌ Error processing base64 resume:`, base64Error);
//                     }
//                 }
//                 // Unknown format
//                 else {
//                     console.log('❓ Unknown resume format:', resumePath);
//                 }

//                 // Add attachment if we have the file buffer
//                 if (fileBuffer && fileBuffer.length > 0) {
//                     attachments.push({
//                         filename: filename,
//                         content: fileBuffer
//                     });
//                     console.log(`✅ Resume attached: ${filename} (${fileBuffer.length} bytes)`);
//                 } else {
//                     console.warn(`❌ No file buffer created for ${applicant.applicant_name || applicant.name}`);
//                 }

//             } catch (error) {
//                 console.error(`❌ Failed to attach resume for ${applicant.applicant_name || applicant.name}:`, error);
//             }
//         } else {
//             console.log(`📭 No resume_attachment field for: ${applicant.applicant_name || applicant.name}`);
//         }
//     }

//     console.log(`\n📦 Final attachments: ${attachments.length} files`);
//     attachments.forEach((att, index) => {
//         console.log(`  ${index + 1}. ${att.filename} (${att.content.length} bytes)`);
//     });

//     return attachments;
// }