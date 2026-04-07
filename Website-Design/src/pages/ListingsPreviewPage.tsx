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
  const [imgError, setImgError] = useState(false);
  if (!result) { navigate("/"); return null; }

  const listing = result.comparables[idx];
  const total = result.comparables.length;

  const handlePrev = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIdx(Math.max(0, idx - 1)); setImgError(false); };
  const handleNext = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIdx(Math.min(total - 1, idx + 1)); setImgError(false); };

  return (
    <div className="min-h-screen relative">
      <BackgroundOrbs />
      <Navbar />
      <main className="container mx-auto px-4 max-w-2xl relative z-10 pt-8 pb-20 font-sans">
        <ProgressBar percent={65} />
        <div className="text-center mt-8 mb-6 animate-fade-in-up">
          <p className="text-sm text-subtle mb-1">Estimated Value Range</p>
          <h2 className="text-3xl font-display font-bold">
            <span className="gradient-text">${result.valueLow}–${result.valueHigh}</span>{" "}
            <span className="text-lg text-foreground">· Est. ${result.estimatedValue}</span>
          </h2>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-display font-bold">Comparable eBay Listings</h3>
            <span className="text-xs text-subtle">{idx + 1} / {total}</span>
          </div>

          {/* Clickable listing card — full image */}
          <a
            href={listing.ebayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
            style={{ background: "hsl(40 20% 96%)" }}
          >
            {/* Big image */}
            <div className="relative h-72 flex items-center justify-center">
              {listing.imageUrl && !imgError ? (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-full object-contain p-6"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="text-center text-faintest">
                  <Package className="w-14 h-14 mx-auto mb-2 opacity-25" />
                  <p className="text-sm opacity-50">No image available</p>
                </div>
              )}

              {/* Nav arrows */}
              <button onClick={handlePrev} disabled={idx === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-border shadow flex items-center justify-center hover:bg-white disabled:opacity-25 transition-all z-10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleNext} disabled={idx === total - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-border shadow flex items-center justify-center hover:bg-white disabled:opacity-25 transition-all z-10">
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* "Open on eBay" hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-semibold text-foreground shadow opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4 text-primary" /> Open on eBay
                </div>
              </div>
            </div>

            {/* Price strip */}
            <div className="flex items-center gap-3 px-4 py-3 border-t border-border bg-white/60">
              <span className="font-bold gradient-text text-lg">${listing.soldPrice}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${conditionColor(listing.condition)}`}>{listing.condition}</span>
              <span className="ml-auto text-xs text-subtle">Sold {listing.soldDate}</span>
            </div>
          </a>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            {result.comparables.map((_, i) => (
              <button key={i} onClick={() => { setIdx(i); setImgError(false); }}
                className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-primary w-4" : "bg-border hover:bg-primary/40"}`} />
            ))}
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
