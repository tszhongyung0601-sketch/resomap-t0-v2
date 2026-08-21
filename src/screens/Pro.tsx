import { useState } from "react";
import { ME } from "../data/travellers";
import { PARTNER_RULE } from "../data/subscriptionPlans";
import { PartnerBadge, PendingBadge } from "../components/Trade";
import {
  Avatar,
  Button,
  Note,
  Row,
  Screen,
  Section,
  Sheet,
  Tag,
  TopBar,
} from "../components/ui";
import {
  proRoleOf,
  removeDraft,
  saveProfile,
  setProRole,
  useAccount,
  type ProProfile,
} from "../lib/account";
import { poi } from "../data";
import { useNav } from "../nav";
import { PLAN_AUDIENCE_LABELS, PROVIDER_KIND_LABELS, type ProviderKind } from "../types";

/**
 * The professional member's own page: which identity, what it says, and where
 * that shows up.
 *
 * **One identity, enforced by the shape.** The role switch writes a single
 * `plan` value in lib/account.ts, so there is no moment at which both are on
 * and no "unset the other one" step that could be forgotten. The two buttons
 * are a choice, not two toggles, and they are drawn as a choice.
 *
 * The account starts as 一般會員 and says so. Showing a filled-in professional
 * profile to somebody who has not subscribed would be the demo pretending the
 * subscription did nothing.
 */
