import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, DollarSign, Store, Recycle, Leaf, ExternalLink, Zap, Clock, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import ProgressBar from "@/components/ProgressBar";
import { useScan, type Decision } from "@/context/ScanContext";

const tradeInLinks = [
  { name: "Best Buy Trade-In", url: "https://www.bestbuy.com/trade-in", desc: "Get gift cards for eligible electronics." },
  { name: "Apple Trade In", url: "https://www.apple.com/shop/trade-in", desc: "Credit toward a new Apple device or gift card." },
  { name: "Amazon Trade-In", url: "https://www.amazon.com/trade-in", desc: "Trade eligible devices for Amazon gift cards." },
];

const recycleLinks = [
  { name: "Best Buy Recycling", url: "https://www.bestbuy.com/recycling", desc: "Free drop-off at any Best Buy location." },
  { name: "Staples Recycling", url: "https://www.staples.com/sbd/cre/marketing/sustainability-center/recycling-services/", desc: "Free tech recycling at Staples stores." },
  { name: "Earth911", url: "https://earth911.com", desc: "Find a local recycling center near you." },
];

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
  const [co2Pulse, setCo2Pulse] = useState(false);
  if (!result) { navigate("/"); return null; }

  const handlePriceChange = (val: number) => {
    setPrice(val);
    setCo2Pulse(true);
    setTimeout(() => setCo2Pulse(false), 600);
  };

  const saleSpeed = (() => {
    const range = result.valueHigh - result.valueLow;
    const pos = range > 0 ? (price - result.valueLow) / range : 0.5;
    if (pos < 0.33) return { label: "Fast Sale Likely", sub: "Typically sells within 1–3 days", icon: <Zap className="w-3.5 h-3.5" />, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };
    if (pos < 0.66) return { label: "Moderate Demand", sub: "Usually sells within 1–2 weeks", icon: <Clock className="w-3.5 h-3.5" />, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" };
    return { label: "Slower Sale Expected", sub: "May take 2+ weeks at this price", icon: <TrendingDown className="w-3.5 h-3.5" />, color: "text-destructive", bg: "bg-destructive/8", border: "border-destructive/20" };
  })();

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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">{result.deviceName}</h1>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-6 ${condBadge[result.condition]}`}>{result.condition}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card-glow mb-4">
          <h3 className="text-sm font-bold text-foreground mb-1">Condition Notes</h3>
          <p className="text-sm text-body leading-relaxed">{result.conditionNotes}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-glow text-center mb-4">
          <p className="text-xs text-subtle mb-1">Market Valuation</p>
          <p className="text-4xl font-display font-bold gradient-text">${result.estimatedValue}</p>
          <p className="text-xs text-faintest mt-1">${result.valueLow} – ${result.valueHigh} range · {result.comparables.length} listings</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card mb-4">
          <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.12), hsl(43 75% 50% / 0.08))", color: "hsl(153 70% 48%)" }}>
            AI Recommends: {result.recommendation.toUpperCase()}
          </span>
          <p className="text-sm text-body">{result.recommendationReason}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card mb-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Your Decision</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDecision("ai")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${decision === "ai" ? "border-primary bg-primary/10 text-primary" : "border-border text-subtle hover:border-primary/30"}`}>
              <Sparkles className="w-4 h-4" /> Keep AI pick
            </button>
            {decisionLabels.map(d => (
              <button key={d.value} onClick={() => setDecision(d.value)}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${decision === d.value ? "border-primary bg-primary/10 text-primary" : "border-border text-subtle hover:border-primary/30"}`}>
                {d.icon} {d.label}
              </button>
            ))}
          </div>
        </motion.div>

        {(decision === "sell" || decision === "ai") && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card mb-4">
            <h3 className="text-sm font-bold text-foreground mb-2">Adjust Your Price</h3>
            <input type="range" min={result.valueLow} max={result.valueHigh} value={price}
              onChange={e => handlePriceChange(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-subtle mt-1">
              <span>${result.valueLow}</span>
              <span className="font-bold gradient-text text-base">${price}</span>
              <span>${result.valueHigh}</span>
            </div>
            <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-300 ${co2Pulse ? "bg-primary/15 scale-[1.02]" : "bg-primary/6"}`}
              style={{ border: `1px solid hsl(153 70% 38% / ${co2Pulse ? "0.35" : "0.15"})` }}>
              <Leaf className={`w-3.5 h-3.5 text-primary transition-transform duration-300 ${co2Pulse ? "scale-125" : ""}`} />
              <span className="text-xs text-primary font-medium">
                Selling keeps <span className="font-bold">{result.co2Saved} lbs of CO₂</span> out of landfills
              </span>
            </div>
            <motion.div
              key={saleSpeed.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2 border ${saleSpeed.bg} ${saleSpeed.border}`}
            >
              <span className={saleSpeed.color}>{saleSpeed.icon}</span>
              <div>
                <span className={`text-xs font-bold ${saleSpeed.color}`}>{saleSpeed.label}</span>
                <span className="text-xs text-subtle ml-1.5">{saleSpeed.sub}</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {decision === "trade-in" && (
          <motion.div key="tradein" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4 space-y-2.5">
            <div className="glass-card-glow text-center py-4 mb-1">
              <p className="text-xs text-subtle mb-1">Estimated Trade-In Value</p>
              <p className="text-3xl font-display font-bold gradient-text">${result.adjustedPrice}</p>
              <p className="text-xs text-faintest mt-1">Varies by retailer and condition</p>
            </div>
            <p className="text-xs font-bold text-subtle uppercase tracking-wide px-1">Where to trade in</p>
            {tradeInLinks.map(l => (
              <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer"
                className="glass-card flex items-center gap-3 group">
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{l.name}</p>
                  <p className="text-xs text-subtle">{l.desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-faintest group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          </motion.div>
        )}

        {decision === "recycle" && (
          <motion.div key="recycle" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4 space-y-2.5">
            <div className="glass-card-glow flex items-center gap-3 py-4 px-4 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.15), hsl(43 75% 50% / 0.08))" }}>
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Great choice for the planet</p>
                <p className="text-xs text-primary font-medium">Keeps <span className="font-bold">{result.co2Saved} lbs of CO₂</span> out of landfills</p>
              </div>
            </div>
            <p className="text-xs font-bold text-subtle uppercase tracking-wide px-1">Where to recycle</p>
            {recycleLinks.map(l => (
              <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer"
                className="glass-card flex items-center gap-3 group">
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{l.name}</p>
                  <p className="text-xs text-subtle">{l.desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-faintest group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          </motion.div>
        )}

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          className="w-full py-3.5 rounded-xl font-bold text-[15px] text-primary-foreground shadow-cta gradient-btn relative overflow-hidden"
        >
          <span className="relative z-10">
            {decision === "recycle" ? "Find Recycling Centers →" : decision === "trade-in" ? "Continue to Trade-In →" : "Generate My Listing →"}
          </span>
        </motion.button>
      </main>
    </div>
  );
};

export default ResultsPage;
