import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware only needs to run once at startup
let hasCronInitialized = false;

export async function middleware(request: NextRequest) {
  // Only initialize once, and only in production
  if (!hasCronInitialized && process.env.NODE_ENV === 'production') {
    try {
      // Call our cron init API route
      const response = await fetch(new URL('/api/init-cron', request.url));
      if (response.ok) {
        hasCronInitialized = true;
        console.log('Cron service initialized via middleware');
      }
    } catch (error) {
      console.error('Failed to initialize cron service:', error);
    }
  }

  return NextResponse.next();
}

// Only match the homepage route to minimize middleware execution
export const config = {
  matcher: [
    // Only run middleware on the homepage to reduce overhead
    '/',
  ],
};
