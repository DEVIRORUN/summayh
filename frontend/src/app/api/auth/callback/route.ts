import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const bffRes = await fetch(`${origin}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: data.session.access_token }),
      });

      const setCookie = bffRes.headers.get("set-cookie");
      const response = NextResponse.redirect(`${origin}/dashboard`);
      if (setCookie) response.headers.set("set-cookie", setCookie);

      await supabase.auth.signOut();

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}