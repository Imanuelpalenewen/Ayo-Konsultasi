import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { SkeletonScheduleDayCard } from "../../components/shared/SkeletonPulse";
import { Calendar, Clock, Video, MapPin, X, Copy } from "lucide-react";

type Session = {
  _id: string;
  date: string;
  time: string;
  topic: string;
  dayName: string;
  studentName: string;
  locationType?: string;
  locationDetail?: string;
  meetLink?: string;
};

function SessionDetailModal({ session, onClose }: { session: Session; onClose: () => void }) {
  const isOnline = session.locationType === "online";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white text-base leading-tight">
              {session.topic}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{session.studentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Date & time */}
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span>{session.dayName}, {session.date}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>{session.time} WITA</span>
          </div>

          {/* Mode */}
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            {isOnline ? (
              <Video className="w-4 h-4 text-blue-500 shrink-0" />
            ) : (
              <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
            )}
            <span>
              {isOnline ? "Online — Jitsi Meet" : `Tatap Muka${session.locationDetail ? ` — ${session.locationDetail}` : ""}`}
            </span>
          </div>

          {/* Meet link */}
          {isOnline && session.meetLink && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">Link Meeting</p>
              <p className="text-xs text-green-600 dark:text-green-300 break-all">{session.meetLink}</p>
              <div className="flex gap-2 pt-1">
                <a
                  href={session.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  <Video className="w-3.5 h-3.5" /> Join Meeting
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(session.meetLink!)}
                  title="Salin link"
                  className="px-3 py-2 bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 text-green-700 dark:text-green-300 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {isOnline && !session.meetLink && (
            <p className="text-xs text-gray-400 italic">
              Link meeting belum tersedia — akan muncul setelah konsultasi diterima.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function LecturerSchedulePage() {
  const schedule = useQuery(api.consultations.getLecturerWeeklySchedule);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const totalSessions = schedule?.reduce((sum, d) => sum + d.sessions.length, 0) ?? 0;

  return (
    <DashboardLayout>
      {selectedSession && (
        <SessionDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}

      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jadwal Minggu Ini</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Konsultasi yang sudah diterima untuk minggu berjalan.
            {schedule !== undefined && (
              <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                ({totalSessions} sesi)
              </span>
            )}
          </p>
        </div>

        {schedule === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4].map((i) => <SkeletonScheduleDayCard key={i} />)}
          </div>
        ) : totalSessions === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Tidak ada sesi terjadwal minggu ini.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Sesi yang diterima akan muncul di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.map((dayPlan) => (
              <div
                key={dayPlan.day}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
              >
                {/* Day header */}
                <div className={`px-5 py-3 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 ${
                  dayPlan.sessions.length > 0 ? "bg-primary/5" : "bg-gray-50 dark:bg-gray-800/40"
                }`}>
                  <Calendar className={`w-4 h-4 ${dayPlan.sessions.length > 0 ? "text-primary" : "text-gray-400"}`} />
                  <h3 className={`font-semibold text-sm ${dayPlan.sessions.length > 0 ? "text-yellow-800 dark:text-primary" : "text-gray-500 dark:text-gray-400"}`}>
                    {dayPlan.day}
                  </h3>
                  {dayPlan.sessions.length > 0 && (
                    <span className="ml-auto text-xs bg-primary/10 text-yellow-800 dark:text-primary px-2 py-0.5 rounded-full font-medium">
                      {dayPlan.sessions.length} sesi
                    </span>
                  )}
                </div>

                {/* Sessions */}
                <div className="p-4 space-y-3">
                  {dayPlan.sessions.length > 0 ? (
                    dayPlan.sessions.map((session, j) => (
                      <div
                        key={j}
                        className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-sm font-semibold text-primary">{session.time}</span>
                          {/* Location type badge */}
                          {session.locationType === "online" ? (
                            <span className="ml-auto inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                              <Video className="w-3 h-3" /> Online
                            </span>
                          ) : (
                            <span className="ml-auto inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                              <MapPin className="w-3 h-3" /> Tatap Muka
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{session.topic}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{session.studentName}</p>

                        {/* View Details + quick join */}
                        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-700">
                          <button
                            onClick={() => setSelectedSession(session as Session)}
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            Lihat Detail
                          </button>
                          {session.locationType === "online" && session.meetLink && (
                            <a
                              href={session.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:underline font-medium"
                            >
                              <Video className="w-3 h-3" /> Join
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-4">
                      Tidak ada sesi
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
