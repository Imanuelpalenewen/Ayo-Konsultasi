const DRAFT_KEY = "ayokonsultasi:bookingDraft";
const TTL_MS = 60 * 60 * 1000; // 1 hour

export interface BookingDraft {
  consultationType: string;
  customTopic: string;
  description: string;
  locationType: "online" | "tatap_muka" | "";
  locationDetail: string;
  selectedDate: string | null; // "YYYY-MM-DD"
  time: string;
  bookingMode: "ai" | "manual";
  savedAt: number;
  // When set, BookingPage will update this consultation's lecturer instead of creating a new one
  replaceConsultationId?: string;
}

export function saveDraft(draft: Omit<BookingDraft, "savedAt">): void {
  try {
    const payload: BookingDraft = { ...draft, savedAt: Date.now() };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch { /* sessionStorage unavailable — silent fail */ }
}

export function loadDraft(): BookingDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft: BookingDraft = JSON.parse(raw);
    if (Date.now() - draft.savedAt > TTL_MS) {
      sessionStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch { /* silent fail */ }
}

/** Returns true when all required booking fields in the draft are filled. */
export function isDraftComplete(draft: BookingDraft): boolean {
  if (!draft.consultationType) return false;
  if (draft.consultationType === "Lainnya" && !draft.customTopic.trim()) return false;
  if (!draft.description.trim()) return false;
  if (!draft.locationType) return false;
  if (draft.locationType === "tatap_muka" && !draft.locationDetail.trim()) return false;
  if (!draft.selectedDate) return false;
  if (!draft.time) return false;
  return true;
}
