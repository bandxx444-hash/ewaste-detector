import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowRight } from "lucide-react";
import { useScan } from "@/context/ScanContext";
import { identifyDevice } from "@/lib/api";

const HeroSection = () => {
  const navigate = useNavigate();
  const { setFiles, setDiagnostics } = useScan();
  const fileRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (fileList: File[]) => {
    const imageFiles = fileList.filter(f => f.type.startsWith("image/"));
    setFiles(fileList);
    navigate("/upload");
    // Kick off identify in background — UploadPage will handle it on Continue
  }, [setFiles, navigate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));
    if (dropped.length) processFiles(dropped);
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(Array.from(e.target.files));
  }, [processFiles]);

  return (
    <section className="relative z-10 pt-24 pb-16 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-10 animate-fade-in-up gradient-border"
        style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.08), hsl(43 75% 50% / 0.05))" }}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "linear-gradient(135deg, hsl(153 70% 48%), hsl(43 75% 55%))" }} />
        <span className="text-xs font-medium font-sans text-subtle tracking-wide">
          AI-Powered · Real-Time Market Pricing · Free to Use
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl md:text-[64px] font-bold leading-[1.08] mb-7 animate-fade-in-up tracking-tight" style={{ animationDelay: "0.1s" }}>
        E-Waste Value
        <br />
        <span className="text-shimmer">Detector.</span>
      </h1>

      {/* Subtext */}
      <p className="text-lg text-subtle max-w-[520px] mx-auto mb-12 leading-relaxed font-sans animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        Snap a photo of your old electronics and instantly discover their market value, optimal selling channels, and environmental impact.
      </p>

      {/* CTA Row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <button
          onClick={() => navigate("/upload")}
          className="group px-8 py-4 rounded-xl font-bold text-[15px] text-primary-foreground shadow-cta transition-all duration-300 hover:-translate-y-1 hover:shadow-glow font-sans flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, hsl(153 70% 38%), hsl(153 70% 28%))" }}
        >
          Start Scanning
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground mb-2 font-sans">Drop a photo or video to begin</p>
          <div
            className="border border-border rounded-2xl h-[100px] w-[280px] flex items-center justify-center gap-2 text-subtle text-sm cursor-pointer transition-all duration-300 hover:border-primary/40 hover:shadow-glow font-sans"
            style={{ background: "hsl(40 30% 96%)" }}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-5 h-5 text-primary" />
            Click or drag to upload
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileSelect} />
        </div>
      </div>

      {/* 3-step explainer */}
      <div className="glass-card inline-flex flex-wrap items-center justify-center gap-8 md:gap-12 text-sm animate-fade-in-up font-sans" style={{ animationDelay: "0.4s" }}>
        {[
          { n: "01", title: "Upload Media", sub: "Photo or video" },
          { n: "02", title: "AI Analysis", sub: "Instant detection" },
          { n: "03", title: "Get Your Listing", sub: "Sell or recycle" },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-2xl font-display font-bold gradient-text">{step.n}</span>
            <div className="text-left">
              <div className="font-semibold text-foreground">{step.title}</div>
              <div className="text-xs text-subtle">{step.sub}</div>
            </div>
            {i < 2 && <span className="text-faintest ml-3 hidden md:inline">→</span>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
