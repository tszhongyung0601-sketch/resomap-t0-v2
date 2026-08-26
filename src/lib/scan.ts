/**
 * Reading a barcode out of a photograph.
 *
 * The first runtime dependency this project has taken, and it is here because
 * the alternative was to stop calling the feature "real". A boarding pass keeps
 * its data in a PDF417 barcode; without a decoder there is nothing to parse,
 * and the document screen would be a form somebody types into while an app
 * watches. `BarcodeDetector` would have been free but only exists in Chromium,
 * and a feature that works on the presenter's laptop and not on the audience's
 * phones is not a feature.
 *
 * It is loaded on demand and never at start-up. The wasm is several hundred
 * kilobytes and the overwhelming majority of sessions never open a document, so
 * the import sits inside the function that needs it. Nothing about the initial
 * bundle changes for anybody who does not scan.
 *
 * Every failure resolves rather than throws. A blurred photo, an unsupported
 * browser, a wasm that would not load — all of them come back as
 * `{ ok: false }` and the screen falls through to typing it in, which is the
 * behaviour the rest of this app has for every optional capability.
 */

export interface ScanHit {
  ok: true;
  /** Exactly what the barcode encoded, unmodified. */
  text: string;
  /** "PDF417" for a boarding pass, "QRCode" for most hotel codes. */
  format: string;
}

export interface ScanMiss {
  ok: false;
  /** Said to the traveller, so it has to name the next thing to try. */
  reason: string;
}

export type ScanResult = ScanHit | ScanMiss;

/**
 * The formats worth looking for.
 *
 * Narrow on purpose: asking the decoder for everything makes it slower and
 * makes it likelier to find a barcode that is not the one in the picture — the
 * IATA logo on a boarding pass is not a Code 39 and should not be read as one.
 */
const FORMATS = ["PDF417", "QRCode", "Aztec", "DataMatrix"] as const;

export async function scanImage(file: File): Promise<ScanResult> {
  try {
    /* Dynamic, so the wasm never enters the initial bundle. */
    const { readBarcodes } = await import("zxing-wasm/reader");
    const results = await readBarcodes(file, {
      tryHarder: true,
      formats: [...FORMATS],
      maxNumberOfSymbols: 1,
    });

    const hit = results.find((r) => r.text);
    if (!hit) {
      return {
        ok: false,
        reason: "這張圖裡找不到條碼。可以拍近一點，或直接手動輸入。",
      };
    }
    return { ok: true, text: hit.text, format: hit.format };
  } catch {
    /* The decoder itself failed to load or run. Never fatal — the screen has a
       manual path and this is what sends the traveller down it. */
    return {
      ok: false,
      reason: "這個瀏覽器沒辦法讀條碼。可以貼上條碼文字，或手動輸入。",
    };
  }
}

/**
 * What a decoded string appears to be.
 *
 * Deliberately shallow. A boarding pass is identifiable because it follows a
 * published standard; a hotel QR follows nothing at all and could be a URL, a
 * Wi-Fi credential, a reservation number or a supplier's internal id. So this
 * answers "flight" only when the string genuinely parses as one, and otherwise
 * answers "unknown" rather than dressing a guess up as a classification.
 */
export function looksLikeFlight(text: string): boolean {
  return text.length >= 58 && text[0] === "M" && /^[1-9]$/.test(text[1]);
}

/** A URL is worth recognising because it can be offered as a link. */
export function asUrl(text: string): string | null {
  if (!/^https?:\/\//i.test(text)) return null;
  try {
    return new URL(text).toString();
  } catch {
    return null;
  }
}
