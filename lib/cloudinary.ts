import { api } from "./api";

interface SignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export async function uploadToCloudinary(file: File, folder = "portfolio"): Promise<string> {
  const sig = await api<SignatureResponse>(
    `/api/uploads/signature?folder=${encodeURIComponent(folder)}`
  );

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: "POST", body: form }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as CloudinaryUploadResponse;
  return data.secure_url;
}
