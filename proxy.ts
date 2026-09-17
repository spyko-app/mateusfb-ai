import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();
  const accept = req.headers.get("accept-language") ?? "";
  const wanted = accept.toLowerCase().startsWith("pt") ? "pt" : defaultLocale;
  const url = req.nextUrl.clone();
  url.pathname = `/${wanted}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
