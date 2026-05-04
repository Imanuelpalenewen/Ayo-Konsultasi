import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Globe,
  Building2,
  Video,
  CalendarIcon,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronDown,
  UserCheck,
  Calendar,
  CheckCircle2,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar as CalendarPicker } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import type { Id } from "../../../convex/_generated/dataModel";
import { Spinner } from "../../components/shared/Spinner";
import { AMPMBadge } from "../../components/shared/AMPMBadge";

type Step = "form" | "searching" | "results";
type LocationType = "online" | "tatap_muka";
type OnlinePlatform = "meet" | "zoom";

interface Recommendation {
  lecturerId: string;
  lecturerName: string;
  matchScore: number;
  matchReason: string;
  suggestedSlots: string[];
}

const CONSULTATION_TYPES = ["Skripsi", "Tugas Akhir", "Akademik Umum", "Karier", "Lainnya"];

const LOADING_MESSAGES = [
  "Menganalisis keahlian dosen...",
  "Mencocokkan jadwal tersedia...",
  "Menyiapkan rekomendasi terbaik untukmu...",
];

export function BookingPage() {
  const navigate = useNavigate();
  const recommendLecturers = useAction(api.ai.recommendLecturers);
  const createConsultation = useMutation(api.consultations.createConsultation);

  // ── Step 1 state ──────────────────────────────────────────────
  const [consultationType, setConsultationType] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [description, setDescription] = useState("");
  const [locationType, setLocationType] = useState<LocationType | "">("");
  const [onlinePlatform, setOnlinePlatform] = useState<OnlinePlatform>("meet");
  const [locationDetail, setLocationDetail] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [time, setTime] = useState("");

  // ── Flow state ────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("form");
  const [searchError, setSearchError] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState("");
  const [expandedXAI, setExpandedXAI] = useState<string | null>(null);

  // Cycle loading messages every 3 s
  useEffect(() => {
    if (step !== "searching") return;
    setLoadingMsgIdx(0);
    const interval = setInterval(
      () => setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length),
      3000
    );
    return () => clearInterval(interval);
  }, [step]);

  const ampm = time ? (parseInt(time.split(":")[0]) >= 12 ? "PM" : "AM") : null;

  // If selected date is today, restrict time to current time and later
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const isToday = selectedDateStr === todayStr;
  const minTime = isToday ? format(new Date(), "HH:mm") : undefined;

  const handleDateSelect = (d: Date | undefined) => {
    setSelectedDate(d);
    setCalendarOpen(false);
    // Clear time if switching to today and existing time is already in the past
    if (d && format(d, "yyyy-MM-dd") === todayStr && time) {
      const nowTime = format(new Date(), "HH:mm");
      if (time < nowTime) setTime("");
    }
  };

  // Resolved topic: use free-text when "Lainnya" is selected
  const effectiveTopic = consultationType === "Lainnya" ? customTopic.trim() : consultationType;

  // ── Step 1 submit → AI search ─────────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationType || !description.trim() || !locationType || !selectedDate || !time) {
      setSearchError("Harap lengkapi semua kolom yang ditandai (*) sebelum mencari dosen.");
      return;
    }
    if (consultationType === "Lainnya" && !customTopic.trim()) {
      setSearchError("Harap tuliskan topik konsultasi kamu.");
      return;
    }
    if (locationType === "tatap_muka" && !locationDetail.trim()) {
      setSearchError("Harap masukkan lokasi pertemuan tatap muka.");
      return;
    }
    const selectedDateTime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${time}`);
    if (selectedDateTime.getTime() < Date.now()) {
      setSearchError("Waktu konsultasi tidak valid. Pilih tanggal dan jam di masa depan.");
      return;
    }
    setSearchError("");
    setStep("searching");

    const preferredDatesStr = `${format(selectedDate, "EEEE, d MMMM yyyy", { locale: idLocale })} pukul ${time} WITA`;

    try {
      const results = (await recommendLecturers({
        topic: effectiveTopic,
        description,
        preferredDates: preferredDatesStr,
      })) as Recommendation[];
      setRecommendations(results);
      setStep("results");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mendapatkan rekomendasi. Coba lagi.";
      setSearchError(msg);
      setStep("form");
    }
  };

  // ── Step 2: pick a lecturer → immediately book ────────────────
  const handleBook = async (rec: Recommendation) => {
    if (!selectedDate || !time || !locationType) return;
    setBookingError("");
    setSubmittingId(rec.lecturerId);

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const resolvedDetail =
      locationType === "online"
        ? onlinePlatform === "meet" ? "Google Meet" : "Zoom"
        : locationDetail.trim();

    try {
      await createConsultation({
        lecturerId: rec.lecturerId as Id<"users">,
        date: dateStr,
        time,
        topic: effectiveTopic,
        notes: description,
        locationType,
        locationDetail: resolvedDetail,
      });
      navigate("/student/ai-recommendation");
    } catch {
      setBookingError("Gagal membuat booking. Silakan coba lagi.");
      setSubmittingId(null);
    }
  };

  // ── Derived: recap line for Step 2 header ─────────────────────
  const bookingSummary = selectedDate
    ? `${effectiveTopic} · ${format(selectedDate, "d MMM yyyy", { locale: idLocale })} · ${time} WITA · ${
        locationType === "online"
          ? onlinePlatform === "meet" ? "Google Meet" : "Zoom"
          : locationDetail
      }`
    : "";

  // ─────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Page header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Booking Konsultasi
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Isi detail kebutuhanmu, lalu AI akan mencarikan dosen yang paling cocok.
          </p>
        </div>

        {/* ════════════════ STEP 1: Form ════════════════ */}
        <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden ${step !== "form" ? "opacity-60 pointer-events-none" : ""}`}>
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              1 · Detail Kebutuhan Konsultasi
            </h3>
            {step !== "form" && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
              </span>
            )}
          </div>

          <form onSubmit={handleSearch} className="p-6 space-y-6">
            {searchError && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{searchError}</p>
              </div>
            )}

            {/* Jenis Konsultasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jenis Konsultasi <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CONSULTATION_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setConsultationType(type);
                      if (type !== "Lainnya") setCustomTopic("");
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      consultationType === type
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {consultationType === "Lainnya" && (
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Tuliskan topik konsultasimu..."
                  autoFocus
                  className="mt-2 w-full px-4 py-2.5 border border-primary/50 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-800 dark:text-white text-sm"
                />
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-400">{description.length} / 1000</span>
              </div>
              <textarea
                required
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan kebutuhan konsultasimu secara detail..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-800 dark:text-white text-sm resize-none"
              />
              <p className="mt-1.5 text-xs text-primary/70">
                ✦ Tip: sebutkan topik spesifik, progres saat ini, dan kendala utama.
              </p>
            </div>

            {/* Jenis Pertemuan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mode Pertemuan <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {(["online", "tatap_muka"] as LocationType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLocationType(t)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      locationType === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {t === "online" ? <Globe className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                    {t === "online" ? "Online" : "Tatap Muka"}
                  </button>
                ))}
              </div>

              {locationType === "online" && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Platform:</p>
                  <div className="flex gap-5">
                    {(["meet", "zoom"] as OnlinePlatform[]).map((p) => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="platform" value={p} checked={onlinePlatform === p}
                          onChange={() => setOnlinePlatform(p)} className="accent-primary" />
                        <Video className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {p === "meet" ? "Google Meet" : "Zoom"}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 italic">
                    Link meeting digenerate otomatis setelah dosen menyetujui.
                  </p>
                </div>
              )}

              {locationType === "tatap_muka" && (
                <input
                  type="text"
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  placeholder="Contoh: Lobby GK1, Ruang Dosen Lt. 3, Kafe Manado"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-800 dark:text-white text-sm"
                />
              )}
            </div>

            {/* Pilihan Waktu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pilihan Waktu Konsultasi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date picker */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Hari / Tanggal</p>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-left hover:border-primary/50 transition-colors"
                      >
                        <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className={selectedDate ? "text-gray-900 dark:text-white" : "text-gray-400"}>
                          {selectedDate
                            ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: idLocale })
                            : "Pilih tanggal"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <CalendarPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={{ before: new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time + AM/PM + WITA */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Jam (WITA)</p>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="time"
                      required
                      value={time}
                      min={minTime}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-800 dark:text-white text-sm"
                    />
                  </div>
                  {ampm && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <AMPMBadge period={ampm} />
                      <span className="text-xs text-gray-400">
                        {ampm === "PM" ? "pukul 12:00–23:59" : "pukul 00:00–11:59"}
                      </span>
                      <span className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400">WITA · UTC+8</span>
                    </div>
                  )}
                  {!time && (
                    <p className="mt-1.5 text-xs text-gray-400">Zona waktu: WITA (UTC+8)</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={step === "searching"}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {step === "searching" ? (
                <><Spinner size="sm" className="text-primary-foreground" /> Mencari...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Cari Dosen dengan AI</>
              )}
            </button>
          </form>
        </div>

        {/* ════════════════ Loading ════════════════ */}
        {step === "searching" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-10 flex flex-col items-center justify-center gap-4 min-h-50">
            <div className="relative">
              <div className="absolute inset-0 bg-primary blur-2xl opacity-20 rounded-full animate-pulse" />
              <Sparkles className="w-10 h-10 text-primary animate-pulse relative z-10" />
            </div>
            <p className="text-base font-medium text-gray-800 dark:text-white">
              {LOADING_MESSAGES[loadingMsgIdx]}
            </p>
            <p className="text-xs text-gray-400">Biasanya membutuhkan 5–10 detik</p>
          </div>
        )}

        {/* ════════════════ STEP 2: AI Results ════════════════ */}
        {step === "results" && (
          <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  2 · Pilih Dosen yang Paling Cocok
                </h3>
              </div>
              <button
                onClick={() => { setStep("form"); setBookingError(""); }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Ubah detail
              </button>
            </div>

            {/* Booking recap pill */}
            {bookingSummary && (
              <div className="flex flex-wrap gap-2 items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{bookingSummary}</span>
              </div>
            )}

            {bookingError && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{bookingError}</p>
              </div>
            )}

            {recommendations.map((rec, idx) => {
              const isXAIOpen = expandedXAI === rec.lecturerId;
              return (
                <div
                  key={rec.lecturerId}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow"
                >
                  {idx === 0 && (
                    <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                      Best Match
                    </span>
                  )}

                  <div className="p-5 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Name + match score */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-bold text-gray-900 dark:text-white">{rec.lecturerName}</h4>
                        <span className="text-xs font-semibold bg-primary/10 text-yellow-700 dark:text-primary px-2 py-0.5 rounded-full">
                          {rec.matchScore}% Match
                        </span>
                      </div>

                      {/* Suggested slots */}
                      {rec.suggestedSlots?.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {rec.suggestedSlots.map((slot, i) => (
                            <span key={i} className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                              {slot}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* XAI toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedXAI(isXAIOpen ? null : rec.lecturerId)}
                        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors pt-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Mengapa rekomendasi ini?
                        <ChevronDown className={`w-3 h-3 transition-transform ${isXAIOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>

                    <div className="sm:w-36 flex flex-col justify-center">
                      <button
                        onClick={() => handleBook(rec)}
                        disabled={submittingId !== null}
                        className="w-full bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {submittingId === rec.lecturerId ? (
                          <><Spinner size="sm" /> Booking...</>
                        ) : (
                          "Pilih Dosen"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* XAI expanded section */}
                  {isXAIOpen && (
                    <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 bg-gray-50/60 dark:bg-gray-800/40 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-primary" /> Alasan AI
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {rec.matchReason}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <Info className="w-3 h-3 text-gray-400 shrink-0" />
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                          AI hanya menyarankan. Kamu tetap yang memutuskan.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {recommendations.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                Tidak ada rekomendasi ditemukan. Coba ubah topik atau deskripsi.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
