import {
  User,
  Briefcase,
  GraduationCap,
  Heart,
  DollarSign,
  Newspaper,
  ExternalLink,
  MapPin,
  Globe,
  Building,
  Flag,
  Calendar,
  ChevronRight,
  Sparkles,
  FileDown,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { ProfileData } from "../types";
import { useState, useEffect, useCallback } from "react";
import { generatePDF } from "../services/pdfGenerator";

/* ─── Toast banner ─── */
function Toast({ message, type, onDone }: { message: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border animate-fade-in ${
        type === "success"
          ? "bg-emerald-950/90 border-emerald-700/50 text-emerald-300"
          : "bg-red-950/90 border-red-700/50 text-red-300"
      }`}
    >
      {type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

/* ─── Section card ─── */
function Section({
  icon: Icon,
  title,
  children,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-colors duration-300">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─── Detail row ─── */
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  const isUnavailable =
    value.toLowerCase().includes("not publicly available") ||
    value.toLowerCase().includes("not available") ||
    value.toLowerCase().includes("information not");

  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
          {label}
        </span>
        <p className={`text-sm mt-0.5 ${isUnavailable ? "text-slate-500 italic" : "text-slate-200"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ═════════════ Main component ═════════════ */
export default function ProfileDisplay({
  profile,
  onReset,
}: {
  profile: ProfileData;
  onReset: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  /* ── PDF download ── */
  const handleExportPDF = async () => {
    if (isExporting) return;            // prevent double-click
    setIsExporting(true);
    try {
      await generatePDF(profile);
      showToast("PDF downloaded successfully!", "success");
    } catch (error) {
      console.error("PDF generation failed:", error);
      showToast("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  /* ── JSON download ── */
  const handleExportJSON = () => {
    try {
      const blob = new Blob([JSON.stringify(profile, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${profile.name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")}_profile.json`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      // Delay cleanup so browser finishes the save-dialog
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
      showToast("JSON exported successfully!", "success");
    } catch (error) {
      console.error("JSON export failed:", error);
      showToast("Failed to export JSON. Please try again.", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* Header / Hero Card */}
      <div className="animate-fade-in relative bg-gradient-to-br from-indigo-900/40 via-slate-800/60 to-purple-900/30 rounded-3xl border border-slate-700/50 overflow-hidden mb-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Photo */}
            {profile.photoUrl && !imageError ? (
              <div className="shrink-0">
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  onError={() => setImageError(true)}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-2 border-slate-600/50 shadow-2xl"
                />
              </div>
            ) : (
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-2xl">
                <span className="text-4xl md:text-5xl font-bold text-white/90">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)}
                </span>
              </div>
            )}

            {/* Name & Summary */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                {profile.name}
              </h1>
              <p className="text-indigo-300 text-sm font-medium mb-4">
                {profile.basicDetails.currentRole}
              </p>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                {profile.executiveSummary}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-indigo-800 disabled:to-purple-800 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:cursor-wait shadow-lg shadow-indigo-500/20"
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      Download PDF Report
                    </>
                  )}
                </button>
                <button
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-sm font-medium rounded-xl border border-slate-600/30 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
                <button
                  onClick={onReset}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-sm font-medium rounded-xl border border-slate-600/30 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  New Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Basic Details */}
        <Section icon={User} title="Basic Details" delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <DetailRow icon={User} label="Full Name" value={profile.basicDetails.fullName} />
            <DetailRow icon={Flag} label="Nationality" value={profile.basicDetails.nationality} />
            <DetailRow icon={Briefcase} label="Current Role" value={profile.basicDetails.currentRole} />
            <DetailRow icon={Building} label="Industry" value={profile.basicDetails.industry} />
            <DetailRow icon={MapPin} label="Current City" value={profile.basicDetails.currentCity} />
            <DetailRow icon={Globe} label="Current Country" value={profile.basicDetails.currentCountry} />
          </div>
        </Section>

        {/* Biography */}
        <Section icon={FileText} title="Biography / Summary" delay={200}>
          <p className="text-slate-300 leading-relaxed text-sm">{profile.biography}</p>
        </Section>

        {/* Career Timeline */}
        <Section icon={Briefcase} title="Career Timeline" delay={300}>
          <div className="space-y-1">
            {profile.careerTimeline.map((event, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5 group-hover:scale-125 transition-transform" />
                  {i < profile.careerTimeline.length - 1 && (
                    <div className="w-px flex-1 bg-slate-700 my-1" />
                  )}
                </div>
                <div className="pb-5 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      {event.year}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">{event.role}</h4>
                  <p className="text-xs text-slate-400">{event.organization}</p>
                  {event.description && (
                    <p className="text-xs text-slate-500 mt-1">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Education */}
        <Section icon={GraduationCap} title="Education" delay={400}>
          <div className="space-y-4">
            {profile.education.map((edu, i) => (
              <div
                key={i}
                className="bg-slate-700/20 rounded-xl p-4 border border-slate-700/30 hover:border-slate-600/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{edu.degree}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{edu.institution}</p>
                    <div className="flex gap-3 mt-1.5">
                      {edu.field && (
                        <span className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                          {edu.field}
                        </span>
                      )}
                      {edu.year && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {edu.year}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Interests */}
        <Section icon={Heart} title="Interests" delay={500}>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-slate-700/30 text-slate-300 text-sm rounded-xl border border-slate-600/30 hover:border-indigo-500/30 hover:text-indigo-300 transition-colors cursor-default"
              >
                {interest}
              </span>
            ))}
          </div>
        </Section>

        {/* Net Worth */}
        <Section icon={DollarSign} title="Net Worth" delay={600}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <p
              className={`text-lg font-semibold ${
                profile.netWorth.toLowerCase().includes("not")
                  ? "text-slate-500 italic text-base font-normal"
                  : "text-emerald-300"
              }`}
            >
              {profile.netWorth}
            </p>
          </div>
        </Section>

        {/* Recent News */}
        <Section icon={Newspaper} title="Recent News & Activities" delay={700}>
          <div className="space-y-3">
            {profile.recentNews.map((news, i) => (
              <div key={i} className="flex gap-3 py-2 group">
                <ChevronRight className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{news.title}</h4>
                  {news.date && <span className="text-xs text-slate-500">{news.date}</span>}
                  <p className="text-xs text-slate-400 mt-1">{news.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* References */}
        <Section icon={ExternalLink} title="References & Source Links" delay={800}>
          <div className="space-y-2">
            {profile.references.map((ref, i) => (
              <a
                key={i}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/20 border border-slate-700/30 hover:border-indigo-500/30 hover:bg-slate-700/30 transition-all group"
              >
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-300 group-hover:text-indigo-300 transition-colors truncate">
                    {ref.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{ref.url}</p>
                </div>
              </a>
            ))}
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div
        className="mt-10 mb-6 text-center animate-fade-in"
        style={{ animationDelay: "900ms", animationFillMode: "backwards" }}
      >
        <p className="text-xs text-slate-500">
          This profile was generated using publicly available information from
          Wikipedia and other public sources.
          <br />
          Information may not be fully current or complete. Always verify
          critical details from official sources.
          <br />
          <span className="text-slate-600">
            Generated on{" "}
            {new Date(profile.generatedAt).toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  );
}
