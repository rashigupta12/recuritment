
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail/mailer3'; // Import from mailer3
import { Attachment } from '@/lib/mail/mailer3'; // Import Attachment interface

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
                    // console.log('User Data:', JSON.stringify(userData, null, 2));
                    
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

        // Prepare attachments (if any from applicants)
        const attachments: Attachment[] = [];
        
        // Process applicant attachments if needed
        if (emailData.applicants && emailData.applicants.length > 0) {
            for (const applicant of emailData.applicants) {
                if (applicant.resume_attachment) {
                    // You'll need to convert the resume_attachment to base64
                    // This depends on how your resume_attachment is stored
                    // Example:
                    // attachments.push({
                    //     filename: `${applicant.applicant_name || applicant.name}_resume.pdf`,
                    //     content: applicant.resume_attachment, // base64 content
                    //     contentType: 'application/pdf'
                    // });
                }
            }
        }

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
        }

        // Check if all emails were sent successfully
        const successfulEmails = emailResults.filter(result => result.success);
        const failedEmails = emailResults.filter(result => !result.success);

        console.log(`📧 Email sending completed:`);
        console.log(`✅ Successful: ${successfulEmails.length}`);
        console.log(`❌ Failed: ${failedEmails.length}`);

        if (failedEmails.length > 0) {
            console.error('Failed emails:', failedEmails);
            return NextResponse.json({
                success: false,
                message: `Some emails failed to send (${successfulEmails.length} successful, ${failedEmails.length} failed)`,
                results: emailResults,
                sentFrom: senderEmail,
                totalSent: successfulEmails.length,
                totalFailed: failedEmails.length,
                errors: failedEmails.map(e => ({ email: e.email, error: e.error }))
            }, { status: 207 }); // 207 Multi-Status
        }

        return NextResponse.json({
            success: true,
            message: `All emails sent successfully (${successfulEmails.length} emails)`,
            results: emailResults,
            sentFrom: senderEmail,
            totalSent: successfulEmails.length,
            totalFailed: failedEmails.length
        });

    } catch (error: any) {
        console.error('❌ Error sending email:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send email' },
            { status: 500 }
        );
    }
}