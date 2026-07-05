import { useState, useCallback, useEffect } from "react";
import {
  Search,
  Sparkles,
  AlertCircle,
  Zap,
  Database,
  Brain,
  FileText,
  ChevronDown,
  X,
  Globe,
  BookOpen,
  Info,
  Clock,
  Trash2,
} from "lucide-react";
import ProfileDisplay from "./components/ProfileDisplay";
import LoadingState from "./components/LoadingState";
import { fetchWikipediaData } from "./services/wikipedia";
import { extractProfileFromWikipedia } from "./services/profileExtractor";
import { generateProfileWithGemini } from "./services/aiAgent";
import { sampleProfile } from "./data/sampleProfile";
import {
  loadProfiles,
  saveProfile,
  deleteProfile,
  clearAllProfiles,
  type StoredProfile,
} from "./services/storage";
import type { ProfileData } from "./types";

// ─── Avatar components for history list ───
function InitialsAvatar({ name }: { name: string }) {
  return (
    <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
      <span className="text-sm font-bold text-indigo-400">
        {name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
      </span>
    </div>
  );
}

function HistoryAvatar({ name, photoUrl }: { name: string; photoUrl: string }) {
  const [imgError, setImgError] = useState(false);
  if (imgError) return <InitialsAvatar name={name} />;
  return (
    <img
      src={photoUrl}
      alt={name}
      className="w-10 h-10 rounded-lg object-cover shrink-0"
      onError={() => setImgError(true)}
    />
  );
}

type AppState = "input" | "loading" | "profile" | "error";

export default function App() {
  const [state, setState] = useState<AppState>("input");
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [nameError, setNameError] = useState("");
  const [contextError, setContextError] = useState("");
  const [history, setHistory] = useState<StoredProfile[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load saved profiles on mount
  useEffect(() => {
    setHistory(loadProfiles());
  }, []);

  // Validate inputs
  const validateInputs = (): boolean => {
    let isValid = true;
    setNameError("");
    setContextError("");

    const trimmedName = name.trim();
    const trimmedContext = context.trim();

    if (!trimmedName) {
      setNameError("Name is required");
      isValid = false;
    } else if (trimmedName.length < 2) {
      setNameError("Name must be at least 2 characters");
      isValid = false;
    } else if (trimmedName.length > 100) {
      setNameError("Name must be less than 100 characters");
      isValid = false;
    }

    if (!trimmedContext) {
      setContextError("Context is required");
      isValid = false;
    } else if (trimmedContext.length < 3) {
      setContextError("Context must be at least 3 characters");
      isValid = false;
    } else if (trimmedContext.length > 150) {
      setContextError("Context must be less than 150 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleGenerateProfile = useCallback(async () => {
    if (!validateInputs()) {
      return;
    }

    setState("loading");
    setError("");

    try {
      const trimmedName = name.trim();
      const trimmedContext = context.trim();
      const trimmedKey = apiKey.trim();
      
      let generatedProfile: ProfileData;

      if (trimmedKey) {
        // Step 1: Use Gemini with Google Search to generate profile
        generatedProfile = await generateProfileWithGemini(trimmedName, trimmedContext, trimmedKey);
      } else {
        // Step 1: Fetch Wikipedia data as fallback
        const wikiData = await fetchWikipediaData(trimmedName, trimmedContext);

        if (!wikiData) {
          throw new Error(
            `Could not find information for "${trimmedName}" on Wikipedia. Please try:\n• Checking the spelling\n• Using the person's full name\n• Adding more specific context\n\nOr provide a Gemini API Key to search the whole internet.`
          );
        }

        // Step 2: Extract structured profile using fallback heuristics
        generatedProfile = extractProfileFromWikipedia(
          trimmedName,
          trimmedContext,
          wikiData
        );
      }

      // Step 3: Save to localStorage
      saveProfile(trimmedName, trimmedContext, generatedProfile);
      setHistory(loadProfiles());

      setProfile(generatedProfile);
      setState("profile");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setError(message);
      setState("error");
    }
  }, [name, context]);

  const handleLoadSample = useCallback(() => {
    setProfile(sampleProfile);
    setState("profile");
  }, []);

  const handleLoadFromHistory = useCallback((stored: StoredProfile) => {
    setProfile(stored.profile);
    setName(stored.name);
    setContext(stored.context);
    setState("profile");
    setShowHistory(false);
  }, []);

  const handleDeleteFromHistory = useCallback((id: string) => {
    deleteProfile(id);
    setHistory(loadProfiles());
  }, []);

  const handleClearHistory = useCallback(() => {
    clearAllProfiles();
    setHistory([]);
  }, []);

  const handleReset = useCallback(() => {
    setProfile(null);
    setState("input");
    setError("");
    setNameError("");
    setContextError("");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        handleGenerateProfile();
      }
    },
    [handleGenerateProfile]
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleGenerateProfile();
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) setNameError("");
  };

  const handleContextChange = (value: string) => {
    setContext(value);
    if (contextError) setContextError("");
  };

  // ─── Profile view ───
  if (state === "profile" && profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <ProfileDisplay profile={profile} onReset={handleReset} />
        </div>
      </div>
    );
  }

  // ─── Loading view ───
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <LoadingState />
      </div>
    );
  }

  // ─── Input / Error view ───
  return (
    <div
      className="min-h-screen bg-slate-950 text-white flex flex-col"
      onKeyDown={handleKeyDown}
    >
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/4 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-6">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300 font-medium">
              AI-Powered Profile Builder
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent leading-tight">
            Build Structured Profiles
            <br />
            <span className="text-3xl md:text-4xl">of Famous People</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
            Enter a name and context, and our AI agent will gather public
            information from Wikipedia to generate a comprehensive, structured
            profile report.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
              <Globe className="w-3 h-3" />
              No API Key Required
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">
              <FileText className="w-3 h-3" />
              PDF Report Export
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
              <BookOpen className="w-3 h-3" />
              Saved Locally
            </span>
          </div>
        </div>

        {/* Input Card */}
        <div className="w-full max-w-xl">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="p-6 md:p-8 space-y-5">
              {/* Name input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Person's Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    id="person-name"
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="e.g. Satya Nadella, Elon Musk, Marie Curie"
                    aria-label="Person's name"
                    className={`w-full pl-11 pr-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm ${
                      nameError
                        ? "border-red-500/50 focus:ring-red-500/40 focus:border-red-500/40"
                        : "border-slate-700/50 focus:ring-indigo-500/40 focus:border-indigo-500/40"
                    }`}
                  />
                </div>
                {nameError && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {nameError}
                  </p>
                )}
              </div>

              {/* Context input - REQUIRED */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Context <span className="text-red-400">*</span>
                  <span className="ml-2 text-slate-500 font-normal text-xs">
                    (helps find the right person)
                  </span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
                  <input
                    id="person-context"
                    type="text"
                    value={context}
                    onChange={(e) => handleContextChange(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="e.g. CEO of Microsoft, physicist, tennis player"
                    aria-label="Context to help identify the person"
                    className={`w-full pl-11 pr-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm ${
                      contextError
                        ? "border-red-500/50 focus:ring-red-500/40 focus:border-red-500/40"
                        : "border-slate-700/50 focus:ring-indigo-500/40 focus:border-indigo-500/40"
                    }`}
                  />
                </div>
                {contextError && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {contextError}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  Context improves search accuracy (e.g., "CEO of Microsoft"
                  helps distinguish from others with the same name)
                </p>
              </div>

              {/* API Key Input */}
              <div>
                <label
                  htmlFor="apiKey"
                  className="block text-sm font-medium text-slate-300 mb-1.5"
                >
                  Gemini API Key (Optional)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Zap className="h-4.5 w-4.5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="AI studio key to search whole internet"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  If provided, the app acts as a true AI Agent using Gemini to search the whole internet instead of falling back to Wikipedia heuristics.
                </p>
              </div>

              {/* API Error */}
              {state === "error" && error && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-red-300 whitespace-pre-line">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={() => setState("input")}
                    className="text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerateProfile}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                <Sparkles className="w-4.5 h-4.5" />
                Generate Profile
              </button>

              {/* Keyboard shortcut hint */}
              <p className="text-center text-xs text-slate-600">
                Press{" "}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">
                  Enter
                </kbd>{" "}
                or{" "}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">
                  Ctrl+Enter
                </kbd>{" "}
                to generate
              </p>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-slate-900/80 text-xs text-slate-500">
                    or view example
                  </span>
                </div>
              </div>

              {/* Sample profile button */}
              <button
                onClick={handleLoadSample}
                className="w-full py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-medium rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Database className="w-4 h-4 text-slate-400" />
                View Sample Profile (Satya Nadella - CEO of Microsoft)
              </button>
            </div>
          </div>

          {/* ─── Saved Profiles History ─── */}
          {history.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                Previously Generated ({history.length})
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showHistory ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showHistory && (
                <div className="mt-3 space-y-2 animate-fade-in">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-700/30 hover:border-slate-600/40 transition-colors group"
                    >
                      {/* Photo or initials */}
                      {item.profile.photoUrl ? (
                        <HistoryAvatar name={item.name} photoUrl={item.profile.photoUrl} />
                      ) : (
                        <InitialsAvatar name={item.name} />
                      )}

                      {/* Info — clickable to load */}
                      <button
                        onClick={() => handleLoadFromHistory(item)}
                        className="flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {item.context} •{" "}
                          {new Date(item.savedAt).toLocaleDateString()}
                        </p>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFromHistory(item.id);
                        }}
                        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Delete this profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Clear all */}
                  <button
                    onClick={handleClearHistory}
                    className="w-full py-2 text-xs text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Clear all saved profiles
                  </button>
                </div>
              )}
            </div>
          )}

          {/* How It Works */}
          <div className="mt-6">
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              How It Works
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showHowItWorks ? "rotate-180" : ""
                }`}
              />
            </button>

            {showHowItWorks && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in">
                {[
                  {
                    step: "1",
                    title: "Wikipedia Search",
                    desc: "Searches Wikipedia using name + context for accurate results via OpenSearch API.",
                    icon: "🔍",
                  },
                  {
                    step: "2",
                    title: "Data Extraction",
                    desc: "Extracts structured data from infobox, article summary, and full text using pattern matching.",
                    icon: "📊",
                  },
                  {
                    step: "3",
                    title: "PDF Report",
                    desc: "Generates a downloadable PDF with all profile sections, sources, and references. Also saved locally.",
                    icon: "📄",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/30"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-xs text-indigo-400 font-medium mb-1">
                      Step {item.step}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tech stack footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-600 mb-3">
              Built with free & open-source tools
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/30 rounded-lg border border-slate-800/50">
                ⚛️ React
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/30 rounded-lg border border-slate-800/50">
                🎨 Tailwind CSS
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/30 rounded-lg border border-slate-800/50">
                📚 Wikipedia API
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/30 rounded-lg border border-slate-800/50">
                📄 jsPDF
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/30 rounded-lg border border-slate-800/50">
                ⚡ Vite
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
