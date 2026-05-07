import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { AMPMBadge } from "../../components/shared/AMPMBadge";
import { SkeletonRecommendationPage } from "../../components/shared/SkeletonPulse";
import { Loader2 } from "lucide-react";
import {
  Sparkles,
  Calendar,
  Globe,
  Building2,
  CheckCircle2,
  Clock,
  Circle,
  XCircle,
  ChevronDown,
  Info,
  ArrowRight,
  Video,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Id } from "../../../convex/_generated/dataModel";

type ConsultationStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";
type BookingSource = "ai" | "manual";

interface TimelineStep {
  label: string;
  description: string;
  state: "done" | "active" | "error" | "upcoming";
}

function buildTimeline(status: ConsultationStatus, source: BookingSource): TimelineStep[] {
  const isActive = (s: ConsultationStatus) => status === s;
  const isDone = (...s: ConsultationStatus[]) => s.includes(status);
  const cancelled = status === "cancelled";
  const rejected = status === "rejected";
  const hasError = cancelled || rejected;

  return [
    {
      label: "Permintaan dikirim",
      description: "Kamu mengajukan permintaan konsultasi",
      state: "done",
    },
    source === "ai"
      ? {
          label: "Diproses AI",
          description: "AI menganalisis dan mencocokkan dosen terbaik",
          state: "done",
        }
      : {
          label: "Dosen dipilih langsung",
          description: "Kamu memilih dosen secara manual",
          state: "done",
        },
    {
      label: "Menunggu konfirmasi dosen",
      description: isActive("pending")
        ? "Dosen belum merespons permintaanmu"
        : hasError
        ? "Tidak dilanjutkan"
        : "Dosen sudah merespons",
      state: isActive("pending") ? "active" : hasError ? "error" : "done",
    },
    {
      label: hasError
        ? cancelled ? "Permintaan dibatalkan" : "Permintaan ditolak dosen"
        : "Dosen menyetujui",
      description: hasError
        ? cancelled ? "Kamu membatalkan permintaan ini" : "Coba ajukan ke dosen lain"
        : isDone("accepted", "completed") ? "Konsultasi telah dijadwalkan" : "Menunggu keputusan dosen",
      state: isDone("accepted", "completed") ? "done" : hasError ? "error" : "upcoming",
    },
    {
      label: "Konsultasi selesai",
      description: isDone("completed") ? "Konsultasi telah dilaksanakan" : "Belum dilaksanakan",
      state: isDone("completed") ? "done" : hasError ? "error" : "upcoming",
    },
  ];
}

