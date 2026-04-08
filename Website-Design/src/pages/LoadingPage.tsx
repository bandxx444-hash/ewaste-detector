import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BarChart3, FileText, Tag, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import ProgressBar from "@/components/ProgressBar";
import { useScan } from "@/context/ScanContext";
import { getRandomFact } from "@/lib/mock-ai";
import { analyzeDevice, generateListing } from "@/lib/api";

const phases = [
  { icon: Search,       label: "Searching marketplace listings..." },
  { icon: BarChart3,    label: "Grading device condition..." },
  { icon: FileText,     label: "Building your valuation..." },
  { icon: Tag,          label: "Generating your eBay listing..." },
  { icon: CheckCircle,  label: "Finalizing results..." },
];

const LoadingPage = () => {
  const navigate = useNavigate();
  const { diagnostics, files, setResult, setListing } = useScan();
  const [fact] = useState(getRandomFact);
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const called = useRef(false);
  const progressRef = useRef(0);
  const listingPhaseRef = useRef(false);

  // Smooth asymptotic progress — approaches target but never stalls
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const target = listingPhaseRef.current ? 99 : 88;
        const step = (target - p) * 0.018;
        const next = p + Math.max(step, 0.05);
        progressRef.current = Math.min(next, target);
        return progressRef.current;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Advance phase labels
  useEffect(() => {
    const durations = [3500, 3000, 3000, 0, 0]; // phase 3 & 4 triggered by API
    if (phase < 2) {
      const t = setTimeout(() => setPhase(p => p + 1), durations[phase]);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Call APIs once
  useEffect(() => {
    if (called.current) return;
    called.current = true;

    analyzeDevice(diagnostics, files)
      .then(async result => {
        setResult(result);
        // Phase 3: generate listing
        if (result.decision === "sell") {
          setPhase(3);
          listingPhaseRef.current = true;
          try {
            const listingData = await generateListing(result);
            setListing(listingData);
          } catch {
            // non-fatal — ListingPage will retry
          }
        }
        setPhase(4);
        setProgress(100);
        setTimeout(() => navigate("/listings-preview"), 400);
      })
      .catch(err => {
        console.error(err);
        setError("We couldn't analyze your device. Please check your photos and try again.");
      });
  }, []); // eslint-disable-line

  const PhaseIcon = phases[phase].icon;

  // Error state — stop loading and prompt user to go back
  if (error) {
    return (
      <div className="min-h-screen relative">
        <BackgroundOrbs />
        <Navbar />
        <main className="container mx-auto px-4 max-w-lg relative z-10 pt-20 pb-20 text-center font-sans">
          <div className="animate-fade-in-up mt-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "hsl(0 70% 95%)" }}>
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">Analysis Failed</h2>
            <p className="text-sm text-subtle mb-2">{error}</p>
            <p className="text-xs text-faintest mb-8">Tips: use clear, well-lit photos · show the device front and back · avoid blurry or partial shots</p>
            <button
              onClick={() => navigate("/upload")}
              className="w-full py-3.5 rounded-xl font-bold text-[15px] text-primary-foreground shadow-cta transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(153 70% 38%), hsl(153 70% 28%))" }}>
              ← Retake Photos
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundOrbs />
      <Navbar />
      <main className="container mx-auto px-4 max-w-lg relative z-10 pt-20 pb-20 text-center font-sans">
        <ProgressBar percent={progress} />

        <div className="mt-12 animate-fade-in-up">
          {/* Scan visualization */}
          <div className="relative w-44 h-44 mx-auto mb-10">
            <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "4s" }} viewBox="0 0 176 176">
              <defs>
                <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(153 70% 48%)" />
                  <stop offset="100%" stopColor="hsl(43 75% 55%)" />
                </linearGradient>
              </defs>
              <circle cx="88" cy="88" r="86" fill="none" stroke="hsl(150 15% 85%)" strokeWidth="1.5" />
              <circle cx="88" cy="88" r="86" fill="none" stroke="url(#arcGrad)" strokeWidth="2" strokeDasharray="100 440" strokeLinecap="round" />
            </svg>
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 176 176">
              <circle cx="88" cy="88" r="74" fill="none" stroke="hsl(150 15% 88%)" strokeWidth="3" />
              <circle cx="88" cy="88" r="74" fill="none" stroke="url(#progressGrad2)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${progress * 4.65} 465`} className="transition-all duration-200 ease-linear" />
              <defs>
                <linearGradient id="progressGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(153 70% 38%)" />
                  <stop offset="100%" stopColor="hsl(43 75% 50%)" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center */}
            <div className="absolute inset-8 rounded-full flex items-center justify-center"
              style={{ background: "hsl(40 30% 96%)" }}>
              <div className="absolute inset-0 rounded-full animate-ping opacity-10" style={{ background: "hsl(153 70% 38%)", animationDuration: "2.5s" }} />
              <PhaseIcon className="w-8 h-8 text-primary relative z-10 transition-all duration-300" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">Analyzing Marketplace</h2>
          <p className="text-sm text-primary font-medium mb-1 h-5">{phases[phase].label}</p>
          <p className="text-xs text-faintest mb-8">{Math.round(progress)}% complete</p>

          <div className="flex items-center justify-center gap-2 mb-10">
            {phases.slice(0, 4).map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= phase ? "w-8" : "w-3"}`}
                style={{ background: i <= phase ? "linear-gradient(90deg, hsl(153 70% 38%), hsl(43 75% 50%))" : "hsl(150 15% 85%)" }} />
            ))}
          </div>

          <div className="glass-card text-left">
            <span className="text-[11px] font-bold uppercase tracking-[2px] gradient-text mb-2 block">Did you know?</span>
            <p className="text-sm text-body leading-relaxed">{fact}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoadingPage;
