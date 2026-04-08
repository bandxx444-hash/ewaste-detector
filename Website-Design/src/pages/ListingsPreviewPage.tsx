import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import ProgressBar from "@/components/ProgressBar";
import { useScan } from "@/context/ScanContext";

const ListingsPreviewPage = () => {
  const navigate = useNavigate();
  const { result } = useScan();
  const [idx, setIdx] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  if (!result) { navigate("/"); return null; }

  const listing = result.comparables[idx];
  const total = result.comparables.length;
  const hasImage = !!(listing.imageUrl && !imgErrors[idx]);

  const handlePrev = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIdx(i => Math.max(0, i - 1)); };
  const handleNext = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIdx(i => Math.min(total - 1, i + 1)); };

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

          {/* Image card — links directly to eBay listing */}
          <div className="relative rounded-2xl overflow-hidden border border-border bg-white">
            {hasImage ? (
              <a href={listing.ebayUrl} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="relative h-72 flex items-center justify-center bg-[hsl(40_20%_97%)]">
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-contain p-6"
                    onError={() => setImgErrors(e => ({ ...e, [idx]: true }))}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors flex items-end justify-center pb-4">
                    <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-semibold text-foreground shadow opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4 text-primary" /> View on eBay
                    </div>
                  </div>
                </div>
              </a>
            ) : (
              /* No image — show link button */
              <a href={listing.ebayUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center h-40 gap-2 text-primary font-semibold hover:underline group">
                <ExternalLink className="w-5 h-5" />
                View listing on eBay
              </a>
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

            {/* Bottom strip — title + price + eBay link */}
            <div className="flex items-center gap-3 px-4 py-3 border-t border-border">
              <span className="font-bold gradient-text text-lg">${listing.soldPrice}</span>
              <span className="text-sm text-foreground truncate flex-1">{listing.title}</span>
              <a href={listing.ebayUrl} target="_blank" rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                <ExternalLink className="w-3 h-3" /> eBay
              </a>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            {result.comparables.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === idx ? "w-5 bg-primary" : "w-2 bg-border hover:bg-primary/40"}`} />
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