const STATUS_LABEL: Record<ConsultationStatus, string> = {
  pending: "Menunggu Dosen",
  accepted: "Diterima",
  rejected: "Ditolak",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const STATUS_COLOR: Record<ConsultationStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  accepted: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

const STATUS_DOT: Record<ConsultationStatus, string> = {
  pending: "bg-amber-400",
  accepted: "bg-green-500",
  rejected: "bg-red-400",
  completed: "bg-blue-500",
  cancelled: "bg-gray-400",
};

export function BookingConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const history = useQuery(api.consultations.getStudentHistory);
  const updateStatus = useMutation(api.consultations.updateStatus);

  const locationSource = (location.state as { bookingSource?: BookingSource } | null)?.bookingSource;
  const [activeTab, setActiveTab] = useState<BookingSource>(locationSource ?? "ai");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [xaiOpen, setXaiOpen] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const isLoading = history === undefined;

  // AI tab: new AI records + old records without bookingSource (backward compat)
  const aiList = useMemo(
    () => (history ?? []).filter((c) => (c as any).bookingSource !== "manual"),
    [history]
  );
  const manualList = useMemo(
    () => (history ?? []).filter((c) => (c as any).bookingSource === "manual"),
    [history]
  );

  const activeList = activeTab === "ai" ? aiList : manualList;

  // Auto-select first item in active tab when data loads or tab changes
  useEffect(() => {
    if (activeList.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!activeList.find((c) => c._id === selectedId)) {
      setSelectedId(activeList[0]._id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, history]);

  const consultation = activeList.find((c) => c._id === selectedId) ?? null;

  const handleTabChange = (tab: BookingSource) => {
    setActiveTab(tab);
    setXaiOpen(true);
    setCancelError("");
  };

  const handleSelectConsultation = (id: string) => {
    setSelectedId(id);
    setXaiOpen(true);
    setCancelError("");
  };

  const handleCancel = async () => {
    if (!consultation) return;
    setIsCancelling(true);
    setCancelError("");
    try {
      await updateStatus({
        consultationId: consultation._id as Id<"consultations">,
        status: "cancelled",
      });
    } catch {
      setCancelError("Gagal membatalkan permintaan. Coba lagi.");
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <DashboardLayout>
        <SkeletonRecommendationPage />
      </DashboardLayout>
    );
  }

  // ── Completely empty (no history at all) ────────────────────────────────────
  if (aiList.length === 0 && manualList.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto mt-16 text-center flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
            <ClipboardList className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Belum ada konsultasi
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
              Mulai dengan booking sesi konsultasi untuk menemukan dosen yang tepat.
            </p>
          </div>
          <button
            onClick={() => navigate("/student/book")}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Book Konsultasi
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Detail vars (only computed when a consultation is selected) ──────────────
  const lecturer = consultation ? (consultation as any).lecturer : null;
  const status = consultation ? (consultation.status as ConsultationStatus) : null;
  const bookingSource: BookingSource = activeTab;
  const isAI = bookingSource === "ai";
  const timeline = consultation && status ? buildTimeline(status, bookingSource) : [];

  let formattedDate = consultation?.date ?? "";
  try {
    if (consultation) {
      formattedDate = format(parseISO(consultation.date), "EEEE, d MMMM yyyy", { locale: idLocale });
    }
  } catch { /* keep raw */ }

  const timePeriod = consultation?.time
    ? parseInt(consultation.time.split(":")[0]) >= 12 ? "PM" : "AM"
    : null;

  const isActiveConsultation = status === "pending" || status === "accepted";

  const lecturerInitials = lecturer?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  const xaiPoints = consultation ? [
    `Topik "${consultation.topic}" sesuai dengan keahlian dosen`,
    `Jadwal konsultasi: ${formattedDate}`,
    `Dipilih AI berdasarkan kecocokan topik dan ketersediaan jadwal`,
    ...(lecturer?.expertise?.slice(0, 2).map((e: string) => `Keahlian: ${e}`) ?? []),
  ].slice(0, 4) : [];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Detail Konsultasi
          </h2>
          <button
            onClick={() => navigate("/student/book")}
            className="flex items-center gap-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Booking Baru
          </button>
        </div>

        {/* Source tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleTabChange("ai")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === "ai"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Dipilih AI
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              activeTab === "ai"
                ? "bg-primary/15 text-yellow-700 dark:text-primary"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            }`}>
              {aiList.length}
            </span>
          </button>
          <button
            onClick={() => handleTabChange("manual")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === "manual"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Dipilih Manual
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              activeTab === "manual"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            }`}>
              {manualList.length}
            </span>
          </button>
        </div>

        {/* Content area */}
        {activeList.length === 0 ? (
          /* Empty tab state */
          <div className="py-16 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {activeTab === "ai"
                ? <Sparkles className="w-7 h-7 text-gray-400" />
                : <UserCheck className="w-7 h-7 text-gray-400" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Belum ada konsultasi {activeTab === "ai" ? "via AI" : "manual"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {activeTab === "ai"
                  ? "Gunakan fitur AI untuk mendapat rekomendasi dosen terbaik."
                  : "Pilih dosen langsung dari daftar saat booking."}
              </p>
            </div>
            <button
              onClick={() => navigate("/student/book")}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Booking sekarang →
            </button>
          </div>
        ) : (
          /* Two-column layout: list + detail */
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">

            {/* LEFT: Consultation list */}
            <div className="space-y-2 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 mb-3">
                {activeList.length} Konsultasi
              </p>
              {activeList.map((c, idx) => {
                const cStatus = c.status as ConsultationStatus;
                const cLecturer = (c as any).lecturer;
                let cDate = c.date;
                try { cDate = format(parseISO(c.date), "d MMM yyyy", { locale: idLocale }); } catch { /* keep raw */ }
                const isSelected = c._id === selectedId;

                return (
                  <button
                    key={c._id}
                    onClick={() => handleSelectConsultation(c._id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? activeTab === "ai"
                          ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                          : "border-blue-400 bg-blue-50/60 dark:bg-blue-900/20 shadow-sm"
                        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Number */}
                      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 ${
                        isSelected
                          ? activeTab === "ai" ? "bg-primary text-white" : "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + status */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {cLecturer?.name ?? "Dosen"}
                          </span>
                          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[cStatus]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cStatus]}`} />
                            {STATUS_LABEL[cStatus]}
                          </span>
                        </div>
                        {/* Topic */}
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                          {c.topic}
                        </p>
                        {/* Date + time */}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          {cDate} · {c.time} WITA
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* RIGHT: Selected consultation detail */}
            {consultation && status ? (
              <div className="space-y-4">
                {/* Source badge row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isAI
                      ? "bg-primary/10 text-yellow-700 dark:text-primary"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  }`}>
                    {isAI ? <Sparkles className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                    {isAI ? "Direkomendasikan AI" : "Dipilih Manual"}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[status]}`}>
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {isActiveConsultation ? "Konsultasi aktif" : "Konsultasi selesai/dibatalkan"}
                  </span>
                </div>

                {/* Main 2-column inner layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Lecturer card */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden md:col-span-2">
                    {/* Lecturer info */}
                    <div className="p-5 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                        {lecturerInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                          {lecturer?.name ?? "Dosen"}
                        </h3>
                        {lecturer?.expertise && lecturer.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(lecturer.expertise as string[]).slice(0, 3).map((e) => (
                              <span key={e} className="text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                {e}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {isAI ? (
                        <span className="text-[11px] font-semibold bg-primary/10 text-yellow-700 dark:text-primary px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI Pick
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Manual
                        </span>
                      )}
                    </div>

                    {/* Slot info */}
                    <div className="mx-5 mb-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4">
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="font-medium">{consultation.time}</span>
                          {timePeriod && <AMPMBadge period={timePeriod} />}
                          <span className="text-xs text-gray-500">WITA</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          {consultation.locationType === "online" ? (
                            <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          ) : (
                            <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          )}
                          <span>
                            {consultation.locationType === "online" ? "Online" : "Tatap Muka"}
                            {consultation.locationDetail ? ` — ${consultation.locationDetail}` : ""}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t border-amber-100 dark:border-amber-800 text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Topik:</span> {consultation.topic}
                      </div>
                    </div>

                    {/* Meet link */}
                    {status === "accepted" && consultation.locationType === "online" && consultation.meetLink && (
                      <div className="mx-5 mb-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
                        <Video className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400">Jitsi Meet — Konsultasi Online</p>
                          <p className="text-xs text-green-600/70 dark:text-green-400/60 mt-0.5">Klik tombol untuk membuka meeting</p>
                        </div>
                        <a
                          href={consultation.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          <Video className="w-4 h-4" /> Join Meeting
                        </a>
                      </div>
                    )}

                    {/* XAI — only for AI-sourced bookings */}
                    {isAI && (
                      <div className="border-t border-gray-100 dark:border-gray-800">
                        <button
                          type="button"
                          onClick={() => setXaiOpen((v) => !v)}
                          className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Mengapa dosen ini direkomendasikan?
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${xaiOpen ? "rotate-180" : ""}`} />
                        </button>
                        {xaiOpen && (
                          <div className="px-5 pb-5 space-y-3">
                            <ul className="space-y-2">
                              {xaiPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                            <div className="flex items-start gap-1.5 pt-1">
                              <Info className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                                AI hanya menyarankan. Kamu dan dosen tetap yang memutuskan.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex flex-wrap gap-3">
                      {status === "pending" && (
                        <>
                          <button
                            onClick={() => navigate("/student/book")}
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg transition-colors"
                          >
                            Pilih Dosen Lain
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 border border-red-200 dark:border-red-800 hover:border-red-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Batalkan Permintaan
                          </button>
                          {cancelError && <p className="text-xs text-red-500 w-full">{cancelError}</p>}
                        </>
                      )}
                      {status === "accepted" && (
                        <button
                          onClick={() => navigate("/student/history")}
                          className="flex items-center gap-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                        >
                          Lihat Riwayat Lengkap
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      {(status === "completed" || status === "rejected" || status === "cancelled") && (
                        <button
                          onClick={() => navigate("/student/book")}
                          className="flex items-center gap-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          Book Konsultasi Baru
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 md:col-span-2">
                    <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5">
                      Status Permintaan
                    </h4>
                    <ol className="flex flex-col sm:flex-row sm:items-start gap-0 sm:gap-0">
                      {timeline.map((step, idx) => {
                        const isLast = idx === timeline.length - 1;
                        return (
                          <li key={idx} className="flex sm:flex-col sm:flex-1 gap-3 sm:gap-0 sm:items-center">
                            {/* Vertical connector (mobile) / Horizontal (desktop) */}
                            <div className="flex flex-col sm:flex-row sm:w-full sm:items-center">
                              {/* Dot */}
                              <div className="relative flex items-center justify-center shrink-0">
                                {step.state === "active" && (
                                  <>
                                    <span className="absolute w-10 h-10 rounded-full bg-amber-400/20 animate-ping" style={{ animationDuration: "1.8s" }} />
                                    <span className="absolute w-8 h-8 rounded-full bg-amber-400/25 animate-ping" style={{ animationDuration: "1.4s", animationDelay: "0.2s" }} />
                                  </>
                                )}
                                <div className={`relative w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                                  step.state === "done" ? "bg-green-500 text-white"
                                  : step.state === "active" ? "bg-amber-500 text-white"
                                  : step.state === "error" ? "bg-red-400 text-white"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                }`}>
                                  {step.state === "done" ? <CheckCircle2 className="w-4 h-4" />
                                  : step.state === "active" ? <Clock className="w-4 h-4" />
                                  : step.state === "error" ? <XCircle className="w-4 h-4" />
                                  : <Circle className="w-3 h-3" />}
                                </div>
                              </div>
                              {/* Connector line */}
                              {!isLast && (
                                <div className={`sm:flex-1 sm:h-px w-px sm:w-auto h-5 my-1 sm:my-0 sm:mx-1 self-center ${
                                  step.state === "done" ? "bg-green-300 dark:bg-green-700" : "bg-gray-200 dark:bg-gray-700"
                                }`} />
                              )}
                            </div>
                            {/* Label */}
                            <div className="pb-4 sm:pb-0 sm:pt-3 sm:text-center flex-1 sm:flex-none min-w-0 sm:px-1">
                              <p className={`text-xs font-semibold leading-tight ${
                                step.state === "done" ? "text-gray-900 dark:text-white"
                                : step.state === "active" ? "text-amber-700 dark:text-amber-400"
                                : step.state === "error" ? "text-red-500 dark:text-red-400"
                                : "text-gray-400 dark:text-gray-600"
                              }`}>
                                {step.label}
                              </p>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed hidden sm:block">
                                {step.description}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>

                    {/* Booking info footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-400 dark:text-gray-500">Topik</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mt-0.5 truncate">{consultation.topic}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 dark:text-gray-500">Mode</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                          {consultation.locationType === "online" ? "Online" : "Tatap Muka"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 dark:text-gray-500">Sumber</p>
                        <p className={`font-medium mt-0.5 ${isAI ? "text-yellow-700 dark:text-primary" : "text-blue-600 dark:text-blue-400"}`}>
                          {isAI ? "AI" : "Manual"}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* No selection yet (tab is non-empty but nothing selected) */
              <div className="flex items-center justify-center h-40 text-sm text-gray-400 dark:text-gray-500">
                Pilih konsultasi di kiri untuk melihat detail
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
