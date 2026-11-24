// Client-side photo preparation: resize to max 1024 px on the longer side and
// re-encode as JPEG q0.85. Re-encoding through a canvas drops all EXIF (incl. GPS).

export const MAX_SIDE_PX = 1024;
const JPEG_QUALITY = 0.85;

export function computeTargetSize(
  width: number,
  height: number,
  max = MAX_SIDE_PX,
): { width: number; height: number } {
  const longer = Math.max(width, height);
  if (longer <= max) return { width, height };
  const scale = max / longer;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** Returns JPEG base64 without the `data:` prefix. */
export async function prepareImage(file: File): Promise<string> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("image_decode_failed");
  }

  try {
    const { width, height } = computeTargetSize(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("image_encode_failed");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) throw new Error("image_encode_failed");
    return await blobToBase64(blob);
  } finally {
    bitmap.close();
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("image_encode_failed"));
    reader.readAsDataURL(blob);
  });
}
