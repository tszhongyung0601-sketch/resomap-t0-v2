import { classify } from "./intent";
import { findDayIndex, findDays, findDest, findInterests, findPoi } from "./entities";

/**
 * Sentences somebody would actually type, and what has to come back.
 *
 * Not a framework — `npm run test:chat` and read the output. Every case here is
 * a phrasing a person would use in this box, and several of them are cases an
 * earlier version of the classifier got wrong; those are marked.
 */

let failed = 0;
const check = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${label.padEnd(34)} ${ok ? "" : `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`,
  );
};

/* ------------------------------------------------------------- entities */

check("三天", findDays("花蓮三天"), 3);
check("3 天", findDays("花蓮 3 天"), 3);
/* 天 wins over 夜 — 三天兩夜 is three days, not two. */
check("三天兩夜", findDays("花蓮三天兩夜"), 3);
/* A bare 兩夜 is how people say three days. */
check("兩夜", findDays("墾丁兩夜"), 3);
check("十天", findDays("十天"), 10);
check("no days", findDays("花蓮"), null);

check("dest 花蓮", findDest("想去花蓮玩"), "hualien");
check("dest 花蓮縣", findDest("花蓮縣三天"), "hualien");
/* The longer name must win; 新北 contains none of 台北 but a naive scan of the
   sentence below could still answer 台北 if order decided it. */
check("dest 新北", findDest("新北一日遊"), "newtaipei");
check("dest 日月潭", findDest("日月潭兩天"), "sunmoonlake");
check("dest none", findDest("隨便啦"), null);

check("interests 美食", findInterests("多一點美食"), ["food"]);
check("interests 吃+拍照", findInterests("想吃東西也想拍照"), ["food", "photo"]);
check("interests none", findInterests("嗯"), []);

check("day 第二天", findDayIndex("第二天加夜市"), 2);
check("day Day 2", findDayIndex("Day 2 想去海邊"), 2);
check("day 明天", findDayIndex("明天想吃海鮮", 2), 3);
check("day none", findDayIndex("想吃海鮮"), null);

check("poi 七星潭", findPoi("加七星潭").poi?.id, "qixingtan");
/* 碧潭 alone matches two records of different lengths — the longer one is not
   a tie, so it resolves rather than asking. */
check("poi 碧潭吊橋", findPoi("碧潭吊橋").poi?.id, "bitan-bridge");
/* People say 太魯閣; the record is 太魯閣國家公園. Trimming the category
   word is what closes that gap, without any fuzzy matching. */
check("poi 太魯閣", findPoi("不要去太魯閣").poi?.id, "taroko");
check("poi 東大門", findPoi("想去東大門").poi?.id, "dongdamen");
/* 碧潭 is the short form of 碧潭風景區 and is not contained in 碧潭吊橋, so
   it resolves rather than tying. The bridge needs its own name — which is
   also how a person would say it. */
check("poi 碧潭", findPoi("碧潭").poi?.id, "bitan");

/* Every one of these has a shorter place name sitting inside it. Longest
   match is what keeps them apart; without it each would answer with the
   smaller place it happens to contain. */
check("poi 安平樹屋", findPoi("安平樹屋").poi?.id, "anping-tree");
check("poi 淡水紅毛城", findPoi("淡水紅毛城").poi?.id, "fort-domingo");
check("poi 景美紀念園區", findPoi("白色恐怖景美紀念園區").poi?.id, "jingmei-park");
check("poi 景美夜市", findPoi("想去景美夜市").poi?.id, "jingmei-market");

/* --------------------------------------------------------------- intents */

const kind = (s: string, ctx = {}) => classify(s, ctx).kind;

check("plan bare city+days", kind("花蓮三天兩夜"), "plan");
check("plan with verb", kind("幫我排台南兩天"), "plan");
check("plan bare city", kind("日月潭"), "plan");
check("plan 想去", kind("想去高雄玩三天"), "plan");

/* This is the case the first version got wrong: a negation naming a place was
   read as an add, because the add test ran first and only asked whether a
   place was named. */
check("remove via 不要", kind("第一天不要去太魯閣", { destId: "hualien" }), "removeStop");
check("remove via 拿掉", kind("把松園別館拿掉", { destId: "hualien" }), "removeStop");
check("add", kind("第二天加七星潭", { destId: "hualien" }), "addStop");
check("add via 想去", kind("想去東大門夜市", { destId: "hualien" }), "addStop");
check("move", kind("七星潭改到第三天", { destId: "hualien" }), "moveStop");

check("addDay", kind("多加一天"), "addDay");
check("dropDay", kind("縮成兩天"), "dropDay");

check("refine interests", kind("多一點美食"), "refine");
check("refine transport", kind("改成租車"), "refine");

check("question audio", kind("這裡有日文導覽嗎"), "question");
check("question rental", kind("附近有租車嗎"), "question");

check("greeting", kind("你好"), "greeting");
check("unknown", kind("asdfghjkl"), "unknown");
check("unknown empty", kind("   "), "unknown");

/* --------------------------------------------------------------- payloads */

const plan = classify("想去花蓮玩三天，想吃美食也想看海");
check("plan destId", plan.destId, "hualien");
check("plan days", plan.days, 3);
check("plan interests", plan.interests, ["food", "nature"]);

const drive = classify("台南兩天，我要租車自駕");
check("plan transport", drive.transport, "drive");

const add = classify("第二天加七星潭", { destId: "hualien" });
check("add poi", add.poi?.id, "qixingtan");
check("add day", add.day, 2);

/* A trip's own city must not leak in as a destination the sentence never
   named — otherwise 「三天兩夜」 typed on a Hualien trip silently plans
   Hualien when the traveller meant somewhere else entirely. */
const noLeak = classify("三天兩夜", { destId: "hualien", today: 1 });
check("no dest leak", noLeak.destId, undefined);

console.log(failed === 0 ? "\nall good" : `\n${failed} FAILING`);
if (failed) process.exitCode = 1;
