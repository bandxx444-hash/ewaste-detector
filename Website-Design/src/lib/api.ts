import type { DiagnosticsData, ScanResult } from "@/context/ScanContext";

export async function identifyDevice(files: File[]): Promise<DiagnosticsData> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await fetch("/api/identify", { method: "POST", body: form });
  if (!res.ok) throw new Error(`Identify failed: ${res.statusText}`);
  return res.json();
}

export async function analyzeDevice(
  diagnostics: DiagnosticsData,
  files: File[]
): Promise<ScanResult> {
  const form = new FormData();
  form.append("diagnostics", JSON.stringify(diagnostics));
  files.forEach((f) => form.append("files", f));
  const res = await fetch("/api/analyze", { method: "POST", body: form });
  if (!res.ok) throw new Error(`Analyze failed: ${res.statusText}`);
  const data = await res.json();
  // Proxy eBay images through backend to avoid hotlink blocking
  if (data.comparables) {
    data.comparables = data.comparables.map((c: { imageUrl?: string }) => ({
      ...c,
      imageUrl: c.imageUrl ? `/api/image-proxy?url=${encodeURIComponent(c.imageUrl)}` : "",
    }));
  }
  // scannedAt comes as ISO string, convert to Date
  return { ...data, scannedAt: new Date(data.scannedAt) };
}

export async function generateListing(result: ScanResult): Promise<string> {
  const form = new FormData();
  form.append("result", JSON.stringify(result));
  const res = await fetch("/api/listing", { method: "POST", body: form });
  if (!res.ok) throw new Error(`Listing failed: ${res.statusText}`);
  const data = await res.json();
  return data.listing;
}