export function Pro() {
  const nav = useNav();
  const account = useAccount();
  const [editing, setEditing] = useState(false);
  const [switching, setSwitching] = useState<ProviderKind | null>(null);

  const role = proRoleOf(account.plan);
  const merchant = account.plan === "merchant";
  const paid = account.plan !== "member";
  /* Nothing this device does can approve itself. A demo account is a new
     application, which is exactly the state the badge rule is there to
     describe — so it shows 審核中 rather than a mark it has not earned. */
  const reviewStatus = paid ? "pending" : "none";

  return (
    <Screen>
      <TopBar title="專業會員" onBack={() => nav.back()} />

      <div className="flex items-center gap-4 px-5 pb-1 pt-1">
        <Avatar name={ME.name} color={ME.color} initial={ME.initial} size={64} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[20px] font-bold text-ink">
            {account.profile.displayName || ME.name}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-surface px-1.5 py-0.5 text-[11.5px] font-semibold text-ink-2">
              {PLAN_AUDIENCE_LABELS[account.plan]}
            </span>
            {reviewStatus === "pending" && <PendingBadge />}
          </div>
        </div>
      </div>

      {!paid && (
        <div className="mt-5 px-5">
          <div className="rounded-2xl bg-surface p-4">
            <div className="text-[15px] font-bold text-ink">還不是專業會員</div>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
              專業會員可以在景點周邊被推薦。包車與導遊只能擇一，商家是另一種帳號。
            </p>
            <div className="mt-3">
              <Button variant="onCard" onClick={() => nav.go({ k: "subscribe" })}>
                看訂閱方案
              </Button>
            </div>
          </div>
        </div>
      )}

      {paid && !merchant && (
        <Section title="專業身份" tight>
          <p className="px-5 pb-3 text-[12.5px] leading-relaxed text-ink-3">
            一次只能啟用一種。切換會停用另一種，而不是同時擁有兩個身份。
          </p>
          <div className="flex gap-2 px-5">
            {(["driver", "guide"] as ProviderKind[]).map((k) => {
              const on = role === k;
              return (
                <button
                  key={k}
                  onClick={() => !on && setSwitching(k)}
                  aria-pressed={on}
                  className={`flex min-h-[76px] flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl px-3 transition ${
                    on ? "bg-brand text-white" : "bg-surface text-ink-2 active:bg-surface-2"
                  }`}
                >
                  <span className="text-[20px]" aria-hidden>
                    {k === "driver" ? "🚐" : "🧭"}
                  </span>
                  <span className="text-[13.5px] font-bold">
                    {PROVIDER_KIND_LABELS[k]}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {paid && merchant && (
        <Section title="商家身份" tight>
          <div className="px-5">
            <div className="rounded-2xl bg-surface p-4">
              <div className="text-[14.5px] font-bold text-ink">商家會員已啟用</div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                商家是一種帳號，不是個人的專業身份，所以不會跟包車或導遊同時存在。商家頁、店家精選語音與周邊曝光都掛在店家上。
              </p>
            </div>
          </div>
        </Section>
      )}

      {paid && (
        <Section
          title="公開資料"
          action="編輯"
          onAction={() => setEditing(true)}
        >
          <div className="px-5">
            <Field label="顯示名稱" value={account.profile.displayName} />
            <Field label="服務區域" value={account.profile.serviceArea} />
            <Field label="語言能力" value={account.profile.languages} />
            <Field label="自我介紹" value={account.profile.intro} />
            <Field
              label="LINE"
              value={account.profile.line}
              empty="未填寫 · 旅客會看到「此處將開啟 LINE」的說明"
            />
            <Field
              label="電話"
              value={account.profile.phone}
              empty="未填寫 · 旅客會看到「此處將撥出電話」的說明"
            />
            <Field label="價格範圍" value={account.profile.price} />
          </div>
        </Section>
      )}

      {paid && (
        <Section title="推薦狀態" tight>
          <div className="px-5">
            <div className="rounded-2xl bg-surface p-4">
              <div className="flex items-center gap-2">
                {reviewStatus === "pending" ? <PendingBadge /> : <PartnerBadge />}
                <Tag kind="demo" />
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-3">{PARTNER_RULE}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
                這個 Demo 帳號沒有真的送審，所以停在「審核中」。想看到掛著推薦夥伴標章的樣子，可以到任一景點的「探索附近 →
                包車司機」看已通過審核的例子。
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* Uploads live here because this is the page about what you have put into
          ResoMap. They are drafts, not published guides, and the row says so. */}
      <Section title="我上傳的語音" tight>
        {account.drafts.length === 0 ? (
          <div className="px-5">
            <div className="rounded-2xl bg-surface p-4">
              <div className="text-[14px] font-semibold text-ink">還沒有上傳過</div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                任何景點的語音清單右上角都有「＋」，可以錄一段自己的導覽。
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 px-5">
            {account.drafts.map((d) => (
              <div key={d.id} className="rounded-2xl bg-surface p-3.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14.5px] font-bold text-ink">{d.title}</div>
                    <div className="mt-0.5 truncate text-[12.5px] text-ink-3">
                      {poi(d.poiId)?.name ?? d.poiId} · {d.language} · {d.fileName}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-brand-wash px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                    ResoMap 審核中
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-2">
                  {d.description}
                </p>
                <button
                  onClick={() => removeDraft(d.id)}
                  className="mt-2 inline-flex min-h-11 items-center text-[12.5px] font-semibold text-ink-3"
                >
                  撤回這則
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="方案" tight>
        <Row
          icon="👑"
          label="訂閱方案"
          value={PLAN_AUDIENCE_LABELS[account.plan]}
          onClick={() => nav.go({ k: "subscribe" })}
        />
      </Section>

      <Note>
        Demo 版本沒有後端，也沒有金流。方案、身份與這頁的資料只存在這台裝置上。
      </Note>
      <div className="h-24 shrink-0" />

      {/* Mounted only while open, so `useState(profile)` seeds itself fresh
          every time and cancelling really cancels. */}
      {editing && (
        <EditSheet profile={account.profile} onClose={() => setEditing(false)} />
      )}

      <Sheet
        open={Boolean(switching)}
        onClose={() => setSwitching(null)}
        title="切換專業身份"
      >
        {switching && (
          <div className="px-5 pb-5 pt-1">
            <div className="rounded-2xl bg-surface p-4 text-[14.5px] leading-relaxed text-ink">
              切換為「{PROVIDER_KIND_LABELS[switching]}」之後，
              {role ? `原本的「${PROVIDER_KIND_LABELS[role]}」身份會停用。` : "會啟用這個身份。"}
              專業身份一次只能有一種。
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => setSwitching(null)}>
                取消
              </Button>
              <Button
                onClick={() => {
                  setProRole(switching);
                  setSwitching(null);
                }}
              >
                確定切換
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </Screen>
  );
}

function Field({
  label,
  value,
  empty,
}: {
  label: string;
  value: string;
  empty?: string;
}) {
  return (
    <div className="flex gap-3 border-b border-line py-3 last:border-0">
      <span className="w-[72px] shrink-0 text-[13px] text-ink-3">{label}</span>
      <span
        className={`min-w-0 flex-1 text-[13.5px] leading-relaxed ${
          value ? "text-ink" : "text-ink-3"
        }`}
      >
        {value || empty || "未填寫"}
      </span>
    </div>
  );
}

/**
 * The edit form.
 *
 * Every field here is one a traveller will read on the provider list, and the
 * labels say which — a form that does not tell you where the text lands is a
 * form people fill in badly.
 */
function EditSheet({
  profile,
  onClose,
}: {
  profile: ProProfile;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(profile);

  const set = (k: keyof ProProfile) => (v: string) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Sheet open onClose={onClose} title="編輯專業會員資料">
      <div className="px-5 pb-5 pt-1">
        <Input label="顯示名稱" value={draft.displayName} onChange={set("displayName")} />
        <Input
          label="服務區域"
          value={draft.serviceArea}
          onChange={set("serviceArea")}
          note="顯示在列表卡片與詳情頁"
        />
        <Input label="語言能力" value={draft.languages} onChange={set("languages")} />
        <Input
          label="自我介紹"
          value={draft.intro}
          onChange={set("intro")}
          multiline
          note="詳情頁最上面那段"
        />
        <Input
          label="LINE 連結"
          value={draft.line}
          onChange={set("line")}
          note="填了旅客按下去會直接開啟；空著會顯示說明"
        />
        <Input
          label="電話"
          value={draft.phone}
          onChange={set("phone")}
          note="填了會直接撥號；空著會顯示說明"
        />
        <Input label="價格範圍" value={draft.price} onChange={set("price")} />

        <div className="mt-4 flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={() => {
              saveProfile(draft);
              onClose();
            }}
          >
            儲存
          </Button>
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-3">
          Demo 版本儲存在這台裝置上，不會送出。
        </p>
      </div>
    </Sheet>
  );
}

function Input({
  label,
  value,
  onChange,
  note,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  note?: string;
  multiline?: boolean;
}) {
  const cls =
    "mt-1.5 w-full rounded-2xl bg-surface px-4 py-3 text-[14.5px] leading-relaxed text-ink outline-none placeholder:text-ink-3";
  return (
    <label className="mt-3 block first:mt-0">
      <span className="text-[13px] font-semibold text-ink-2">{label}</span>
      {note && <span className="ml-1.5 text-[11.5px] text-ink-3">{note}</span>}
      {multiline ? (
        <textarea
          value={value}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </label>
  );
}
