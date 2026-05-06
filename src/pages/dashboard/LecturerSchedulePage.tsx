import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Spinner } from "../../components/shared/Spinner";
import { Calendar, Clock } from "lucide-react";

export function LecturerSchedulePage() {
  const schedule = useQuery(api.consultations.getLecturerWeeklySchedule);

  const totalSessions = schedule?.reduce((sum, d) => sum + d.sessions.length, 0) ?? 0;

  return (
    <DashboardLayout>
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
          <Spinner className="mt-16" />
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
                  dayPlan.sessions.length > 0
                    ? "bg-primary/5"
                    : "bg-gray-50 dark:bg-gray-800/40"
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
                        </div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{session.topic}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{session.studentName}</p>
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
