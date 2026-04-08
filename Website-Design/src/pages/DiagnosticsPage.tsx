import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle, Cpu, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import ProgressBar from "@/components/ProgressBar";
import { useScan } from "@/context/ScanContext";

// Very short or generic strings that aren't real device info
const JUNK_PATTERNS = /^(yes|no|ok|test|asdf|qwerty|hello|hi|abc|123|n\/a|na|none|idk|unknown|null|undefined|\.+|-)$/i;

function looksLikeJunk(val: string) {
  return !val.trim() || val.trim().length < 2 || JUNK_PATTERNS.test(val.trim());
}

const DiagnosticsPage = () => {
  const navigate = useNavigate();
  const { diagnostics, setDiagnostics } = useScan();
  const [form, setForm] = useState(diagnostics);
  const [validationError, setValidationError] = useState<string | null>(null);

  const confident = Object.entries(form.aiConfidence).filter(([, v]) => v);
  const uncertain = Object.entries(form.aiConfidence).filter(([, v]) => !v);
  const allConfident = uncertain.length === 0;

  const update = (key: string, value: any) => {
    setValidationError(null);
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (looksLikeJunk(form.productName)) {
      setValidationError("Please enter a valid product name (e.g. \"iPhone 12\", \"MacBook Pro\", \"Samsung Galaxy S21\").");
      return;
    }
    if (looksLikeJunk(form.brand)) {
      setValidationError("Please enter the device brand (e.g. \"Apple\", \"Samsung\", \"Dell\").");
      return;
    }
    setDiagnostics(form);
    navigate("/loading");
  };

  const fieldLabel = (key: string) => ({
    productName: "Product Name", brand: "Brand", modelNumber: "Model Number",
    yearOfPurchase: "Year of Purchase", powersOn: "Does the device power on?", screenCondition: "Screen Condition",
  }[key] || key);

  const isUncertain = (key: string) => form.aiConfidence[key] === false;

  const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-card text-foreground placeholder:text-faintest focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans";

  return (
    <div className="min-h-screen relative">
      <BackgroundOrbs />
      <Navbar />
      <main className="container mx-auto px-4 max-w-2xl relative z-10 pt-8 pb-20 font-sans">
        <ProgressBar percent={35} />

        <button onClick={() => navigate("/upload")} className="flex items-center gap-1.5 text-sm text-subtle mt-6 mb-4 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-6 animate-fade-in-up">
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-primary mb-3 block">Step 2 of 4</span>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 gradient-border"
            style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.1), hsl(43 75% 50% / 0.05))" }}>
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl md:text-[36px] font-display font-bold mb-2">Device Diagnostics</h2>
        </div>

        {allConfident ? (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-6 animate-fade-in-up gradient-border"
            style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.08), transparent)" }}>
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI identified all fields from your media</span>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-xl px-4 py-3 mb-6 animate-fade-in-up gradient-border"
            style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.06), hsl(43 75% 50% / 0.04))" }}>
            <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="text-primary font-medium">AI filled in {confident.length} field(s) automatically.</span>{" "}
              <span className="text-accent font-medium">{uncertain.length} field(s) couldn't be determined — please complete them below.</span>
            </div>
          </div>
        )}

        <div className="glass-card animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="space-y-5">
            {(["productName", "brand", "modelNumber", "yearOfPurchase"] as const).map(key => (
              <div key={key}>
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  {fieldLabel(key)}
                  {key === "modelNumber" && <span className="text-faintest font-normal">(optional)</span>}
                  {isUncertain(key) && <AlertTriangle className="w-3.5 h-3.5 text-accent" />}
                </label>
                <input
                  type={key === "yearOfPurchase" ? "number" : "text"}
                  value={(form as any)[key]}
                  onChange={e => update(key, key === "yearOfPurchase" ? parseInt(e.target.value) : e.target.value)}
                  placeholder={key === "productName" ? "e.g. iPhone 12" : key === "brand" ? "e.g. Apple" : key === "modelNumber" ? "e.g. A2172" : ""}
                  className={inputCls}
                />
              </div>
            ))}

            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
                {fieldLabel("powersOn")}
                {isUncertain("powersOn") && <AlertTriangle className="w-3.5 h-3.5 text-accent" />}
              </label>
              <div className="flex gap-3">
                {[true, false].map(val => (
                  <button key={String(val)} onClick={() => update("powersOn", val)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      form.powersOn === val ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-subtle hover:border-primary/30"
                    }`}>
                    {val ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                {fieldLabel("screenCondition")}
                {isUncertain("screenCondition") && <AlertTriangle className="w-3.5 h-3.5 text-accent" />}
              </label>
              <select value={form.screenCondition} onChange={e => update("screenCondition", e.target.value)} className={inputCls}>
                <option value="">Select condition…</option>
                <option value="Flawless">Flawless</option>
                <option value="Minor Scratches">Minor Scratches</option>
                <option value="Cracked">Cracked</option>
                <option value="Screen is off/broken">Screen is off/broken</option>
              </select>
            </div>
          </div>

          {validationError && (
            <div className="mt-5 flex items-start gap-2 rounded-xl px-4 py-3 bg-destructive/10 border border-destructive/20">
              <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="text-destructive font-medium">{validationError}</p>
                <button onClick={() => navigate("/upload")} className="text-xs text-subtle underline mt-1 hover:text-foreground transition-colors">
                  Retake photos for better AI detection →
                </button>
              </div>
            </div>
          )}

          <button onClick={handleSubmit}
            className="w-full mt-6 py-3.5 rounded-xl font-bold text-[15px] text-primary-foreground shadow-cta transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(153 70% 38%), hsl(153 70% 28%))" }}>
            Run AI Analysis →
          </button>
        </div>
      </main>
    </div>
  );
};

export default DiagnosticsPage;
