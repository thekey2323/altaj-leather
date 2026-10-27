import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMAD(amount: number): string {
  return `${Math.round(amount)} DH`;
}

export function validateMoroccanPhone(phone: string): { isValid: boolean; normalized: string; message?: string } {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  
  // Format: 06XXXXXXXX or 07XXXXXXXX (10 digits)
  if (/^0[67]\d{8}$/.test(cleaned)) {
    return { isValid: true, normalized: cleaned };
  }
  
  // Format: +2126XXXXXXXX or +2127XXXXXXXX
  if (/^\+212[67]\d{8}$/.test(cleaned)) {
    return { isValid: true, normalized: cleaned.replace("+212", "0") };
  }
  
  // Format: 2126XXXXXXXX or 2127XXXXXXXX
  if (/^212[67]\d{8}$/.test(cleaned)) {
    return { isValid: true, normalized: `0${cleaned.slice(3)}` };
  }
  
  // Format: 6XXXXXXXX or 7XXXXXXXX (9 digits without leading 0)
  if (/^[67]\d{8}$/.test(cleaned)) {
    return { isValid: true, normalized: `0${cleaned}` };
  }

  return {
    isValid: false,
    normalized: cleaned,
    message: "Veuillez entrer un numéro marocain valide (ex: 06 12 34 56 78 ou 07 12 34 56 78)",
  };
}

export const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Fès",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Safi",
  "Mohammédia",
  "El Jadida",
  "Béni Mellal",
  "Nador",
  "Taza",
  "Settat",
  "Berrechid",
  "Khémisset",
  "Guelmim",
  "Larache",
  "Ksar El Kebir",
  "Dakhla",
  "Laâyoune",
  "Autre ville",
];

/**
 * Compresses an image file client-side using HTML5 Canvas to prevent LocalStorage QuotaExceededError.
 * Resizes camera/smartphone photos down to max 800x800 and compresses to lightweight JPEG (~30-60 KB).
 */
export function compressImageFile(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Le fichier sélectionné n'est pas une image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(readerEvent.target?.result as string);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

