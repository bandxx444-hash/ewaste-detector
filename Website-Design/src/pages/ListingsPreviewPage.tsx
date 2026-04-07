import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import ProgressBar from "@/components/ProgressBar";
import { useScan } from "@/context/ScanContext";

const conditionColor = (c: string) => {
  if (c.includes("Like New") || c.includes("Very Good")) return "bg-primary/15 text-primary";
  if (c.includes("Good")) return "bg-primary/10 text-primary-light";
  if (c.includes("Acceptable")) return "bg-accent/15 text-accent";
  return "bg-secondary text-subtle";
};

const ListingsPreviewPage = () => {
  const navigate = useNavigate();
  const { result } = useScan();
  const [idx, setIdx] = useState(0);
  if (!result) { navigate("/"); return null; }

  const listing = result.comparables[idx];
  const total = result.comparables.length;

  return (
    <div className="min-h-screen relative">
      <BackgroundOrbs />
      <Navbar />
      <main className="container mx-auto px-4 max-w-2xl relative z-10 pt-8 pb-20 font-sans">
        <ProgressBar percent={65} />
        <div className="text-center mt-8 mb-8 animate-fade-in-up">
          <p className="text-sm text-subtle mb-1">Estimated Value Range</p>
          <h2 className="text-3xl font-display font-bold">
            <span className="gradient-text">${result.valueLow}–${result.valueHigh}</span>{" "}
            <span className="text-lg text-foreground">· Est. ${result.estimatedValue}</span>
          </h2>
        </div>

        <div className="glass-card animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold">Comparable eBay Listings</h3>
            <span className="text-xs text-subtle">{idx + 1} / {total}</span>
          </div>
          <div className="rounded-xl border border-border h-48 flex items-center justify-center mb-4 relative"
            style={{ background: "hsl(40 30% 96%)" }}>
            {listing.imageUrl ? (
              <img src={listing.imageUrl} alt={listing.title} className="max-h-full object-contain" />
            ) : (
              <div className="text-center text-faintest text-sm">
                <Package className="w-8 h-8 mx-auto mb-2 text-faintest" />
                <p>No image available</p>
              </div>
            )}
            <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setIdx(Math.min(total - 1, idx + 1))} disabled={idx === total - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="border border-border rounded-xl p-4 space-y-2" style={{ background: "hsl(40 30% 96%)" }}>
            <p className="text-sm font-semibold text-foreground">{listing.title}</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold gradient-text text-lg">${listing.soldPrice}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${conditionColor(listing.condition)}`}>{listing.condition}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-subtle">
              <span>Sold {listing.soldDate}</span><span>·</span><span>{listing.variant}</span>
            </div>
            <a href={listing.ebayUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-1">
              <ExternalLink className="w-3 h-3" /> View on eBay
            </a>
          </div>
        </div>

        <button onClick={() => navigate("/results")}
          className="w-full mt-6 py-3.5 rounded-xl font-bold text-[15px] text-primary-foreground shadow-cta transition-all duration-300 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, hsl(153 70% 38%), hsl(153 70% 28%))" }}>
          Continue to My Results →
        </button>
      </main>
    </div>
  );
};

export default ListingsPreviewPage;
