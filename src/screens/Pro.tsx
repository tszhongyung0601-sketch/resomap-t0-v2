import { useState } from "react";
import { ME } from "../data/travellers";
import { InfoButton, InfoSheet, PendingBadge } from "../components/Trade";
import type { InfoTopic } from "../data/info";
import { Avatar, Button, Note, Row, Screen, Section, Sheet, TopBar } from "../components/ui";
import {
  isMerchant,
  removeDraft,
  saveProfile,
  setProfessionalRole,
  useAccount,
  type ProProfile,
} from "../lib/account";
import { poi } from "../data";
import { useNav } from "../nav";
import { PROVIDER_KIND_LABELS, type ProviderKind } from "../types";

/**
 * 專業會員 — five things, in the order somebody managing an account looks for
 * them: my plan, my identity, my public details, my review status, my uploads.
 *
 * **Two independent switches, not one enum.** A shop is a business account and a
 * guide is a person; turning on one has no business turning off the other. Only
 * 導遊 and 包車 replace each other, and that is a property of
 * `account.professionalRole` being a single field rather than a rule anybody
 * has to remember to apply.
 */
export function Pro() {
  const nav = useNav();
  const account = useAccount();
  const [editing, setEditing] = useState(false);
  const [switching, setSwitching] = useState<ProviderKind | "none" | null>(null);
  const [info, setInfo] = useState<InfoTopic | null>(null);

  const role = account.professionalRole;
  const merchant = isMerchant(account);
  const anything = role !== null || merchant;

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
            {role && (
              <span className="rounded-md bg-surface px-1.5 py-0.5 text-[11.5px] font-semibold text-ink-2">
                {PROVIDER_KIND_LABELS[role]}
              </span>
            )}
            {merchant && (
              <span className="rounded-md bg-surface px-1.5 py-0.5 text-[11.5px] font-semibold text-ink-2">
                商家
              </span>
            )}
            {!anything && (
              <span className="rounded-md bg-surface px-1.5 py-0.5 text-[11.5px] font-semibold text-ink-3">
                一般會員
              </span>
            )}
          </div>
        </div>
      </div>

      {!anything && (
        <div className="mt-5 px-5">
          <div className="rounded-2xl bg-surface p-4">
            <div className="text-[15px] font-bold text-ink">還沒有啟用專業身份</div>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
              啟用之後，你會出現在景點附近的推薦清單裡。
            </p>
            <div className="mt-3">
              <Button variant="onCard" onClick={() => nav.go({ k: "subscribe" })}>
                看方案
              </Button>
            </div>
          </div>
        </div>
      )}

      <Section title="我的方案" tight>
        <Row
          icon="🧭"
          label="專業身份"
          value={role ? PROVIDER_KIND_LABELS[role] : "未啟用"}
          onClick={() => nav.go({ k: "subscribe", audience: role ?? "guide" })}
        />
        <Row
          icon="🏪"
          label="商家會員"
          value={merchant ? "使用中" : "未啟用"}
          onClick={() => nav.go({ k: "subscribe", audience: "merchant" })}
        />
      </Section>

      {role && (
        <Section title="切換專業身份" tight>
          <p className="px-5 pb-3 text-[12.5px] leading-relaxed text-ink-3">
            導遊與包車一次只能啟用一種。商家會員不受影響。
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
                  <span className="text-[13.5px] font-bold">{PROVIDER_KIND_LABELS[k]}</span>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {anything && (
        <Section title="公開資料" action="編輯" onAction={() => setEditing(true)}>
          <div className="px-5">
            <Field label="顯示名稱" value={account.profile.displayName} />
            <Field label="服務區域" value={account.profile.serviceArea} />
            <Field label="語言能力" value={account.profile.languages} />
            <Field label="自我介紹" value={account.profile.intro} />
            <Field label="LINE" value={account.profile.line} empty="未填寫" />
            <Field label="電話" value={account.profile.phone} empty="未填寫" />
            <Field label="價格範圍" value={account.profile.price} />
          </div>
        </Section>
      )}

      {anything && (
        <Section title="審核狀態" tight>
          <div className="px-5">
            <div className="rounded-2xl bg-surface p-4">
              <div className="flex items-center gap-2">
                <PendingBadge />
                <span className="ml-auto">
                  <InfoButton topic="partner" onOpen={setInfo} />
                </span>
              </div>
              {/* Plain text, not an inline badge — a ★ chip dropped into the
                  middle of a sentence reads as a rendering fault. */}
              <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
                資料送出後由 ResoMap 審核，通過就會顯示「ResoMap 推薦夥伴」，並開始出現在周邊推薦裡。
              </p>
            </div>
          </div>
        </Section>
      )}

      <Section title="我的語音" tight>
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
                      {poi(d.poiId)?.name ?? d.poiId} · {d.language}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-brand-wash px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                    審核中
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

      {/* One line, at the foot, and that is the whole of what this screen says
          about being a prototype. */}
      <Note>資料僅儲存在這台裝置上，不會送出。</Note>
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
        {switching && switching !== "none" && (
          <div className="px-5 pb-5 pt-1">
            <div className="rounded-2xl bg-surface p-4 text-[14.5px] leading-relaxed text-ink">
              切換為「{PROVIDER_KIND_LABELS[switching]}」，
              {role ? `原本的「${PROVIDER_KIND_LABELS[role]}」會停用。` : "並啟用這個身份。"}
              {merchant && "商家會員不受影響。"}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => setSwitching(null)}>
                取消
              </Button>
              <Button
                onClick={() => {
                  setProfessionalRole(switching);
                  setSwitching(null);
                }}
              >
                確定切換
              </Button>
            </div>
          </div>
        )}
      </Sheet>

      <InfoSheet topic={info} onClose={() => setInfo(null)} />
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
    <Sheet open onClose={onClose} title="編輯公開資料">
      <div className="px-5 pb-5 pt-1">
        <Input label="顯示名稱" value={draft.displayName} onChange={set("displayName")} />
        <Input
          label="服務區域"
          value={draft.serviceArea}
          onChange={set("serviceArea")}
          note="顯示在列表與詳情頁"
        />
        <Input label="語言能力" value={draft.languages} onChange={set("languages")} />
        <Input
          label="自我介紹"
          value={draft.intro}
          onChange={set("intro")}
          multiline
          note="詳情頁最上面那段"
        />
        <Input label="LINE 連結" value={draft.line} onChange={set("line")} />
        <Input label="電話" value={draft.phone} onChange={set("phone")} />
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
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}
