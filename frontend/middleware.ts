import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isMaintenanceTime(): boolean {
  const now = new Date();

  const parts = new Intl.DateTimeFormat('he-IL', {
    timeZone: 'Asia/Jerusalem',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const hour   = parseInt(parts.find(p => p.type === 'hour')?.value   ?? '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0', 10);

  // חלון תחזוקה: 21:30 עד 10:00 (עובר חצות)
  const totalMinutes = hour * 60 + minute;
  return false; // temporarily disabled for testing
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // אדמין — תמיד פתוח
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // דף התחזוקה עצמו — לא חוסמים (מניעת לולאת redirect)
  if (pathname.startsWith('/maintenance')) {
    return NextResponse.next();
  }

  if (isMaintenanceTime()) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // כל הנתיבים פרט לקבצים סטטיים ו-API
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|api/).*)',
  ],
};
