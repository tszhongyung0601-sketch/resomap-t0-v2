import { track } from "./track";
import type { Contact } from "../types";

/**
 * Reaching a merchant, a driver or a guide — and the affiliate outbound too.
 *
 * The rule this module exists to hold: **a button's behaviour comes from the
 * data, never from the button.** If the record carries a URL, the URL is opened
 * for real. If it does not, the caller gets `null` back and shows a sheet
 * saying what would have happened.
 *
 * Written this way for two reasons. It means a demo becomes a product by
 * editing data — sign a LINE official account, fill in `lineUrl`, the button
 * starts working with no code change. And it means the demo never has to invent
 * a contact detail: a plausible LINE id or phone number in mock data is a
 * stranger's phone ringing, which is the one bug in this whole app that would
 * hurt somebody who never opened it.
 */

export type ContactChannel = "line" | "whatsapp" | "phone" | "booking";

export const CHANNEL_LABELS: Record<ContactChannel, string> = {
  line: "LINE",
  whatsapp: "WhatsApp",
  phone: "電話",
  booking: "線上預約",
};

/** What the demo sheet says would happen, per channel. */
export const CHANNEL_INTENT: Record<ContactChannel, string> = {
  line: "此處將開啟 LINE",
  whatsapp: "此處將開啟 WhatsApp",
  phone: "此處將撥出電話",
  booking: "此處將開啟預約頁面",
};

/** The URL for a channel, or `undefined` when this record has not got one. */
export function channelUrl(c: Contact, ch: ContactChannel): string | undefined {
  switch (ch) {
    case "line":
      return c.lineUrl || undefined;
    case "whatsapp":
      return c.whatsappUrl || undefined;
    case "phone":
      /* `tel:` needs the punctuation stripped or iOS dials the dashes. */
      return c.phone ? `tel:${c.phone.replace(/[^\d+]/g, "")}` : undefined;
    case "booking":
      return c.bookingUrl || undefined;
  }
}

/** Which channels this record can actually offer, in a stable order. */
export function availableChannels(c: Contact): ContactChannel[] {
  return (["line", "whatsapp", "phone", "booking"] as ContactChannel[]).filter((ch) =>
    Boolean(channelUrl(c, ch)),
  );
}

/**
 * `noopener` is not optional: without it the opened page gets a handle on this
 * one through `window.opener` and can navigate it somewhere else. Same rule
 * lib/maps.ts keeps for the hand-off to Google Maps.
 */
export function openUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Try to reach somebody. Returns true when a real window was opened, false when
 * the caller needs to explain instead.
 *
 * `tel:` is opened by assignment rather than in a tab — a popup blocker eats
 * `window.open("tel:…")` on several browsers and the traveller gets nothing at
 * all, which looks exactly like a dead button.
 */
export function tryContact(c: Contact, ch: ContactChannel): boolean {
  const url = channelUrl(c, ch);
  if (!url) return false;
  if (url.startsWith("tel:")) window.location.href = url;
  else openUrl(url);
  return true;
}

/**
 * The affiliate outbound, with the same contract.
 *
 * Every record in data/affiliateOffers.ts carries `affiliateUrl: ""` today,
 * because ResoMap has no affiliate agreement with anybody — so this returns
 * false and the caller shows the sheet that says so. The click is still
 * tracked, because knowing which listings people would have opened is the whole
 * point of running the demo.
 */
export function tryAffiliate(offer: {
  id: string;
  affiliateUrl: string;
  trackingId: string;
  partner: import("../types").PartnerId;
  destId: string;
}): boolean {
  track("affiliate_click", {
    dealId: offer.id,
    partner: offer.partner,
    destId: offer.destId,
  });
  if (!offer.affiliateUrl) return false;
  const url = new URL(offer.affiliateUrl);
  /* The tracking id belongs in the query string, which is how every affiliate
     programme in this space actually works. Building it here means a screen
     can never forget it. */
  if (offer.trackingId) url.searchParams.set("aid", offer.trackingId);
  track("affiliate_outbound", {
    dealId: offer.id,
    partner: offer.partner,
    destId: offer.destId,
  });
  openUrl(url.toString());
  return true;
}
