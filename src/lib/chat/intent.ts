import {
  findDayIndex,
  findDays,
  findDest,
  findInterests,
  findPoi,
  findTransport,
  type PoiMatch,
} from "./entities";
import type { InterestId, Poi } from "../../types";
import type { TransportId } from "../planner";

/**
 * What somebody meant, as far as a set of rules can tell.
 *
 * No model, no probability, no training data — a fixed list of things this app
 * can actually do, and the words that ask for each of them. That is a real
 * limit and the screen says so: when nothing matches, the reply is 「這句我不
 * 會」 plus three sentences it does know, not a guess dressed up as an answer.
 *
 * Order matters and is not alphabetical. `removeStop` is tested before
 * `addStop` because 「不要去七星潭」 contains neither an add verb nor, usefully,
 * a remove one — it is a negation, and a classifier that checked "does it name
 * a place" first would cheerfully add the place the sentence rejects.
 */

export type IntentKind =
  | "plan"
  | "refine"
  | "addStop"
  | "removeStop"
  | "moveStop"
  | "addDay"
  | "dropDay"
  | "question"
  | "greeting"
  | "unknown";

export interface Intent {
  kind: IntentKind;
  destId?: string;
  days?: number;
  interests?: InterestId[];
  transport?: TransportId;
  poi?: Poi;
  /** Two places of the same name length matched; the reply must ask which. */
  ambiguous?: Poi[];
  /** Which day the sentence is about, when it names one. */
  day?: number;
  /** What the traveller asked about, for `question`. */
  topic?: "audio" | "rental" | "nearby" | "food";
}

/* Whole-word-ish matching is not available in Chinese, so these are plain
   substrings. Each list is kept short and specific for that reason: a loose
   verb here would swallow sentences that belong to another intent. */
const NEGATION = ["不要", "不想", "別", "拿掉", "刪掉", "刪除", "去掉", "移除", "取消"];
const ADD = ["加", "想去", "再去", "安排", "放進", "插入", "順便"];
const MOVE = ["改到", "移到", "換到", "搬到", "調到"];
const PLAN_VERB = ["排", "規劃", "計畫", "計劃", "安排", "想去", "幫我"];
const MORE_DAY = ["多一天", "加一天", "多加一天", "延一天"];
const FEWER_DAY = ["少一天", "減一天", "縮短", "縮成"];
const GREETING = ["你好", "哈囉", "hi", "hello", "嗨", "在嗎"];

const hasAny = (text: string, words: string[]) => words.some((w) => text.includes(w));

/**
 * Classify one message.
 *
 * `ctx.today` and `ctx.destId` come from the trip the chat was opened on, when
 * it was opened on one. They only ever resolve relative words — 「明天」 needs
 * to know what today is — and never supply a destination the sentence did not
 * name, because a chat opened on a Hualien trip must not silently plan Hualien
 * when somebody types 「三天兩夜」 meaning somewhere else.
 */
export function classify(
  raw: string,
  ctx: { today?: number; destId?: string } = {},
): Intent {
  const text = raw.trim();
  if (!text) return { kind: "unknown" };
  const lower = text.toLowerCase();

  if (text.length <= 6 && hasAny(lower, GREETING)) return { kind: "greeting" };

  const dest = findDest(text);
  const days = findDays(text);
  const interests = findInterests(text);
  const transport = findTransport(text) ?? undefined;
  const day = findDayIndex(text, ctx.today) ?? undefined;
  /* Scoped to the trip's own city when there is one, so 「加東大門夜市」 on a
     Hualien trip cannot match a same-named place in another dataset. */
  const match: PoiMatch = findPoi(text, ctx.destId);

  /* ------------------------------------------------------- questions first.
     They are questions about the data rather than requests to change
     anything, and several of them contain words the action intents watch
     for — 「附近有租車嗎」 contains 有, not a verb, but 「這裡可以聽日文嗎」
     would otherwise be read as naming nothing and fall through to unknown. */
  if (text.includes("嗎") || text.includes("?") || text.includes("？")) {
    if (/日文|日語|英文|英語|韓文|語音|導覽|幾種語言/.test(text)) {
      return { kind: "question", topic: "audio", poi: match.poi, day };
    }
    if (/租車|開車|自駕/.test(text)) {
      return { kind: "question", topic: "rental", poi: match.poi };
    }
    if (/附近|周邊/.test(text)) {
      return { kind: "question", topic: "nearby", poi: match.poi };
    }
    if (/吃|美食|餐廳/.test(text)) {
      return { kind: "question", topic: "food", poi: match.poi };
    }
  }

  /* ------------------------------------------------------------ day counts */
  if (hasAny(text, MORE_DAY)) return { kind: "addDay" };
  if (hasAny(text, FEWER_DAY)) return { kind: "dropDay", days: days ?? undefined };

  /* --------------------------------------------------- remove before add.
     A negation plus a place is a removal even though the sentence contains
     none of the removal verbs: 「第一天不要去太魯閣」. */
  if (hasAny(text, NEGATION) && (match.poi || match.ambiguous)) {
    return { kind: "removeStop", poi: match.poi, ambiguous: match.ambiguous, day };
  }

  /* ------------------------------------------------------------------ move */
  if (hasAny(text, MOVE) && (match.poi || match.ambiguous)) {
    return { kind: "moveStop", poi: match.poi, ambiguous: match.ambiguous, day };
  }

  /* --------------------------------------------------------- plan a new one.
     A city plus a day count is a plan request whatever verb it uses — 「花蓮
     三天兩夜」 has no verb at all and is the single most likely thing anybody
     types into this box. */
  if (dest && (days || hasAny(text, PLAN_VERB))) {
    return { kind: "plan", destId: dest, days: days ?? undefined, interests, transport };
  }

  /* -------------------------------------------------------------- add a stop.
     Requires a place. Without one there is nothing to add, and the sentence is
     more likely a refinement of the plan just proposed. */
  if (match.poi || match.ambiguous) {
    if (hasAny(text, ADD) || day !== undefined) {
      return { kind: "addStop", poi: match.poi, ambiguous: match.ambiguous, day };
    }
  }

  /* --------------------------------------------------------------- refine.
     Preferences with no city and no place: 「多一點美食」, 「改成租車」,
     「不要走太多路」. Only meaningful when a plan is already on screen, which
     is the caller's job to know. */
  if (interests.length > 0 || transport || days) {
    return { kind: "refine", interests, transport, days: days ?? undefined };
  }

  /* A bare city with no verb and no number — 「花蓮」 — is still a plan
     request; there is nothing else it could be asking for. */
  if (dest) return { kind: "plan", destId: dest, interests, transport };

  return { kind: "unknown" };
}
