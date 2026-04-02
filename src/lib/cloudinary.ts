export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Upload a file to Cloudinary via our API route (signed upload)
 */
export async function uploadFile(
  file: File,
  folder: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: "Invalid file type. Only JPG, PNG, WebP and GIF are allowed." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File too large. Maximum 5MB allowed." };
  }

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          bytesTransferred: e.loaded,
          totalBytes: e.total,
          percentage: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (response.success) {
          resolve({ success: true, url: response.url, publicId: response.publicId });
        } else {
          resolve({ success: false, error: response.error || "Upload failed" });
        }
      } catch {
        resolve({ success: false, error: "Invalid server response" });
      }
    });

    xhr.addEventListener("error", () => {
      resolve({ success: false, error: "Network error during upload" });
    });

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  });
}

/**
 * Delete a file from Cloudinary via our API route
 */
export async function deleteFile(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    const publicId = extractPublicId(url);
    if (!publicId) {
      return { success: false, error: "Invalid Cloudinary URL" };
    }

    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
    });

    const data = await res.json();
    return data;
  } catch {
    return { success: false, error: "Failed to delete file" };
  }
}

/**
 * Extract public_id from a Cloudinary URL
 * e.g. https://res.cloudinary.com/dr6znho9h/image/upload/v1234567890/folder/file.jpg
 *       -> folder/file
 */
function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
