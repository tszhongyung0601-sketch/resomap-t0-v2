import { useState, type ReactNode } from "react";
import { Button, Sheet } from "./ui";
import { INFO, type InfoTopic } from "../data/info";
import {
  CHANNEL_INTENT,
  CHANNEL_LABELS,
  availableChannels,
  tryContact,
  type ContactChannel,
} from "../lib/contact";
import type { Contact } from "../types";

/**
 * The small commercial parts: the partner mark, a rating, and the sheet that
 * appears when a button has nothing real behind it yet.
 *
 * They live together because they share one rule — **nothing here is allowed to
 * look better than it is.** The mark is grey, not brand orange. The rating
 * prints its own sample size. The sheet says a link is missing rather than
 * pretending the tap did something.
 */

/**
 * ResoMap 推薦夥伴.
 *
 * Grey, in the same family as `Tag`, and never brand orange. The moment a paid
 * badge is the loudest thing on a card, the card is an advert — and every
 * unbadged listing next to it starts reading as the inferior one, which is
 * exactly the pressure this app spends its whole design resisting.
 *
 * `StoryBadge` in ui.tsx makes the same argument for the same reason.
 */
export function PartnerBadge({ compact, short }: { compact?: boolean; short?: boolean }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">
      <span aria-hidden>★</span>
      {/* `short` drops the brand from the brand's own app. Beside a name on a
          375px card the full wording leaves the name 69px and 阿誠包車旅遊
          renders as 阿誠包… — the badge winning an argument it should not be in.
          The full form stays on the detail page, and the ⓘ next to it opens the
          rule either way. */}
      {!compact && <span>{short ? "推薦夥伴" : "ResoMap 推薦夥伴"}</span>}
    </span>
  );
}

/** Awaiting review. Shown instead of the mark, never alongside it. */
export function PendingBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md bg-brand-wash px-1.5 py-0.5 text-[11px] font-semibold text-brand">
      審核中
    </span>
  );
}

/**
 * A rating, with the count that produced it.
 *
 * The count is not decoration: 5.0 from four people and 4.8 from six hundred
 * are different claims, and a star row that hides which one it is turns both
 * into the same word. Tapping opens the reviews when there is somewhere to go.
 */
export function Stars({
  rating,
  count,
  scale = 5,
  extra,
  onClick,
}: {
  rating: number;
  count?: number;
  /** Booking and Agoda publish out of ten. Say so rather than rescaling. */
  scale?: 5 | 10;
  /** One more figure on the same line — "1,258 趟", "320 位旅客". */
  extra?: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span aria-hidden>★</span>
      <span className="num font-semibold text-ink-2">
        {rating.toFixed(1)}
        {scale === 10 ? " / 10" : ""}
      </span>
      {count !== undefined && <span className="num">（{count} 則評價）</span>}
      {extra && <span className="num">· {extra}</span>}
      {onClick && <span aria-hidden>›</span>}
    </>
  );

  if (!onClick) {
    return (
      <span className="inline-flex items-center gap-1 text-[12.5px] text-ink-3">{body}</span>
    );
  }
  return (
    <button
      onClick={onClick}
      /* The row is 17px of text; the pseudo-element carries the 44px target,
         the same trick Chip, Tabs and Segmented use. */
      className="relative inline-flex items-center gap-1 text-[12.5px] text-ink-3 after:absolute after:inset-x-0 after:-inset-y-[13px] after:content-['']"
    >
      {body}
    </button>
  );
}

/** 聯盟合作. Never 官方合作 — ResoMap has no agreement with any platform. */
export function AffiliateBadge({ partner }: { partner?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">
      {partner ? `聯盟合作 · ${partner}` : "聯盟合作"}
    </span>
  );
}

/**
 * 「Demo・未正式合作」.
 *
 * On every card for a real company ResoMap has no agreement with — which today
 * is every hire company in the app. `AffiliateBadge` would be the wrong mark:
 * that one names a platform ResoMap has a programme with the shape of, even
 * though no contract is signed. This one says the plainer thing, and it says it
 * on the card rather than once at the foot of the screen, because somebody
 * scrolling a list of five hire counters reads five cards and one footer.
 *
 * Deliberately not orange, and deliberately not shaped like a warning. It is a
 * fact about who ResoMap is, not an alarm about who they are.
 */
export function DemoPartnerBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">
      Demo・未正式合作
    </span>
  );
}

/* ----------------------------------------------------------------- info -- */

/**
 * A quiet ⓘ, and the two sentences behind it.
 *
 * The rules these explain — what earns a partner mark, how a list is ordered,
 * what a paid slot is — all still exist and all still matter. What changed is
 * that a traveller now has to ask. A paragraph about ranking weights printed
 * under a list of restaurants was the product explaining itself to the wrong
 * person, on the screen where they were choosing dinner.
 */
