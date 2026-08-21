import { useSyncExternalStore } from "react";
import type { PlanAudience, ProviderKind } from "../types";

/**
 * Who this device says it is: which plan, and — if it is a professional member
 * — which single professional identity.
 *
 * **The exclusivity rule lives in the shape, not in a check.** A professional
 * member is a driver *or* a guide, and this store holds one `plan`, so there is
 * no state in which somebody is both. `proRole` is derived from the plan rather
 * than stored beside it, which means the two cannot disagree and there is no
 * "switch role" path that forgets to update the other field.
 *
 * 商家 is a different concept and it says so: a shop is an account with a
 * storefront, not a person with a professional identity, so choosing 商家會員
 * clears any professional role rather than sitting alongside it.
 *
 * Same store shape as lib/saved.ts and lib/reactions.ts, and persisted for the
 * same reason: a subscription that forgets on reload cannot be demonstrated.
 */

const KEY = "resomap_account";

export interface ProProfile {
  displayName: string;
  serviceArea: string;
  languages: string;
  intro: string;
  line: string;
  phone: string;
  price: string;
}

export interface AudioDraft {
  id: string;
  /** Not a real upload — the demo records that a file was chosen, not the file. */
  fileName: string;
  language: string;
  title: string;
  poiId: string;
  description: string;
  /** Epoch ms. */
  at: number;
  status: "review";
}

interface Account {
  plan: PlanAudience;
  profile: ProProfile;
  drafts: AudioDraft[];
}

/**
 * The starting profile.
 *
 * Deliberately filled in: an empty form is a worse demo than a filled one, and
 * every field here is editable on screen, so nothing in it can be mistaken for
 * a number the app computed.
 */
const DEFAULT_PROFILE: ProProfile = {
  displayName: "Star",
  serviceArea: "台北市、新北市、基隆、宜蘭、桃園",
  languages: "中文、English、日本語",
  intro:
    "熱愛分享在地故事與文化，擅長規劃客製化行程，用語音帶你深度認識每個景點的美好。",
  line: "",
  phone: "",
  price: "NT$ 3,000 – 8,000 / 半日",
};

const EMPTY: Account = { plan: "member", profile: DEFAULT_PROFILE, drafts: [] };

const PLANS: PlanAudience[] = ["member", "merchant", "guide", "driver"];

function read(): Account {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Account>;
    return {
      plan: PLANS.includes(parsed.plan as PlanAudience)
        ? (parsed.plan as PlanAudience)
        : "member",
      profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) },
      drafts: Array.isArray(parsed.drafts)
        ? parsed.drafts.filter(
            (d): d is AudioDraft => Boolean(d) && typeof d.id === "string",
          )
        : [],
    };
  } catch {
    return EMPTY;
  }
}

let state: Account = read();
const watchers = new Set<() => void>();

function commit(next: Account) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Quota or private mode — never worth breaking a screen over. */
  }
  for (const fn of watchers) fn();
}

function subscribe(fn: () => void) {
  watchers.add(fn);
  return () => {
    watchers.delete(fn);
  };
}

const snapshot = () => state;

export function useAccount(): Account {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/**
 * The professional identity, derived.
 *
 * There is exactly one place this can come from, which is why switching from
 * 包車 to 導遊 cannot leave both switched on: it is one assignment to `plan`.
 */
export const proRoleOf = (plan: PlanAudience): ProviderKind | null =>
  plan === "driver" ? "driver" : plan === "guide" ? "guide" : null;

export const isMerchantOf = (plan: PlanAudience) => plan === "merchant";

/** Anything other than 一般會員 is a paid plan in this model. */
export const isPaidPlan = (plan: PlanAudience) => plan !== "member";

export function setPlan(plan: PlanAudience) {
  commit({ ...state, plan });
}

/** Switch professional identity. Structurally impossible to hold both. */
export function setProRole(role: ProviderKind) {
  commit({ ...state, plan: role });
}

export function saveProfile(patch: Partial<ProProfile>) {
  commit({ ...state, profile: { ...state.profile, ...patch } });
}

export function addDraft(d: Omit<AudioDraft, "id" | "at" | "status">) {
  commit({
    ...state,
    drafts: [
      { ...d, id: `draft-${Date.now()}`, at: Date.now(), status: "review" },
      ...state.drafts,
    ],
  });
}

export function removeDraft(id: string) {
  commit({ ...state, drafts: state.drafts.filter((d) => d.id !== id) });
}

/** The demo reset clears this too — see App.tsx's reset(). */
export const resetAccount = () => commit(EMPTY);
