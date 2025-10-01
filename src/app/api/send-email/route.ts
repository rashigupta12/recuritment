// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';``

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
  secure: parseInt(process.env.SMTP_PORT || '587') === 465, // true for 465
  auth: {
    user: process.env.COMPANY_EMAIL,
    pass: process.env.COMPANY_EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // sometimes needed if server uses self-signed cert
  }
});

        // Email options
        const mailOptions = {
            from: `"${process.env.COMPANY_NAME}" <${process.env.COMPANY_EMAIL}>`,
            to: emailData.to_email,
            subject: emailData.subject,
            text: emailData.message,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">${process.env.COMPANY_NAME}</h1>
                    </div>
                    <div style="padding: 20px; background: #f9f9f9;">
                        ${emailData.message.replace(/\n/g, '<br>')}
                    </div>
                    <div style="padding: 20px; background: white; border-top: 1px solid #eee;">
                        <h3 style="color: #333; margin-bottom: 10px;">Candidate Summary:</h3>
                        <ul style="list-style: none; padding: 0;">
                            ${emailData.applicants.map((applicant, index) => `
                                <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                    <strong>${index + 1}. ${applicant.applicant_name || 'N/A'}</strong><br>
                                    ${applicant.email_id ? `Email: ${applicant.email_id}<br>` : ''}
                                    Position: ${applicant.designation || 'N/A'}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div style="padding: 20px; background: #f5f5f5; text-align: center; color: #666;">
                        <p>This email was sent from ${process.env.COMPANY_NAME}</p>
                    </div>
                </div>
            `,
            attachments: await getResumeAttachments(emailData.applicants)
        };

        // Send email
        const result = await transporter.sendMail(mailOptions);
        
        console.log('📧 Email sent successfully:', result.messageId);

        return NextResponse.json({
            success: true,
            messageId: result.messageId,
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

// Helper function to handle resume attachments
async function getResumeAttachments(applicants: any[]) {
    const attachments = [];

    for (const applicant of applicants) {
        if (applicant.resume_attachment) {
            try {
                // If resume_attachment is a URL, fetch the file
                if (applicant.resume_attachment.startsWith('http')) {
                    const response = await fetch(applicant.resume_attachment);
                    if (response.ok) {
                        const buffer = await response.arrayBuffer();
                        attachments.push({
                            filename: `${applicant.applicant_name || 'applicant'}_resume.pdf`,
                            content: Buffer.from(buffer)
                        });
                    }
                }
                // If it's a base64 string or file path, handle accordingly
                // You might need to adjust this based on how your resumes are stored
            } catch (error) {
                console.error(`Failed to attach resume for ${applicant.applicant_name}:`, error);
            }
        }
    }

    return attachments;
}