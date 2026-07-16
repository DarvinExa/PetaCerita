"use client";

import { useEffect, useRef, useState } from "react";
import {
  DownloadSimple,
  ImageSquare,
  ShareNetwork,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Modal, ModalContent, ModalTrigger } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  safeCardFilename,
  summarizeList,
  uniqueNames,
  type TravelCardData,
} from "./travel-card-data";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const OVERLAY_WIDTH = 1080;
const OVERLAY_HEIGHT = 1350;
type CardMode = "card" | "overlay";

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (
    result.length > 1 &&
    ctx.measureText(`${result}...`).width > maxWidth
  ) {
    result = result.slice(0, -1);
  }
  return `${result.trim()}...`;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  const consumed = lines.join(" ").split(/\s+/).length;
  if (consumed < words.length && lines.length > 0) {
    lines[lines.length - 1] = fitText(
      ctx,
      `${lines[lines.length - 1]} ${words.slice(consumed).join(" ")}`,
      maxWidth,
    );
  }
  return lines.length > 0 ? lines : ["Perjalanan bersama"];
}

function drawRoutePaths(
  ctx: CanvasRenderingContext2D,
  data: TravelCardData,
  frame: { x: number; y: number; width: number; height: number },
  alpha: number,
  withMarkers: boolean,
) {
  const allPoints = data.routeDays.flatMap((route) => route.points);
  if (allPoints.length < 2) return false;
  const minLat = Math.min(...allPoints.map((point) => point.lat));
  const maxLat = Math.max(...allPoints.map((point) => point.lat));
  const minLng = Math.min(...allPoints.map((point) => point.lng));
  const maxLng = Math.max(...allPoints.map((point) => point.lng));
  const latSpan = Math.max(maxLat - minLat, 0.005);
  const lngSpan = Math.max(maxLng - minLng, 0.005);
  const padding = 40;
  const scale = Math.min(
    (frame.width - padding * 2) / lngSpan,
    (frame.height - padding * 2) / latSpan,
  );
  const routeWidth = lngSpan * scale;
  const routeHeight = latSpan * scale;
  const offsetX = frame.x + (frame.width - routeWidth) / 2;
  const offsetY = frame.y + (frame.height - routeHeight) / 2;
  const project = (point: { lat: number; lng: number }) => ({
    x: offsetX + (point.lng - minLng) * scale,
    y: offsetY + (maxLat - point.lat) * scale,
  });
  const colors = ["#99F6E4", "#FDBA74", "#7DD3FC", "#FCA5A5"];

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  data.routeDays.forEach((route, index) => {
    if (route.points.length < 2) return;
    ctx.strokeStyle = colors[index % colors.length]!;
    ctx.lineWidth = 9;
    ctx.beginPath();
    route.points.forEach((point, pointIndex) => {
      const projected = project(point);
      if (pointIndex === 0) ctx.moveTo(projected.x, projected.y);
      else ctx.lineTo(projected.x, projected.y);
    });
    ctx.stroke();
    if (withMarkers) {
      const start = project(route.points[0]!);
      const end = project(route.points[route.points.length - 1]!);
      for (const point of [start, end]) {
        ctx.fillStyle = colors[index % colors.length]!;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }
  });
  ctx.restore();
  return true;
}

function drawTravelCard(canvas: HTMLCanvasElement, data: TravelCardData) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  ctx.fillStyle = "#F8F7F3";
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.fillStyle = "#134E4A";
  ctx.fillRect(0, 0, 770, CARD_HEIGHT);
  ctx.fillStyle = "#FFFAF0";
  ctx.fillRect(770, 0, CARD_WIDTH - 770, CARD_HEIGHT);

  const hasRoute = drawRoutePaths(
    ctx,
    data,
    { x: 30, y: 20, width: 710, height: 580 },
    0.2,
    true,
  );

  // Garis kontur dekoratif yang tetap tenang dan tidak mengganggu copy.
  ctx.strokeStyle = hasRoute
    ? "rgba(153,246,228,0.06)"
    : "rgba(153,246,228,0.14)";
  ctx.lineWidth = 3;
  for (let offset = 0; offset < 4; offset++) {
    ctx.beginPath();
    ctx.arc(690, 70, 120 + offset * 34, 0.15, Math.PI * 1.45);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(201,138,56,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(816, 475);
  ctx.bezierCurveTo(890, 410, 975, 550, 1135, 455);
  ctx.stroke();
  const decorDots: Array<[number, number]> = [
    [816, 475],
    [955, 486],
    [1135, 455],
  ];
  for (const [x, y] of decorDots) {
    ctx.fillStyle = "#C98A38";
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFFAF0";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.fillStyle = "#99F6E4";
  ctx.font = '700 18px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.letterSpacing = "3px";
  ctx.fillText("PETACERITA", 64, 66);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#CCFBF1";
  ctx.font = '700 20px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(data.city.toLocaleUpperCase("id-ID"), 64, 132);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = '700 52px "Plus Jakarta Sans", Arial, sans-serif';
  const titleLines = wrapText(ctx, data.tripName, 630, 3);
  titleLines.forEach((line, index) => ctx.fillText(line, 64, 202 + index * 60));

  const detailsY = 225 + titleLines.length * 60;
  ctx.fillStyle = "#CCFBF1";
  ctx.font = '500 22px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(data.dateRange, 64, detailsY);

  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.font = '500 17px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText("PERGI BERSAMA", 64, 420);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = '600 22px "Plus Jakarta Sans", Arial, sans-serif';
  const people = summarizeList(data.memberNames, 5) || "Belum ada peserta";
  ctx.fillText(`“${fitText(ctx, people, 620)}”`, 64, 454);

  const stats = [
    [String(data.dayCount), "HARI"],
    [String(uniqueNames(data.destinationNames).length), "DESTINASI"],
    [String(uniqueNames(data.memberNames).length), "PESERTA"],
  ];
  stats.forEach(([value, label], index) => {
    const x = 64 + index * 185;
    roundedRect(ctx, x, 500, 160, 82, 14);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = '700 30px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillText(value!, x + 18, 538);
    ctx.fillStyle = "#99F6E4";
    ctx.font = '700 13px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillText(label!, x + 18, 564);
  });

  ctx.fillStyle = "#0F766E";
  ctx.font = '700 16px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText("RENCANA SINGKAT", 816, 76);
  ctx.fillStyle = "#1C1917";
  ctx.font = '700 29px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText("Tempat yang dituju", 816, 116);

  const destinations = uniqueNames(data.destinationNames).slice(0, 5);
  if (destinations.length === 0) {
    ctx.fillStyle = "#78716C";
    ctx.font = '500 18px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillText("Itinerary masih disusun.", 816, 170);
  } else {
    destinations.forEach((name, index) => {
      const y = 172 + index * 62;
      ctx.fillStyle = "#0F766E";
      roundedRect(ctx, 816, y - 25, 34, 34, 10);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = '700 15px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(String(index + 1), 833, y - 2);
      ctx.textAlign = "left";
      ctx.fillStyle = "#292524";
      ctx.font = '600 18px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.fillText(fitText(ctx, name, 285), 868, y - 3);
      ctx.strokeStyle = "#E7E5E4";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(868, y + 18);
      ctx.lineTo(1134, y + 18);
      ctx.stroke();
    });
  }

  ctx.fillStyle = "#78716C";
  ctx.font = '500 14px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(`Mata uang perjalanan: ${data.baseCurrency}`, 816, 576);
  ctx.fillStyle = "#0F766E";
  ctx.font = '700 15px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText("Rencanakan bersama di PetaCerita", 816, 604);
}

function drawRouteOverlay(canvas: HTMLCanvasElement, data: TravelCardData) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = OVERLAY_WIDTH;
  canvas.height = OVERLAY_HEIGHT;
  ctx.clearRect(0, 0, OVERLAY_WIDTH, OVERLAY_HEIGHT);

  // PNG sengaja dibiarkan transparan agar bisa ditumpuk di atas foto.
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.32)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = '700 24px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.letterSpacing = "4px";
  ctx.fillText("PETACERITA", 70, 92);
  ctx.letterSpacing = "0px";
  ctx.font = '700 64px "Plus Jakarta Sans", Arial, sans-serif';
  const titleLines = wrapText(ctx, data.tripName, 900, 2);
  titleLines.forEach((line, index) => ctx.fillText(line, 70, 176 + index * 72));
  ctx.font = '600 26px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(`${data.city}  ·  ${data.dateRange}`, 70, 344);
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 16;
  const hasRoute = drawRoutePaths(
    ctx,
    data,
    { x: 90, y: 390, width: 900, height: 680 },
    0.96,
    true,
  );
  ctx.restore();

  if (!hasRoute) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = '600 25px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(
      "Tambahkan koordinat destinasi untuk menampilkan rute.",
      OVERLAY_WIDTH / 2,
      730,
    );
    ctx.restore();
  }

  const destinationCount = uniqueNames(data.destinationNames).length;
  const memberCount = uniqueNames(data.memberNames).length;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.32)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = '700 42px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(
    `${data.dayCount} hari  ·  ${destinationCount} destinasi  ·  ${memberCount} peserta`,
    70,
    1200,
  );
  ctx.font = '600 23px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(
    fitText(ctx, summarizeList(data.destinationNames, 4), 920),
    70,
    1252,
  );
  ctx.restore();
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Gagal membuat gambar"));
    }, "image/png");
  });
}

