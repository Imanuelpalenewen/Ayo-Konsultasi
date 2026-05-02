import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, BookOpen, FileText, AlertTriangle } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Spinner } from "../../components/shared/Spinner";

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
    if (!selectedLecturer || !date || !time || !topic) return;
    
    // Check if the selected date and time is in the past
    const selectedDateTime = new Date(`${date}T${time}`);
    if (selectedDateTime.getTime() < Date.now()) {
      setErrorMsg("Waktu konsultasi tidak valid. Silakan pilih tanggal dan jam di masa depan.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createConsultation({
        lecturerId: selectedLecturer as Id<"users">,
        date,
        time,
        topic,
        notes,
      });
      navigate("/student?booking_success=true");
    } catch (err) {
      console.error("Booking failed:", err);
      setErrorMsg("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const lecturerDetails = lecturers?.find(l => l.userId === selectedLecturer);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Consultation</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Schedule a new session with a lecturer.</p>
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
                {lecturers?.map(l => (
                  <option key={l.userId} value={l.userId}>{l.name}</option>
                ))}
              </select>
              
              {lecturerDetails && lecturerDetails.expertise && lecturerDetails.expertise.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Expertise: </span>
                  {lecturerDetails.expertise.join(", ")}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Input */}
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

              {/* Free-form Time Input */}
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

            {/* Topic Input */}
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

            {/* Notes Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Additional Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any links, attachments or specific questions..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting || !selectedLecturer}
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
