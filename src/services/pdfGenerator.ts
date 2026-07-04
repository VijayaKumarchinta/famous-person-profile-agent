import jsPDF from "jspdf";
import type { ProfileData } from "../types";

function sanitizeText(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, "--")
    .replace(/\u2026/g, "...")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string | undefined | null, maxLength: number): string {
  const clean = sanitizeText(text);
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength - 3) + "...";
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1500);
}

/**
 * Generate a single-page PDF report from profile data and trigger download.
 */
export async function generatePDF(profile: ProfileData): Promise<void> {
  if (!profile || !profile.name) {
    throw new Error("Invalid profile data: name is missing");
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = doc.internal.pageSize.getWidth(); // 210
  const H = doc.internal.pageSize.getHeight(); // 297
  const M = 14; // margin (reduced)
  const CW = W - M * 2; // content width: 182mm
  let y = M;

  // ─── helpers ───
  const color = (hex: string) => {
    doc.setTextColor(
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    );
  };

  const ensure = (need: number) => {
    if (y + need > H - 14) { y = H - 14; return; }
  };

  const wrap = (text: string, fontSize = 8, style: "normal" | "bold" | "italic" = "normal", textColor = "#475569", lh = 3.2) => {
    color(textColor);
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    const lines: string[] = doc.splitTextToSize(text, CW);
    for (const line of lines) {
      ensure(lh);
      doc.text(line, M, y);
      y += lh;
    }
  };

  // ═══════════════ HEADER ═══════════════
  color("#1e293b");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(sanitizeText(profile.name), M, y);
  y += 6;

  color("#6366f1");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(truncate(profile.basicDetails.currentRole, 120), M, y);
  y += 5;

  // Thin separator
  doc.setDrawColor(200, 200, 200);
  doc.line(M, y, W - M, y);
  y += 3;

  // ═══════════════ EXECUTIVE SUMMARY ═══════════════
  color("#1e293b");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", M, y);
  y += 4;
  wrap(truncate(profile.executiveSummary, 450), 7.5);
  doc.line(M, y, W - M, y);
  y += 3;

  // ═══════════════ BASIC DETAILS (inline compact) ═══════════════
  color("#1e293b");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Basic Details", M, y);
  y += 4;

  const details: { label: string; value: string }[] = [
    { label: "Full Name", value: profile.basicDetails.fullName },
    { label: "Nationality", value: profile.basicDetails.nationality },
    { label: "Current Role", value: profile.basicDetails.currentRole },
    { label: "Industry", value: profile.basicDetails.industry },
    { label: "Current City", value: profile.basicDetails.currentCity },
    { label: "Current Country", value: profile.basicDetails.currentCountry },
  ];

  doc.setFontSize(7.5);
  // Two columns: 3 details per column
  const colW = CW / 2 - 4;
  for (let i = 0; i < 3; i++) {
    ensure(9);
    const leftX = M;
    const rightX = M + colW + 8;
    for (let col = 0; col < 2; col++) {
      const idx = i + col * 3;
      const d = details[idx];
      const x = col === 0 ? leftX : rightX;
      doc.setFont("helvetica", "bold");
      color("#64748b");
      doc.text(sanitizeText(d.label) + ":", x, y);
      doc.setFont("helvetica", "normal");
      color("#1e293b");
      doc.text(truncate(d.value, 40), x + (col === 0 ? 20 : 22), y);
    }
    y += 4.5;
  }
  y += 1;
  doc.line(M, y, W - M, y);
  y += 3;

  // ═══════════════ BIOGRAPHY ═══════════════
  color("#1e293b");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Biography / Summary", M, y);
  y += 4;
  wrap(truncate(profile.biography, 600), 7.5);
  doc.line(M, y, W - M, y);
  y += 3;

  // ═══════════════ CAREER TIMELINE ═══════════════
  color("#1e293b");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Career Timeline", M, y);
  y += 4;

  const careerItems = (profile.careerTimeline || []).slice(0, 4);
  for (const ev of careerItems) {
    ensure(10);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    color("#6366f1");
    doc.text(truncate(ev.year, 16), M, y);
    color("#1e293b");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(truncate(ev.role, 60), M + 18, y);
    y += 3.5;
    doc.setFont("helvetica", "normal");
    color("#64748b");
    doc.setFontSize(7);
    doc.text(truncate(ev.organization || "N/A", 72), M + 18, y);
    y += 3.8;
  }
  doc.line(M, y, W - M, y);
  y += 3;

  // ═══════════════ EDUCATION ═══════════════
  color("#1e293b");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Education", M, y);
  y += 4;

  for (const edu of (profile.education || []).slice(0, 3)) {
    ensure(9);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    color("#1e293b");
    doc.text(truncate(edu.degree, 70), M, y);
    y += 3.5;
    doc.setFont("helvetica", "normal");
    color("#64748b");
    doc.setFontSize(7);
    const sub = [edu.institution, edu.field, edu.year].filter(Boolean).join(" | ");
    doc.text(truncate(sub, 90), M, y);
    y += 3.8;
  }
  doc.line(M, y, W - M, y);
  y += 3;

  // ═══════════════ INTERESTS ═══════════════
  color("#1e293b");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Interests", M, y);
  y += 4;
  const intText = (profile.interests || []).slice(0, 6).map(i => sanitizeText(i)).join("  |  ");
  ensure(6);
  wrap(truncate(intText, 250), 7);
  doc.line(M, y, W - M, y);
  y += 3;

  // ═══════════════ NET WORTH ═══════════════
  color("#1e293b");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Net Worth", M, y);
  y += 4;
  const nw = sanitizeText(profile.netWorth);
  const isNotAvail = nw.toLowerCase().includes("not");
  doc.setFontSize(isNotAvail ? 8 : 9);
  doc.setFont("helvetica", isNotAvail ? "italic" : "bold");
  color(isNotAvail ? "#94a3b8" : "#059669");
  doc.text(truncate(nw, 120), M, y);
  y += 4;
  doc.line(M, y, W - M, y);
  y += 3;

  // ═══════════════ RECENT NEWS ═══════════════
  color("#1e293b");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Recent News & Activities", M, y);
  y += 4;

  for (const news of (profile.recentNews || []).slice(0, 3)) {
    ensure(12);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    color("#1e293b");
    const title = truncate(news.title, 70);
    doc.text(title, M, y);
    if (news.date) {
      const tw = doc.getTextWidth(title);
      if (tw < CW - 25) {
        color("#6366f1");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.text("(" + sanitizeText(news.date) + ")", M + tw + 2, y);
      }
    }
    y += 3.5;
    color("#64748b");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const descLines = doc.splitTextToSize(truncate(news.description, 180), CW);
    for (let i = 0; i < Math.min(descLines.length, 2); i++) {
      ensure(3.2);
      doc.text(descLines[i], M, y);
      y += 3;
    }
    y += 2;
  }
  doc.line(M, y, W - M, y);
  y += 3;

  // ═══════════════ REFERENCES ═══════════════
  color("#1e293b");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("References & Source Links", M, y);
  y += 4;

  doc.setFontSize(7);
  for (const ref of (profile.references || []).slice(0, 4)) {
    ensure(8);
    doc.setFont("helvetica", "bold");
    color("#1e293b");
    doc.text("* " + truncate(ref.title, 55), M, y);
    y += 3;
    doc.setFont("helvetica", "normal");
    color("#6366f1");
    doc.textWithLink(truncate(ref.url, 80), M + 3, y, { url: ref.url });
    y += 3.5;
  }

  // ═══════════════ FOOTER ═══════════════
  const stamp = new Date(profile.generatedAt || Date.now()).toLocaleString();
  doc.setFontSize(6.5);
  color("#94a3b8");
  doc.setFont("helvetica", "italic");
  doc.text(
    "Generated on " + stamp + " | AI-Powered Profile Builder",
    M, H - 8,
  );
  doc.text(
    "Profile built from publicly available Wikipedia data. Verify critical details from official sources.",
    M, H - 4,
  );

  // ═══════════════ DOWNLOAD ═══════════════
  const safeName = profile.name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
  const pdfBlob = doc.output("blob");
  downloadBlob(pdfBlob, `${safeName}_Profile.pdf`);
}
