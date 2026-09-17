import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getMessages, isLocale, locales } from "@/lib/i18n";
import { MARK_GEOMETRY, planePath } from "@/components/brand/Mark";

export const alt = "mateusfb.ai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const generateStaticParams = () => locales.map((locale) => ({ locale }));

async function geist(file: string) {
  try {
    return await readFile(path.join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans", file));
  } catch {
    return null;
  }
}

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(isLocale(locale) ? locale : "en");
  const [medium, regular] = await Promise.all([geist("Geist-Medium.ttf"), geist("Geist-Regular.ttf")]);
  const fonts = [
    medium && { name: "Geist", data: medium, weight: 500 as const, style: "normal" as const },
    regular && { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: Buffer; weight: 400 | 500; style: "normal" }[];
  const { planes, cx, w, h, strokeWidth } = MARK_GEOMETRY;
  const [top, mid, bottom] = planes;
  const MARK = 64;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000",
          color: "#fff",
          padding: 80,
          fontFamily: fonts.length ? "Geist" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Inline mark: duplica Mark.tsx com #fff explícito pois Satori/ImageResponse não suporta currentColor. */}
          <svg width={MARK} height={MARK} viewBox="0 0 32 32" fill="none">
            <path d={planePath(cx, bottom.cy, w, h)} stroke="#fff" strokeWidth={strokeWidth} strokeLinejoin="round" fill="none" />
            <path d={planePath(cx, mid.cy, w, h)} stroke="#fff" strokeWidth={strokeWidth} strokeLinejoin="round" fill="none" />
            <path d={planePath(cx, top.cy, w, h)} fill="#fff" />
          </svg>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 64, fontWeight: 500, letterSpacing: "-0.01em" }}>
            mateusfb
            <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>.ai</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, lineHeight: 1.3, color: "rgba(255,255,255,0.6)", maxWidth: 900, fontWeight: 400 }}>
          {m.meta.description}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
