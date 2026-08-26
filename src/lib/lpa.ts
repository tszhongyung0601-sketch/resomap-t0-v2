/**
 * Reading an eSIM activation code.
 *
 * The second document in this app with a real standard behind it. GSMA SGP.22
 * defines the activation code an eSIM QR carries, and it is a `$`-delimited
 * string with a fixed shape:
 *
 *   LPA:1$rsp.truphone.com$QR-G-5C-1LC-1S6TG6N
 *   │   │ └ SM-DP+ server ┘ └ matching id ────┘
 *   │   └ format version, always 1 today
 *   └ scheme, sometimes absent — plenty of QRs start straight at "1$"
 *
 * Two optional fields may follow: the SM-DP+ OID, and a flag meaning the
 * carrier will also ask for a confirmation code. Both are read when present and
 * neither is invented when not.
 *
 * The matching id is effectively a one-time credential — it is what lets a
 * device claim that specific eSIM profile. It never leaves the browser, because
 * this app has no backend, and the screen says so. It is also why the demo
 * ships a fabricated one: pasting a real activation code into a demo would be
 * handing over a live SIM.
 */

export interface EsimCode {
  /** The provisioning server, e.g. "rsp.truphone.com". */
  server: string;
  /** The activation token. A credential — treat it as one. */
  matchingId: string;
  /** Present on some carriers' codes. */
  oid?: string;
  /** The carrier will ask for a separate confirmation code as well. */
  needsConfirmation: boolean;
}

/**
 * Parse an activation code, or null.
 *
 * Strict about the shape and incurious about the contents: a server that is not
 * a hostname and a token that is empty both mean this is not an activation
 * code, and saying so is better than filing a URL under eSIM.
 */
export function parseEsim(raw: string): EsimCode | null {
  const s = raw.trim();
  /* The scheme is optional in practice. Some carriers print the full URI, some
     encode only the payload, and a reader that insists on the prefix rejects
     perfectly valid codes. */
  const body = s.toUpperCase().startsWith("LPA:") ? s.slice(4) : s;

  const parts = body.split("$");
  if (parts.length < 3) return null;
  if (parts[0] !== "1") return null;

  const server = parts[1].trim();
  const matchingId = parts[2].trim();
  if (!server || !matchingId) return null;
  /* A hostname, not a sentence. This is the check that keeps arbitrary
     dollar-separated text out. */
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(server)) return null;

  return {
    server,
    matchingId,
    oid: parts[3]?.trim() || undefined,
    /* "1" means required. Anything else, including absent, means not. */
    needsConfirmation: parts[4]?.trim() === "1",
  };
}

/** Cheap enough to run on every scan before the full parse. */
export const looksLikeEsim = (raw: string) =>
  /^(LPA:)?1\$/i.test(raw.trim());

/**
 * An activation code for a profile that does not exist.
 *
 * `example.com` is reserved by RFC 2606 precisely so that documentation can
 * name a host without naming somebody's server, and the token is nonsense in
 * the right shape. Shipped so the parse can be demonstrated without anybody
 * pasting a live eSIM into a demo.
 */
export const demoEsimCode = () => "LPA:1$rsp.example.com$QR-G-5C-1LC-1S6TG6N";
