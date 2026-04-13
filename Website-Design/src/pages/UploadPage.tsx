import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Image, Video, ArrowLeft, Check, Camera, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import ProgressBar from "@/components/ProgressBar";
import { useScan } from "@/context/ScanContext";

const UploadPage = () => {
  const navigate = useNavigate();
  const { files, setFiles, setDiagnostics } = useScan();
  const [tab, setTab] = useState<"photos" | "video">("photos");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState<{ name: string; confidence: number } | null>(null);
  const [scanPhase, setScanPhase] = useState(0);
  const scanPhases = ["Preprocessing image…", "Detecting device type…", "Identifying model…", "Calculating confidence…"];

  const handlePhotoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    setFiles([...files, ...dropped]);
  }, [files, setFiles]);

  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
  }, [files, setFiles]);

  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
      setFiles([e.target.files[0]]);
    }
  }, [setFiles]);

  const handleContinue = async () => {
    setLoading(true);
    setError(null);
    setScanPhase(0);
    // Cycle through scan phases while waiting
    const phaseInterval = setInterval(() => {
      setScanPhase(p => Math.min(p + 1, scanPhases.length - 1));
    }, 700);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append("files", f));
      const apiBase = import.meta.env.VITE_API_URL ?? "";
      const res = await fetch(`${apiBase}/api/identify`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Identification failed");
      const diag = await res.json();
      clearInterval(phaseInterval);
      setScanPhase(scanPhases.length - 1);
      // Calculate confidence from aiConfidence fields
      const allFields = Object.values(diag.aiConfidence || {});
      const confidentCount = allFields.filter(Boolean).length;
      const confidencePct = allFields.length > 0 ? Math.round((confidentCount / allFields.length) * 100) : 92;
      setDetected({ name: diag.productName || diag.brand || "Your Device", confidence: confidencePct });
      setDiagnostics(diag);
      // Show detection result briefly, then navigate
      setTimeout(() => navigate("/diagnostics"), 1600);
    } catch {
      clearInterval(phaseInterval);
      setError("Could not identify your device. Please try again.");
      setLoading(false);
    }
  };

  const hasMedia = tab === "photos" ? files.length > 0 : !!videoFile;
  const mediaCount = tab === "photos" ? files.length : (videoFile ? 1 : 0);

  return (
    <div className="min-h-screen relative">
      <BackgroundOrbs />
      <Navbar />
      <main className="container mx-auto px-4 max-w-2xl relative z-10 pt-8 pb-20 font-sans">
        <ProgressBar percent={10} />

        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-subtle mt-6 mb-4 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-primary mb-3 block font-sans">Step 1 of 4</span>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 gradient-border"
            style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.1), hsl(43 75% 50% / 0.05))" }}>
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl md:text-[36px] font-display font-bold mb-2">Upload Your Device</h2>
          <p className="text-subtle text-sm max-w-md mx-auto">Show us your device from multiple angles for the most accurate valuation.</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-1 rounded-xl p-1 mb-6 max-w-xs mx-auto"
          style={{ background: "hsl(150 15% 92%)" }}
        >
          {(["photos", "video"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t ? "text-foreground" : "text-subtle hover:text-foreground"
              }`}
            >
              {tab === t && (
                <motion.div layoutId="uploadTab" className="absolute inset-0 bg-secondary rounded-lg shadow-sm -z-10" />
              )}
              {t === "photos" ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              {t === "photos" ? "Photos" : "Video"}
            </button>
          ))}
        </motion.div>

        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {tab === "photos" ? (
            <div>
              <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                  isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/40"
                }`}
                style={{ background: isDragging ? undefined : "hsl(40 30% 97%)" }}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handlePhotoDrop}
                onClick={() => fileRef.current?.click()}
              >
                <motion.div
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 gradient-border"
                  style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.1), hsl(43 75% 50% / 0.05))" }}
                >
                  <Upload className="w-7 h-7 text-primary" />
                </motion.div>
                <p className="text-sm font-semibold text-foreground mb-1">Drop photos here or click to browse</p>
                <p className="text-xs text-faintest">JPG, PNG, WEBP · Multiple files accepted</p>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
              </div>
              {files.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {files.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="aspect-square rounded-xl overflow-hidden border border-border shadow-sm"
                    >
                      <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div
                className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary/40 transition-all duration-300"
                style={{ background: "hsl(40 30% 97%)" }}
                onClick={() => videoRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 gradient-border"
                  style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.1), hsl(43 75% 50% / 0.05))" }}
                >
                  <Video className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">Drop a video or click to browse</p>
                <p className="text-xs text-faintest">MP4, MOV, AVI · Single file</p>
                <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
              </div>
              {videoFile && (
                <div className="mt-4 rounded-xl overflow-hidden border border-border">
                  <video src={URL.createObjectURL(videoFile)} controls className="w-full max-h-64 object-contain" />
                </div>
              )}
            </div>
          )}
        </motion.div>

        {error && (
          <div className="mt-4 rounded-xl px-4 py-3 text-sm text-destructive border border-destructive/20 bg-destructive/5">
            {error}
          </div>
        )}

        {hasMedia && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 gradient-border"
              style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.08), hsl(43 75% 50% / 0.04))" }}>
              <Check className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {mediaCount} {tab === "photos" ? "image(s)" : "video"} ready · AI will auto-identify your device
              </span>
            </div>
            {loading && detected ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-primary/30 px-6 py-5 text-center mb-2"
                style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.08), hsl(43 75% 50% / 0.05))" }}
              >
                <Check className="w-7 h-7 text-primary mx-auto mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Device Detected</p>
                <p className="text-lg font-display font-bold text-foreground mb-1">{detected.name}</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1.5 rounded-full overflow-hidden flex-1 max-w-[120px]" style={{ background: "hsl(150 15% 88%)" }}>
                    <motion.div className="h-full rounded-full" style={{ background: "hsl(153 70% 38%)" }}
                      initial={{ width: 0 }} animate={{ width: `${detected.confidence}%` }} transition={{ duration: 0.6 }} />
                  </div>
                  <span className="text-sm font-bold gradient-text">{detected.confidence}% Match</span>
                </div>
              </motion.div>
            ) : loading ? (
              <div className="rounded-2xl border border-border px-5 py-4 mb-2" style={{ background: "hsl(40 30% 97%)" }}>
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{scanPhases[scanPhase]}</p>
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "hsl(150 15% 88%)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: "hsl(153 70% 38%)" }}
                        animate={{ width: [`${(scanPhase / scanPhases.length) * 80}%`, `${((scanPhase + 1) / scanPhases.length) * 90}%`] }}
                        transition={{ duration: 0.6 }} />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {!loading && (
              <button onClick={handleContinue}
                className="w-full py-3.5 rounded-xl font-bold text-[15px] text-primary-foreground shadow-cta transition-all duration-300 hover:-translate-y-0.5 gradient-btn relative overflow-hidden flex items-center justify-center gap-2">
                <span className="relative z-10">Continue — AI will auto-fill details →</span>
              </button>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default UploadPage;
