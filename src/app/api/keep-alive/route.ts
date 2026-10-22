import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

/**
 * Endpoint keep-alive untuk mencegah Supabase ter-pause.
 * Dapat dipanggil oleh Vercel Cron, GitHub Actions, atau layanan cron gratis seperti cron-job.org.
 */
export async function GET() {
  try {
    const [result] =
      await prisma.$queryRawUnsafe<Array<{ ping: number }>>("SELECT 1 as ping");

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: result?.ping === 1 ? "connected" : "ok",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Gagal menghubungi database",
      },
      { status: 500 },
    );
  }
}
