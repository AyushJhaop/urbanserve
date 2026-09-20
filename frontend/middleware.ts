import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(
  clerkKey && 
  !clerkKey.includes('demo') && 
  !clerkKey.includes('placeholder') && 
  clerkKey.startsWith('pk_')
);

const isPublicRoute = createRouteMatcher([
  '/',
  '/services(.*)',
  '/login(.*)',
  '/register(.*)',
  '/api(.*)',
]);

export default function middleware(req: NextRequest, evt: any) {
  if (!isClerkConfigured) {
    return NextResponse.next();
  }
  
  return clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  })(req, evt);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
