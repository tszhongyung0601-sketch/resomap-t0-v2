import { readdir, readFile, writeFile } from "node:fs/promises";

/**
 * Rewrite `src/data/portraits.ts` from what is actually in public/portraits/.
 *
 * Shared by both generators, because both can add a file and neither should be
 * the one that decides what the app believes exists. The manifest is a reading
 * of the directory, never a list somebody maintains — a hand-kept list drifts,
 * and every entry that drifts is a broken image behind somebody's name.
 */
export async function writeManifest({ out = "public/portraits", providers = "src/data/providers.ts", manifest = "src/data/portraits.ts" } = {}) {
  const known = new Set(
    [...(await readFile(providers, "utf8")).matchAll(/\n {4}id: "(p-[^"]+)"/g)].map((m) => m[1]),
  );

  const built = (await readdir(out))
    .filter((f) => f.endsWith("-card.webp"))
    .map((f) => f.replace(/-card\.webp$/, ""))
    .filter((id) => known.has(id))
    .sort();

  await writeFile(
    manifest,
    `/**
 * Which drivers and guides have a picture on disk.
 *
 * GENERATED — by \`node scripts/draw-portraits.mjs\` (the illustrations that ship
 * today) or \`node scripts/build-portraits.mjs\` (photographs, once somebody has
 * generated them from PORTRAIT_PROMPTS.md). Do not hand-edit: an id in here
 * without a file behind it is a broken image on a card.
 *
 * A manifest rather than a field on each \`Provider\`: the record describes the
 * person, and whether a picture has been produced yet is a fact about the
 * repository. It also means the app never requests a file that is not there,
 * which is the difference between a designed placeholder and a 404.
 *
 * None of these is a photograph of anybody, which is why \`PersonPhoto\` puts a
 * mark on the image itself rather than a line at the bottom of the page. A face
 * is the one thing in this demo a viewer would otherwise assume is real.
 */
export const PORTRAIT_IDS: ReadonlySet<string> = new Set([
${built.map((id) => `  "${id}",`).join("\n")}
]);

export const hasPortrait = (providerId: string) => PORTRAIT_IDS.has(providerId);
`,
    "utf8",
  );

  return { built, missing: [...known].filter((id) => !built.includes(id)).sort(), known };
}
