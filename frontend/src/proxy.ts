import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/gigs", "/orders", "/settings", "/onboarding"];


export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    if (!isProtected) return NextResponse.next();


    const token = request.cookies.get("token")?.value;

    if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname); // so we send em back after login
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*", 
        "/gigs/:path*", 
        "/orders/:path*", 
        "/onboarding/:path*", 
        "/settings/:path*"],
}