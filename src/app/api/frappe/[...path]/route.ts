import { NextRequest, NextResponse } from 'next/server';

async function handleRequest(method: string, request: NextRequest, path: string[]) {
  try {
    const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL;
    
    if (!FRAPPE_BASE_URL) {
      return NextResponse.json({ error: 'Frappe server not configured' }, { status: 500 });
    }

    // Build the target URL
    const targetPath = path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const targetUrl = `${FRAPPE_BASE_URL}/api/${targetPath}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`Proxying ${method} ${targetUrl}`);

    // Get request body for POST/PUT requests
    let body = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.text();
      } catch (error) {
        console.warn('Could not read request body:', error);
      }
    }

    // Forward headers, especially cookies
    const headers = new Headers();
    
    // Copy important headers
    const headersToForward = [
      'content-type',
      'authorization',
      'cookie',
      'user-agent',
      'accept',
      'accept-language',
    ];

    headersToForward.forEach(headerName => {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers.set(headerName, headerValue);
      }
    });

    // Make the request to Frappe
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      credentials: 'include',
    });

    // Get response body
    const responseText = await response.text();
    
    // Create response with proper headers
    const nextResponse = new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward Set-Cookie headers
    const setCookieHeaders = response.headers.get('set-cookie');
    if (setCookieHeaders) {
      nextResponse.headers.set('set-cookie', setCookieHeaders);
      console.log('Stored session cookie from login:', setCookieHeaders.split(';')[0]);
    }

    // Forward other important headers
    ['content-type', 'cache-control', 'etag'].forEach(headerName => {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        nextResponse.headers.set(headerName, headerValue);
      }
    });

    console.log(`Response: ${response.status} ${response.statusText}`);
    return nextResponse;

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' }, 
      { status: 500 }
    );
  }
}

// Fix for Next.js 15 - await params
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleRequest('GET', request, path);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleRequest('POST', request, path);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleRequest('PUT', request, path);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleRequest('DELETE', request, path);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleRequest('PATCH', request, path);
}