export function TravelCardButton({ data }: { data: TravelCardData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CardMode>("card");
  const [working, setWorking] = useState(false);
  const { notify } = useToast();
  const filename = safeCardFilename(data.tripName, mode);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    if (mode === "overlay") drawRouteOverlay(canvasRef.current, data);
    else drawTravelCard(canvasRef.current, data);
  }, [data, mode, open]);

  async function download() {
    if (!canvasRef.current) return;
    setWorking(true);
    try {
      const blob = await canvasBlob(canvasRef.current);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      notify({ tone: "success", title: "Kartu perjalanan diunduh" });
    } catch {
      notify({ tone: "danger", title: "Gagal membuat kartu perjalanan" });
    } finally {
      setWorking(false);
    }
  }

  async function share() {
    if (!canvasRef.current) return;
    setWorking(true);
    try {
      const blob = await canvasBlob(canvasRef.current);
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: data.tripName,
          text: `Rencana perjalanan ${data.tripName} di ${data.city}`,
          files: [file],
        });
      } else {
        await download();
        notify({
          tone: "info",
          title: "Berbagi file tidak tersedia. Gambar sudah diunduh.",
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      notify({ tone: "danger", title: "Gagal membagikan kartu perjalanan" });
    } finally {
      setWorking(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button type="button" variant="secondary" size="md">
          <ImageSquare className="size-5" aria-hidden />
          <span>Kartu perjalanan</span>
        </Button>
      </ModalTrigger>
      <ModalContent
        title="Kartu perjalanan"
        description="Gunakan kartu lengkap atau overlay rute transparan seperti activity share."
        className="max-h-[92vh] max-w-4xl overflow-y-auto"
      >
        <div
          className="mb-4 grid grid-cols-2 rounded-2xl border border-white/70 bg-neutral-100 p-1"
          aria-label="Format kartu"
        >
          <button
            type="button"
            onClick={() => setMode("card")}
            className={`min-h-11 rounded px-3 text-[13px] font-semibold transition-all duration-300 ease-in-out ${
              mode === "card"
                ? "bg-white text-neutral-900 shadow-[0_10px_30px_rgba(15,118,110,0.08)]"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
            aria-pressed={mode === "card"}
          >
            Kartu lengkap
          </button>
          <button
            type="button"
            onClick={() => setMode("overlay")}
            className={`min-h-11 rounded px-3 text-[13px] font-semibold transition-all duration-300 ease-in-out ${
              mode === "overlay"
                ? "bg-white text-neutral-900 shadow-[0_10px_30px_rgba(15,118,110,0.08)]"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
            aria-pressed={mode === "overlay"}
          >
            Overlay transparan
          </button>
        </div>
        <div
          className={`overflow-hidden rounded-2xl border border-white/70 ${
            mode === "overlay" ? "bg-neutral-700" : "bg-neutral-100"
          }`}
        >
          <canvas
            ref={canvasRef}
            width={mode === "overlay" ? OVERLAY_WIDTH : CARD_WIDTH}
            height={mode === "overlay" ? OVERLAY_HEIGHT : CARD_HEIGHT}
            className={`mx-auto block h-auto ${
              mode === "overlay" ? "max-h-[62vh] w-auto max-w-full" : "w-full"
            }`}
            role="img"
            aria-label={`${
              mode === "overlay" ? "Overlay rute" : "Kartu perjalanan"
            } ${data.tripName} di ${data.city}`}
          >
            Kartu perjalanan {data.tripName} di {data.city}.
          </canvas>
        </div>
        <p className="mt-2 text-[12px] leading-5 text-neutral-500">
          {mode === "overlay"
            ? "File PNG tidak memiliki background dan dapat ditempel di atas foto."
            : "Rute aktual dari itinerary ditampilkan sebagai elemen latar semi transparan."}
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={share}
            loading={working}
          >
            <ShareNetwork className="size-4" aria-hidden />
            <span>Bagikan</span>
          </Button>
          <Button type="button" onClick={download} loading={working}>
            <DownloadSimple className="size-4" aria-hidden />
            <span>Unduh PNG</span>
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
