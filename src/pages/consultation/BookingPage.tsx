import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  FileText,
  AlertTriangle,
  Globe,
  Building2,
  Video,
} from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Spinner } from "../../components/shared/Spinner";

type LocationType = "online" | "tatap_muka";
type OnlinePlatform = "meet" | "zoom";

export function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lecturerId = searchParams.get("lecturerId");

  const lecturers = useQuery(api.users.getLecturers);
  const createConsultation = useMutation(api.consultations.createConsultation);

  const [selectedLecturer, setSelectedLecturer] = useState<string>(lecturerId || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [locationType, setLocationType] = useState<LocationType | "">("");
  const [onlinePlatform, setOnlinePlatform] = useState<OnlinePlatform>("meet");
  const [locationDetail, setLocationDetail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (lecturerId && !selectedLecturer) {
      setSelectedLecturer(lecturerId);
    }
  }, [lecturerId, selectedLecturer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedLecturer || !date || !time || !topic || !locationType) {
      setErrorMsg("Harap lengkapi semua kolom yang wajib diisi.");
      return;
    }

    if (locationType === "tatap_muka" && !locationDetail.trim()) {
      setErrorMsg("Harap masukkan lokasi pertemuan tatap muka.");
      return;
    }

    const selectedDateTime = new Date(`${date}T${time}`);
    if (selectedDateTime.getTime() < Date.now()) {
      setErrorMsg("Waktu konsultasi tidak valid. Silakan pilih tanggal dan jam di masa depan.");
      return;
    }

    const resolvedLocationDetail =
      locationType === "online"
        ? onlinePlatform === "meet"
          ? "Google Meet"
          : "Zoom"
        : locationDetail.trim();

    setIsSubmitting(true);
    try {
      await createConsultation({
        lecturerId: selectedLecturer as Id<"users">,
        date,
        time,
        topic,
        notes,
        locationType,
        locationDetail: resolvedLocationDetail,
      });
      navigate("/student?booking_success=true");
    } catch (err) {
      console.error("Booking failed:", err);
      setErrorMsg("Gagal membuat booking. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const lecturerDetails = lecturers?.find((l) => l.userId === selectedLecturer);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Consultation</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Schedule a new session with a lecturer.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300">{errorMsg}</p>
              </div>
            )}

            {/* Lecturer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Lecturer
              </label>
              <select
                required
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
              >
                <option value="" disabled>-- Choose a lecturer --</option>
                {lecturers?.map((l) => (
                  <option key={l.userId} value={l.userId}>{l.name}</option>
                ))}
              </select>

              {lecturerDetails?.expertise && lecturerDetails.expertise.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Expertise: </span>
                  {lecturerDetails.expertise.join(", ")}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Topic
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you want to discuss?"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Jenis Pertemuan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Jenis Pertemuan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Online card */}
                <button
                  type="button"
                  onClick={() => setLocationType("online")}
                  className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                    locationType === "online"
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className={`w-5 h-5 ${locationType === "online" ? "text-primary" : "text-gray-400"}`} />
                    <span className={`font-medium text-sm ${locationType === "online" ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}>
                      Online
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Google Meet atau Zoom</span>
                </button>

                {/* Tatap Muka card */}
                <button
                  type="button"
                  onClick={() => setLocationType("tatap_muka")}
                  className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                    locationType === "tatap_muka"
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className={`w-5 h-5 ${locationType === "tatap_muka" ? "text-primary" : "text-gray-400"}`} />
                    <span className={`font-medium text-sm ${locationType === "tatap_muka" ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}>
                      Tatap Muka
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Pertemuan langsung</span>
                </button>
              </div>

              {/* Online sub-options */}
              {locationType === "online" && (
                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pilih platform:</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="onlinePlatform"
                        value="meet"
                        checked={onlinePlatform === "meet"}
                        onChange={() => setOnlinePlatform("meet")}
                        className="accent-primary"
                      />
                      <Video className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Google Meet</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="onlinePlatform"
                        value="zoom"
                        checked={onlinePlatform === "zoom"}
                        onChange={() => setOnlinePlatform("zoom")}
                        className="accent-primary"
                      />
                      <Video className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Zoom</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Link meeting akan digenerate otomatis setelah dosen menyetujui.
                  </p>
                </div>
              )}

              {/* Tatap Muka location input */}
              {locationType === "tatap_muka" && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={locationDetail}
                    onChange={(e) => setLocationDetail(e.target.value)}
                    placeholder="Contoh: Lobby GK1, Ruang Dosen Lt. 3, Kafe Manado"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tautan, lampiran, atau pertanyaan spesifik..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting || !selectedLecturer || !locationType}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="text-primary-foreground" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
