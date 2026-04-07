import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Image, Video, ArrowLeft, Check, Camera, Loader2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import ProgressBar from "@/components/ProgressBar";
import { useScan } from "@/context/ScanContext";
import { identifyDevice } from "@/lib/api";

const UploadPage = () => {
  const navigate = useNavigate();
  const { files, setFiles, setDiagnostics } = useScan();
  const [tab, setTab] = useState<"photos" | "video">("photos");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
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
    try {
      const mediaFiles = tab === "photos" ? files : (videoFile ? [videoFile] : []);
      // Only pass image files to identify (skip video — Claude can't process video directly)
      const imageFiles = mediaFiles.filter(f => f.type.startsWith("image/"));
      const diag = await identifyDevice(imageFiles.length > 0 ? imageFiles : mediaFiles);
      setDiagnostics(diag);
      navigate("/diagnostics");
    } catch (err) {
      setError("Could not identify device. Please try again.");
    } finally {
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

        <div className="text-center mb-8 animate-fade-in-up">
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-primary mb-3 block font-sans">Step 1 of 4</span>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 gradient-border"
            style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.1), hsl(43 75% 50% / 0.05))" }}>
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl md:text-[36px] font-display font-bold mb-2">Upload Your Device</h2>
          <p className="text-subtle text-sm max-w-md mx-auto">Show us your device from multiple angles for the most accurate valuation.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl p-1 mb-6 max-w-xs mx-auto" style={{ background: "hsl(150 15% 92%)" }}>
          {(["photos", "video"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t ? "bg-secondary text-foreground shadow-sm" : "text-subtle hover:text-foreground"
              }`}
            >
              {t === "photos" ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              {t === "photos" ? "Photos" : "Video"}
            </button>
          ))}
        </div>

        {/* Upload zone */}
        {tab === "photos" ? (
          <div>
            <div
              className="border border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/40 transition-all duration-300"
              style={{ background: "hsl(40 30% 96%)" }}
              onDragOver={e => e.preventDefault()} onDrop={handlePhotoDrop} onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Drop photos here or click to browse</p>
              <p className="text-xs text-faintest">JPG, PNG, WEBP · Multiple files accepted</p>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
            </div>
            {files.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                    <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                    <button
                      onClick={e => { e.stopPropagation(); setFiles(files.filter((_, j) => j !== i)); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div
              className="border border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/40 transition-all duration-300"
              style={{ background: "hsl(40 30% 96%)" }}
              onClick={() => videoRef.current?.click()}
            >
              <Video className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Drop a video or click to browse</p>
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

        {error && (
          <p className="mt-4 text-sm text-destructive text-center">{error}</p>
        )}

        {hasMedia && (
          <div className="mt-6 animate-fade-in-up">
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 gradient-border"
              style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.08), hsl(43 75% 50% / 0.04))" }}>
              <Check className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {mediaCount} {tab === "photos" ? "image(s)" : "video"} ready · AI will auto-identify your device
              </span>
            </div>
            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-[15px] text-primary-foreground shadow-cta transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ background: "linear-gradient(135deg, hsl(153 70% 38%), hsl(153 70% 28%))" }}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Identifying device…</>
              ) : (
                "Continue — AI will auto-fill details →"
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default UploadPage;
