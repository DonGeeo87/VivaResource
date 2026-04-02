import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase/config";

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Sube un archivo a Firebase Storage
 * @param file - El archivo a subir
 * @param path - La ruta en Storage (ej: "images/events", "images/blog")
 * @param onProgress - Callback para el progreso de la subida
 * @returns Promise con la URL de descarga o error
 */
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Tipo de archivo no válido. Solo se permiten JPG, PNG, WebP y GIF."
      };
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "El archivo es demasiado grande. Máximo 5MB permitido."
      };
    }

    // Generar nombre único
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `${path}/${fileName}`;

    // Crear referencia
    const storageRef = ref(storage, filePath);

    // Subir archivo
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve) => {
      uploadTask.on(
        "state_changed",
        // Progress callback
        (snapshot) => {
          const progress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          };
          if (onProgress) {
            onProgress(progress);
          }
        },
        // Error callback
        (error) => {
          console.error("Upload error:", error);
          resolve({
            success: false,
            error: getUploadErrorMessage(error.code)
          });
        },
        // Complete callback
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              url: downloadURL
            });
          } catch (error) {
            console.error("Error getting download URL:", error);
            resolve({
              success: false,
              error: "Error al obtener la URL de descarga"
            });
          }
        }
      );
    });
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al subir archivo"
    };
  }
}

/**
 * Elimina un archivo de Firebase Storage
 * @param url - URL del archivo a eliminar
 */
export async function deleteFile(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extraer el path de la URL
    const urlParts = url.split("/o/");
    if (urlParts.length < 2) {
      return {
        success: false,
        error: "URL inválida"
      };
    }

    const path = decodeURIComponent(urlParts[1].split("?")[0]);
    const fileRef = ref(storage, path);

    await deleteObject(fileRef);

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar archivo"
    };
  }
}

/**
 * Obtiene mensaje de error amigable
 */
function getUploadErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case "storage/unauthorized":
      return "No tienes permisos para subir archivos";
    case "storage/canceled":
      return "La subida fue cancelada";
    case "storage/unknown":
      return "Error desconocido al subir archivo";
    default:
      return "Error al subir archivo. Intenta nuevamente.";
  }
}
