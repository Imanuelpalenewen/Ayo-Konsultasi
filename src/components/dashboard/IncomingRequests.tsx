import { useState, useEffect } from "react";
import { Check, X, Inbox, RefreshCw, Star, ChevronDown, Video, MapPin } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Spinner } from "../../components/shared/Spinner";
import { EmptyState } from "../../components/shared/EmptyState";
import { SkeletonRequestCard } from "../../components/shared/SkeletonPulse";

type RecommendResult = {
  lecturerId: string;
  lecturerName: string;
  matchScore: number;
  matchReason: string;
  suggestedSlots: string[];
};

const LOADING_MESSAGES = [
  "Menganalisis keahlian dosen...",
  "Mencocokkan jadwal tersedia...",
  "Menyiapkan rekomendasi terbaik...",
];

function ReassignModal({
  consultationId,
  consultationTopic,
  onClose,
}: {
  consultationId: Id<"consultations">;
  consultationTopic: string;
  onClose: () => void;
}) {
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [recommendations, setRecommendations] = useState<RecommendResult[] | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAllLecturers, setShowAllLecturers] = useState(false);

  const allLecturers = useQuery(api.users.getLecturers);
  const recommendReassign = useAction(api.ai.recommendReassignTargets);
  const reassign = useMutation(api.consultations.reassignConsultation);

  // Cycle loading messages while AI is working — same pattern as BookingPage
  useEffect(() => {
    if (!isLoadingAI) return;
    setLoadingMsgIdx(0);
    const interval = setInterval(
      () => setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length),
      3000
    );
    return () => clearInterval(interval);
  }, [isLoadingAI]);

  const startAIRecommendation = async () => {
    setIsLoadingAI(true);
    setAiError(null);
    // Clear previous results so "Muat ulang" always fetches fresh from the API
    setRecommendations(null);
    setSelectedLecturerId("");

    try {
      const results = await recommendReassign({ consultationId });
      setRecommendations(results as RecommendResult[]);
    } catch (err) {
      setAiError("Gagal memuat rekomendasi. Silakan pilih dosen secara manual.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const reasonTrimmed = reason.trim();
  const reasonInvalid = reasonTrimmed.length < 10;

  const handleSubmit = async () => {
    if (!selectedLecturerId || reasonInvalid) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await reassign({
        consultationId,
        newLecturerId: selectedLecturerId as Id<"users">,
        reason: reasonTrimmed,
      });
      onClose();
    } catch (err) {
      setSubmitError("Gagal melakukan reassign. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reassign Konsultasi</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs">
              Topik: {consultationTopic}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* AI Recommendation Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Rekomendasi AI
              </h3>
              {!isLoadingAI && (
                <button
                  onClick={startAIRecommendation}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {recommendations ? "Muat ulang" : "Muat rekomendasi"}
                </button>
              )}
            </div>

            {/* AI Loading State */}
            {isLoadingAI && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center space-y-2">
                <Spinner size="md" />
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 transition-all">
                  {LOADING_MESSAGES[loadingMsgIdx]}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Biasanya membutuhkan 5–10 detik
                </p>
              </div>
            )}

            {/* AI Error */}
            {aiError && !isLoadingAI && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {aiError}
              </p>
            )}

            {/* Recommendation Cards */}
            {recommendations && !isLoadingAI && (
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <button
                    key={rec.lecturerId}
                    onClick={() => setSelectedLecturerId(rec.lecturerId)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedLecturerId === rec.lecturerId
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 font-bold px-1.5 py-0.5 rounded">
                            #{i + 1}
                          </span>
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                            {rec.lecturerName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {rec.matchReason}
                        </p>
                        {rec.suggestedSlots.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {rec.suggestedSlots.slice(0, 2).map((slot) => (
                              <span
                                key={slot}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded"
                              >
                                {slot}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-primary shrink-0">
                        {rec.matchScore}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Initial state — prompt to load */}
            {!recommendations && !isLoadingAI && !aiError && (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Klik "Muat rekomendasi" untuk mendapatkan saran dosen terbaik dari AI.
                </p>
                <button
                  onClick={startAIRecommendation}
                  className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Muat Rekomendasi AI
                </button>
              </div>
            )}
          </div>

          {/* Manual Picker */}
          <div>
            <button
              onClick={() => setShowAllLecturers((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showAllLecturers ? "rotate-180" : ""}`}
              />
              Atau pilih dosen lain
            </button>

            {showAllLecturers && (
              <div className="mt-2">
                {allLecturers === undefined ? (
                  <Spinner size="sm" />
                ) : (
                  <select
                    value={selectedLecturerId}
                    onChange={(e) => setSelectedLecturerId(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Pilih dosen --</option>
                    {allLecturers.map((l) => (
                      <option key={l.userId} value={l.userId}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Reason field — required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alasan Reassign <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Jadwal saya bentrok pada tanggal tersebut, topik lebih sesuai dengan keahlian dosen lain."
              rows={2}
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-colors ${
                reason.length > 0 && reasonInvalid
                  ? "border-red-400 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {reason.length > 0 && reasonInvalid && (
              <p className="text-xs text-red-500 mt-1">Minimal 10 karakter ({reason.trim().length}/10).</p>
            )}
          </div>

          {submitError && (
            <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSubmit}
              disabled={!selectedLecturerId || reasonInvalid || isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Spinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
              Reassign
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IncomingRequests() {
  const requests = useQuery(api.consultations.getLecturerRequests);
  const updateStatus = useMutation(api.consultations.updateStatus);

  const [reassignTarget, setReassignTarget] = useState<{
    id: Id<"consultations">;
    topic: string;
  } | null>(null);

  const pendingRequests = requests?.filter((req) => req.status === "pending") || [];

  const handleStatusUpdate = async (id: Id<"consultations">, status: "accepted" | "rejected") => {
    try {
      await updateStatus({ consultationId: id, status });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  return (
    <>
      {reassignTarget && (
        <ReassignModal
          consultationId={reassignTarget.id}
          consultationTopic={reassignTarget.topic}
          onClose={() => setReassignTarget(null)}
        />
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden h-full flex flex-col transition-colors">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Incoming Requests</h3>
          <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {pendingRequests.length} Pending
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {requests === undefined ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <SkeletonRequestCard />
              <SkeletonRequestCard />
            </div>
          ) : pendingRequests.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="All caught up"
              description="You don't have any pending requests."
              className="h-full"
            />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {pendingRequests.map((req) => (
                <div key={req._id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{req.student?.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{req.student?.major}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{req.date}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{req.time}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md border border-gray-100 dark:border-gray-700">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Topic:</span> {req.topic}
                    {req.notes && (
                      <span className="block mt-1 text-gray-500 text-xs">Notes: {req.notes}</span>
                    )}
                    <span className="flex items-center gap-1 mt-1.5">
                      {req.locationType === "online" ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Online — Jitsi Meet</span>
                        </>
                      ) : req.locationType === "tatap_muka" ? (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Tatap Muka{req.locationDetail ? ` — ${req.locationDetail}` : ""}
                          </span>
                        </>
                      ) : null}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(req._id, "accepted")}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(req._id, "rejected")}
                      className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 border border-gray-200 dark:border-gray-600 hover:border-red-200 dark:hover:border-red-500 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => setReassignTarget({ id: req._id, topic: req.topic })}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-500 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Reassign ke dosen lain"
                    >
                      <RefreshCw className="w-4 h-4" /> Reassign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
