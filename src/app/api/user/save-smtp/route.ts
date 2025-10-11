/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/lib/crypto';
import nodemailer from 'nodemailer';

interface SaveSMTPRequest {
  email: string;
  password: string;
  username: string; // Frappe username
}

export async function POST(request: NextRequest) {
  try {
    const data: SaveSMTPRequest = await request.json();

    // Validate required fields
    if (!data.email || !data.password || !data.username) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Test SMTP connection before saving
    console.log('🔧 Testing SMTP connection for:', data.email);
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_SERVER || 'crystal.herosite.pro',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
          user: data.email,
          pass: data.password,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (verifyError: any) {
      console.error('❌ SMTP verification failed:', verifyError);
      return NextResponse.json(
        { 
          error: 'SMTP credentials verification failed. Please check your email and password.',
          details: verifyError.message 
        },
        { status: 400 }
      );
    }

    // Encrypt password
    console.log('🔐 Encrypting password...');
    const encryptedPassword = encrypt(data.password);

    // Save to Frappe User record
    console.log('💾 Saving SMTP credentials to Frappe...');
    const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL;
    const FRAPPE_PROXY_URL = process.env.NEXT_PUBLIC_dev_prod_FRAPPE_BASE_URL;

    if (!FRAPPE_BASE_URL || !FRAPPE_PROXY_URL) {
      console.error('❌ Frappe configuration missing');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Get session cookies from the request
    const cookies = request.headers.get('cookie') || '';

    // Step 1: Update User doctype with SMTP email
    console.log('💾 Step 1: Saving SMTP email to User doctype...');
    console.log('✅ SMTP email saved to User doctype');

    // Step 2: Update User Setting with encrypted password
    console.log('💾 Step 2: Saving encrypted password to User Setting...');
    const updateUserSettingResponse = await fetch(
      `${FRAPPE_PROXY_URL}/resource/User%20Setting/${encodeURIComponent(data.username)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        body: JSON.stringify({
          custom_mailp: encryptedPassword,
          custom_email_configured:1
        }),
      }
    );

    if (!updateUserSettingResponse.ok) {
      const errorText = await updateUserSettingResponse.text();
      console.error('❌ Failed to update User Setting:', errorText);
      return NextResponse.json(
        { error: 'Failed to save encrypted password. Please try again.' },
        { status: updateUserSettingResponse.status }
      );
    }
    console.log('✅ Encrypted password saved to User Setting');

    console.log('✅ SMTP credentials saved successfully');

    return NextResponse.json({
      success: true,
      message: 'SMTP credentials saved and verified successfully',
      email: data.email
    });

  } catch (error: any) {
    console.error('❌ Error saving SMTP credentials:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save SMTP credentials' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's SMTP email (not password)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL;

    if (!FRAPPE_BASE_URL) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get session cookies
    const cookies = request.headers.get('cookie') || '';

    // Fetch user details via proxy
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_dev_prod_FRAPPE_BASE_URL}/resource/User%20Setting/${encodeURIComponent(username)}`,
      {
        method: 'GET',
        headers: {
          'Cookie': cookies,
        },
      }
    );

    console.log(userResponse)

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user SMTP settings' },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    const smtpEmail = userData.data?.custom_smtp_email;

    return NextResponse.json({
      success: true,
      hasCredentials: !!smtpEmail,
      email: smtpEmail || null
    });

  } catch (error: any) {
    console.error('❌ Error fetching SMTP credentials:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch SMTP credentials' },
      { status: 500 }
    );
  }
}