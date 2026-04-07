import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BarChart3, FileText, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import ProgressBar from "@/components/ProgressBar";
import { useScan } from "@/context/ScanContext";
import { getRandomFact } from "@/lib/mock-ai";
import { analyzeDevice } from "@/lib/api";

const phases = [
  { icon: Search, label: "Searching marketplace listings..." },
  { icon: BarChart3, label: "Grading device condition..." },
  { icon: FileText, label: "Building your valuation..." },
  { icon: CheckCircle, label: "Finalizing results..." },
];

const LoadingPage = () => {
  const navigate = useNavigate();
  const { diagnostics, files, setResult } = useScan();
  const [fact] = useState(getRandomFact);
  const [phase, setPhase] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const called = useRef(false);

  // Animate phase labels
  useEffect(() => {
    const durations = [2000, 2000, 2000, 1000];
    if (phase < phases.length - 1) {
      const t = setTimeout(() => setPhase(p => p + 1), durations[phase]);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Animate progress bar (stops at 95 until API returns)
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(p => p < 95 ? Math.min(p + 0.8, 95) : p);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Call real API once
  useEffect(() => {
    if (called.current) return;
    called.current = true;

    analyzeDevice(diagnostics, files)
      .then(result => {
        setScanProgress(100);
        setResult(result);
        navigate("/listings-preview");
      })
      .catch(err => {
        console.error(err);
        setError("Analysis failed. Please go back and try again.");
      });
  }, []); // eslint-disable-line

  const PhaseIcon = phases[phase].icon;

  return (
    <div className="min-h-screen relative">
      <BackgroundOrbs />
      <Navbar />
      <main className="container mx-auto px-4 max-w-lg relative z-10 pt-20 pb-20 text-center font-sans">
        <ProgressBar percent={55} />

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
                strokeDasharray={`${scanProgress * 4.65} 465`} className="transition-all duration-100 ease-linear" />
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
          {error ? (
            <p className="text-sm text-destructive font-medium mb-1">{error}</p>
          ) : (
            <p className="text-sm text-primary font-medium mb-1 h-5">{phases[phase].label}</p>
          )}
          <p className="text-xs text-faintest mb-8">{Math.round(scanProgress)}% complete</p>

          <div className="flex items-center justify-center gap-2 mb-10">
            {phases.map((_, i) => (
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
