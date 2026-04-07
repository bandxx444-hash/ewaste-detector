import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, DollarSign, Store, Recycle } from "lucide-react";
import Navbar from "@/components/Navbar";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import ProgressBar from "@/components/ProgressBar";
import { useScan, type Decision } from "@/context/ScanContext";

const condBadge: Record<string, string> = {
  Excellent: "bg-primary/15 text-primary border-primary/20",
  Good: "bg-primary/10 text-primary-light border-primary/15",
  Fair: "bg-accent/15 text-accent border-accent/20",
  Poor: "bg-destructive/15 text-destructive border-destructive/20",
};

const decisionLabels: { value: Decision; icon: React.ReactNode; label: string }[] = [
  { value: "sell", icon: <DollarSign className="w-4 h-4" />, label: "Sell it" },
  { value: "trade-in", icon: <Store className="w-4 h-4" />, label: "Trade it in" },
  { value: "recycle", icon: <Recycle className="w-4 h-4" />, label: "Recycle it" },
];

const ResultsPage = () => {
  const navigate = useNavigate();
  const { result, setResult } = useScan();
  const [decision, setDecision] = useState<Decision | "ai">(result?.recommendation || "sell");
  const [price, setPrice] = useState(result?.adjustedPrice || 0);
  if (!result) { navigate("/"); return null; }

  const handleGenerate = () => {
    setResult({ ...result, decision: decision === "ai" ? result.recommendation : decision, adjustedPrice: price });
    navigate("/listing");
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundOrbs />
      <Navbar />
      <main className="container mx-auto px-4 max-w-2xl relative z-10 pt-8 pb-20 font-sans">
        <ProgressBar percent={85} />
        <button onClick={() => navigate("/listings-preview")} className="flex items-center gap-1.5 text-sm text-subtle mt-6 mb-4 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="animate-fade-in-up">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">{result.deviceName}</h1>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-6 ${condBadge[result.condition]}`}>{result.condition}</span>
        </div>

        <div className="glass-card mb-4 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <h3 className="text-sm font-bold text-foreground mb-1">Condition Notes</h3>
          <p className="text-sm text-body leading-relaxed">{result.conditionNotes}</p>
        </div>

        <div className="glass-card text-center mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-xs text-subtle mb-1">Market Valuation</p>
          <p className="text-4xl font-display font-bold gradient-text">${result.estimatedValue}</p>
          <p className="text-xs text-faintest mt-1">${result.valueLow} – ${result.valueHigh} range · {result.comparables.length} listings</p>
        </div>

        <div className="glass-card mb-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.12), hsl(43 75% 50% / 0.08))", color: "hsl(153 70% 48%)" }}>
            AI Recommends: {result.recommendation.toUpperCase()}
          </span>
          <p className="text-sm text-body">{result.recommendationReason}</p>
        </div>

        <div className="glass-card mb-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-sm font-bold text-foreground mb-3">Your Decision</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDecision("ai")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${decision === "ai" ? "border-primary bg-primary/10 text-primary" : "border-border text-subtle hover:border-primary/30"}`}>
              <Sparkles className="w-4 h-4" /> Keep AI pick
            </button>
            {decisionLabels.map(d => (
              <button key={d.value} onClick={() => setDecision(d.value)}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${decision === d.value ? "border-primary bg-primary/10 text-primary" : "border-border text-subtle hover:border-primary/30"}`}>
                {d.icon} {d.label}
              </button>
            ))}
          </div>
        </div>

        {(decision === "sell" || decision === "ai") && (
          <div className="glass-card mb-6 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <h3 className="text-sm font-bold text-foreground mb-2">Adjust Your Price</h3>
            <input type="range" min={result.valueLow} max={result.valueHigh} value={price}
              onChange={e => setPrice(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-subtle mt-1">
              <span>${result.valueLow}</span>
              <span className="font-bold gradient-text text-base">${price}</span>
              <span>${result.valueHigh}</span>
            </div>
          </div>
        )}

        <button onClick={handleGenerate}
          className="w-full py-3.5 rounded-xl font-bold text-[15px] text-primary-foreground shadow-cta transition-all duration-300 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, hsl(153 70% 38%), hsl(153 70% 28%))" }}>
          Generate My Listing →
        </button>
      </main>
    </div>
  );
};

export default ResultsPage;
