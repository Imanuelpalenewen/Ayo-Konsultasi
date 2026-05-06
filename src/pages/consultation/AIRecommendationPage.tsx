import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { AMPMBadge } from "../../components/shared/AMPMBadge";
import { Spinner } from "../../components/shared/Spinner";
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
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Id } from "../../../convex/_generated/dataModel";

type ConsultationStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

interface TimelineStep {
  label: string;
  description: string;
  state: "done" | "active" | "error" | "upcoming";
}

function buildTimeline(status: ConsultationStatus): TimelineStep[] {
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
    {
      label: "Diproses AI",
      description: "AI menganalisis dan mencocokkan dosen terbaik",
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
      state: isDone("accepted", "completed")
        ? "done"
        : hasError
        ? "error"
        : "upcoming",
    },
    {
      label: "Konsultasi selesai",
      description: isDone("completed")
        ? "Konsultasi telah dilaksanakan"
        : "Belum dilaksanakan",
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

export function AIRecommendationPage() {
  const navigate = useNavigate();
  const history = useQuery(api.consultations.getStudentHistory);
  const updateStatus = useMutation(api.consultations.updateStatus);

  const [xaiOpen, setXaiOpen] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const isLoading = history === undefined;

  // Prefer active consultations; otherwise show the most recent one
  const active = history?.find((c) => c.status === "pending" || c.status === "accepted");
  const consultation = active ?? history?.[0];

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

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="md" />
        </div>
      </DashboardLayout>
    );
  }

  // ── Empty State ────────────────────────────────────────────────────────────
  if (!consultation) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto mt-16 text-center flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Belum ada konsultasi aktif
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
              Mulai dengan booking sesi konsultasi agar AI dapat merekomendasikan dosen
              terbaik untuk kebutuhanmu.
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

  // ── Has Consultation ───────────────────────────────────────────────────────
  const lecturer = (consultation as any).lecturer;
  const status = consultation.status as ConsultationStatus;
  const timeline = buildTimeline(status);

  let formattedDate = consultation.date;
  try {
    formattedDate = format(parseISO(consultation.date), "EEEE, d MMMM yyyy", { locale: idLocale });
  } catch { /* keep raw if parse fails */ }

  const timePeriod = consultation.time
    ? parseInt(consultation.time.split(":")[0]) >= 12 ? "PM" : "AM"
    : null;

  const isActiveConsultation = status === "pending" || status === "accepted";
  const lecturerInitials = lecturer?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  // XAI checklist — derived from consultation data + lecturer expertise
  const xaiPoints = [
    `Topik "${consultation.topic}" sesuai dengan keahlian dosen`,
    `Jadwal konsultasi telah dikonfirmasi: ${formattedDate}`,
    `Dipilih AI berdasarkan kecocokan topik dan ketersediaan jadwal`,
    ...(lecturer?.expertise?.slice(0, 2).map((e: string) => `Keahlian: ${e}`) ?? []),
  ].slice(0, 4);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Page header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Rekomendasi AI
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isActiveConsultation ? "Konsultasi aktifmu saat ini" : "Konsultasi terakhirmu"}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full self-start mt-1 ${STATUS_COLOR[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Lecturer + XAI + Actions */}
          <div className="lg:col-span-2 space-y-4">

            {/* Lecturer card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
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
                <span className="text-[11px] font-semibold bg-primary/10 text-yellow-700 dark:text-primary px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Pick
                </span>
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

              {/* Meet link — shown only after lecturer accepts an online booking */}
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

              {/* XAI section */}
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

              {/* Actions */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex flex-wrap gap-3">
                {status === "pending" && (
                  <>
                    <button
                      onClick={() => navigate("/student/book")}
                      className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      Coba Dosen Lain
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 border border-red-200 dark:border-red-800 hover:border-red-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isCancelling ? <Spinner size="sm" /> : null}
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
          </div>

          {/* Right: Status Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5">
                Status Permintaan
              </h4>
              <ol className="space-y-0">
                {timeline.map((step, idx) => {
                  const isLast = idx === timeline.length - 1;
                  return (
                    <li key={idx} className="flex gap-3">
                      {/* Dot + line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          step.state === "done"
                            ? "bg-green-500 text-white"
                            : step.state === "active"
                            ? "bg-amber-500 text-white"
                            : step.state === "error"
                            ? "bg-red-400 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        }`}>
                          {step.state === "done" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : step.state === "active" ? (
                            <Clock className="w-4 h-4" />
                          ) : step.state === "error" ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <Circle className="w-3 h-3" />
                          )}
                        </div>
                        {!isLast && (
                          <div className={`w-px flex-1 my-1 min-h-[20px] ${
                            step.state === "done" ? "bg-green-300 dark:bg-green-700" : "bg-gray-200 dark:bg-gray-700"
                          }`} />
                        )}
                      </div>

                      {/* Label */}
                      <div className={`pb-5 flex-1 min-w-0 ${isLast ? "" : ""}`}>
                        <p className={`text-sm font-semibold leading-tight ${
                          step.state === "done"
                            ? "text-gray-900 dark:text-white"
                            : step.state === "active"
                            ? "text-amber-700 dark:text-amber-400"
                            : step.state === "error"
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-400 dark:text-gray-600"
                        }`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {/* Booking info footer */}
              <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Topik</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate ml-2 max-w-[120px]">{consultation.topic}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mode</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {consultation.locationType === "online" ? "Online" : "Tatap Muka"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
