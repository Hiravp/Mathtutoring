import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  dashboardPathForRole,
  isUserRole,
} from "@/lib/auth/roles";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
  return to;
}

/**
 * Refreshes the Supabase auth session and enforces basic route guards.
 * Role-based authorization is also enforced in teacher/student layouts
 * using the database role (never client-supplied role).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/student");
  const isProtectedRoute = isTeacherRoute || isStudentRoute;

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return copyCookies(supabaseResponse, NextResponse.redirect(redirectUrl));
  }

  if (user && (isAuthRoute || isProtectedRoute)) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && isUserRole(profile.role)) {
      const dashboardPath = dashboardPathForRole(profile.role);

      if (isAuthRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = dashboardPath;
        redirectUrl.search = "";
        return copyCookies(
          supabaseResponse,
          NextResponse.redirect(redirectUrl),
        );
      }

      if (isTeacherRoute && profile.role !== "teacher") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = dashboardPath;
        return copyCookies(
          supabaseResponse,
          NextResponse.redirect(redirectUrl),
        );
      }

      if (isStudentRoute && profile.role !== "student") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = dashboardPath;
        return copyCookies(
          supabaseResponse,
          NextResponse.redirect(redirectUrl),
        );
      }
    }
  }

  return supabaseResponse;
}
