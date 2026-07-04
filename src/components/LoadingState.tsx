import { useState, useEffect } from "react";

const stages = [
  { message: "Searching Wikipedia for the person...", icon: "🔍" },
  { message: "Fetching article summary and photo...", icon: "📸" },
  { message: "Extracting full article content...", icon: "📄" },
  { message: "Parsing career and education data...", icon: "📊" },
  { message: "Building structured profile...", icon: "✨" },
];

export default function LoadingState() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      {/* Spinning loader */}
      <div className="relative w-20 h-20 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin-slow" />
        <div
          className="absolute inset-2 rounded-full border-2 border-transparent border-b-purple-500 animate-spin-slow"
          style={{ animationDirection: "reverse", animationDuration: "2s" }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {stages[currentStage].icon}
        </div>
      </div>

      {/* Current stage */}
      <p
        className="text-slate-200 font-medium text-lg mb-2 animate-fade-in"
        key={currentStage}
      >
        {stages[currentStage].message}
      </p>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {stages.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i <= currentStage
                ? "bg-indigo-500 scale-100"
                : "bg-slate-700 scale-75"
            }`}
          />
        ))}
      </div>

      {/* Info text */}
      <p className="text-slate-500 text-xs mt-8">
        Gathering publicly available information from Wikipedia...
        <br />
        No API keys or external services required.
      </p>

      {/* Shimmer skeleton preview */}
      <div className="mt-8 space-y-4 text-left">
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-slate-700/50 shimmer-bg" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-700/50 rounded-lg w-48 shimmer-bg" />
              <div className="h-3 bg-slate-700/30 rounded-lg w-32 shimmer-bg" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-700/30 rounded-lg w-full shimmer-bg" />
            <div className="h-3 bg-slate-700/30 rounded-lg w-5/6 shimmer-bg" />
            <div className="h-3 bg-slate-700/30 rounded-lg w-4/6 shimmer-bg" />
          </div>
        </div>
      </div>
    </div>
  );
}