export function InfoButton({
  topic,
  label,
  onOpen,
}: {
  topic: keyof typeof INFO;
  /** Shown beside the mark. Omit for a bare ⓘ. */
  label?: string;
  onOpen: (t: InfoTopic) => void;
}) {
  return (
    <button
      onClick={() => onOpen(INFO[topic])}
      aria-label={`${INFO[topic].title}說明`}
      /* The pseudo-element carries the 44px target so a 12px glyph does not
         have to be drawn at 44px — the trick Chip, Tabs and Stars all use. */
      className="relative inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-ink-3 after:absolute after:inset-x-0 after:-inset-y-[14px] after:content-['']"
    >
      {label && <span>{label}</span>}
      <span aria-hidden>ⓘ</span>
    </button>
  );
}

export function InfoSheet({
  topic,
  onClose,
}: {
  topic: InfoTopic | null;
  onClose: () => void;
}) {
  if (!topic) return null;
  return (
    <Sheet open onClose={onClose} title={topic.title}>
      <div className="px-5 pb-5 pt-1">
        {topic.body.map((line) => (
          <p key={line} className="mb-2.5 text-[14px] leading-relaxed text-ink-2">
            {line}
          </p>
        ))}
        <div className="mt-3">
          <Button variant="secondary" onClick={onClose}>
            了解
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/* --------------------------------------------------------------- the sheet */

export interface DemoLink {
  title: string;
  /** What the real build would do. One sentence, in the traveller's terms. */
  intent: string;
  /** Why it does not do it yet. */
  why?: string;
}

/**
 * The sheet a button opens when the data has no URL for it.
 *
 * This is the honest half of lib/contact.ts's contract, and it is deliberately
 * specific: 「此處將開啟 LINE」 tells somebody what the button is for. A generic
 * 「功能開發中」 tells them the app is broken.
 */
export function DemoLinkSheet({
  link,
  onClose,
}: {
  link: DemoLink | null;
  onClose: () => void;
}) {
  if (!link) return null;
  return (
    <Sheet open onClose={onClose} title={link.title}>
      <div className="px-5 pb-4 pt-1">
        <div className="rounded-2xl bg-surface p-4">
          <div className="text-[14.5px] font-semibold leading-relaxed text-ink">
            {link.intent}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
            {link.why ?? "這位服務提供者還沒有提供這個聯絡方式。"}
          </p>
        </div>
        <div className="mt-4">
          <Button variant="secondary" onClick={onClose}>
            了解
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/**
 * Contact, as one control.
 *
 * Renders only the channels the record actually has, plus one fallback row when
 * it has none — so the sheet can never offer a way of reaching somebody that
 * does not exist. A live channel really opens; the fallback explains.
 */
export function ContactSheet({
  name,
  contact,
  open,
  onClose,
}: {
  name: string;
  contact: Contact;
  open: boolean;
  onClose: () => void;
}) {
  const [demo, setDemo] = useState<DemoLink | null>(null);
  const channels = availableChannels(contact);

  if (!open) return null;

  return (
    <>
      <Sheet open onClose={onClose} title={`聯絡 ${name}`}>
        <div className="px-5 pb-5 pt-1">
          {channels.length > 0 ? (
            <div className="space-y-2">
              {channels.map((ch) => (
                <button
                  key={ch}
                  onClick={() => {
                    tryContact(contact, ch);
                    onClose();
                  }}
                  className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl bg-surface px-4 text-left active:bg-surface-2"
                >
                  <span className="text-[18px]" aria-hidden>
                    {CHANNEL_ICON[ch]}
                  </span>
                  <span className="flex-1 text-[15px] font-semibold text-ink">
                    {CHANNEL_LABELS[ch]}
                  </span>
                  <span className="shrink-0 text-[13px] text-ink-3">開啟 ›</span>
                </button>
              ))}
            </div>
          ) : null}

          {/* Every channel the record does not have, listed so the sheet is an
              honest picture of the account rather than a shortened one. */}
          <div className="mt-2 space-y-2">
            {(["line", "whatsapp", "phone", "booking"] as ContactChannel[])
              .filter((ch) => !channels.includes(ch))
              .map((ch) => (
                <button
                  key={ch}
                  onClick={() =>
                    setDemo({
                      title: CHANNEL_LABELS[ch],
                      intent: `${CHANNEL_INTENT[ch]}，與「${name}」聯絡。`,
                    })
                  }
                  className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl bg-surface/60 px-4 text-left active:bg-surface"
                >
                  <span className="text-[18px] opacity-45" aria-hidden>
                    {CHANNEL_ICON[ch]}
                  </span>
                  <span className="flex-1 text-[15px] font-semibold text-ink-3">
                    {CHANNEL_LABELS[ch]}
                  </span>
                  <span className="shrink-0 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">
                    未提供
                  </span>
                </button>
              ))}
          </div>

          <p className="mt-4 text-[11.5px] leading-relaxed text-ink-3">
            聯絡方式由服務提供者自行填寫。
          </p>
        </div>
      </Sheet>

      <DemoLinkSheet link={demo} onClose={() => setDemo(null)} />
    </>
  );
}

const CHANNEL_ICON: Record<ContactChannel, ReactNode> = {
  line: "💬",
  whatsapp: "📱",
  phone: "☎️",
  booking: "📅",
};
