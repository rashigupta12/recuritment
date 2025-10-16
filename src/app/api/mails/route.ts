/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, Attachment, EmailRecipients } from '@/lib/mail/mailer3';

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
    attachments?: Array<{
        filename: string;
        content: string;
        contentType?: string;
        disposition?: 'attachment' | 'inline';
        contentId?: string;
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
        const validateEmails = (emails?: string | string[]): string[] => {
            if (!emails) return [];
            // Handle both string and array inputs
            const emailArray = Array.isArray(emails)
                ? emails
                : emails.split(',').map(email => email.trim()).filter(email => email);
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

                console.log('User Response Status:', userResponse.status);

                if (userResponse.ok) {
                    const userData = await userResponse.json();

                    const fullName = userData.data?.full_name;
                    if (fullName) {
                        senderName = fullName;
                    }

                    senderEmail = userData.data?.email || emailData.username;
                } else {
                    console.warn('⚠️ Could not fetch User details:', await userResponse.text());
                }
            } catch (fetchError) {
                console.error('⚠️ Error fetching user details:', fetchError);
            }
        }

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
          <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin: 0; white-space: pre-wrap;">
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

        // Prepare attachments
        const attachments: Attachment[] = [];

        // Add calendar invite and other attachments from request
        if (emailData.attachments && emailData.attachments.length > 0) {
            console.log(`📎 Processing ${emailData.attachments.length} attachment(s)`);

            for (const att of emailData.attachments) {
                attachments.push({
                    filename: att.filename,
                    content: att.content, // Already base64 encoded from frontend
                    contentType: att.contentType || 'application/octet-stream',
                    disposition: att.disposition || 'attachment',
                    contentId: att.contentId,
                });

                console.log(`  ✓ Added attachment: ${att.filename} (${att.contentType})`);
            }
        }

        // Prepare recipients object
        const recipients: EmailRecipients = {};
        if (toEmails.length > 0) recipients.to = toEmails;
        if (ccEmails.length > 0) recipients.cc = ccEmails;
        if (bccEmails.length > 0) recipients.bcc = bccEmails;

        console.log(`📧 Preparing to send ONE email with:`);
        console.log(`   To: ${toEmails.length} recipient(s)`);
        console.log(`   CC: ${ccEmails.length} recipient(s)`);
        console.log(`   BCC: ${bccEmails.length} recipient(s)`);
        console.log(`   Attachments: ${attachments.length}`);

        // Send ONE email with all recipients
        const result = await sendEmail(
            senderName,
            recipients,
            emailData.subject,
            htmlContent,
            senderEmail,
            attachments
        );

        console.log(`📧 Email sending completed:`);
        console.log(`Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
        if (!result.success) {
            console.log(`Error: ${result.error}`);
        }

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
            attachments: attachments.length
        });

    } catch (error: any) {
        console.error('❌ Error sending email:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send email' },
            { status: 500 }
        );
    }
}