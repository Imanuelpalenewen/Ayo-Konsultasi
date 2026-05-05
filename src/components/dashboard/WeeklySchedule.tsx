import { Calendar } from "lucide-react";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { Spinner } from "../shared/Spinner";

export function WeeklySchedule() {
  const navigate = useNavigate();
  const schedule = useQuery(api.consultations.getLecturerWeeklySchedule);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden h-full flex flex-col transition-colors">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Jadwal Minggu Ini</h3>
        <button
          onClick={() => navigate("/lecturer/schedule")}
          className="text-sm text-primary font-semibold hover:underline cursor-pointer"
        >
          Lihat Lengkap
        </button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        {schedule === undefined ? (
          <Spinner className="mt-8" />
        ) : (
          <div className="space-y-6">
            {schedule.map((dayPlan, i) => (
              <div key={i} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{dayPlan.day}</h4>
                </div>
                <div className="ml-4 pl-8 border-l-2 border-gray-100 dark:border-gray-700 space-y-3">
                  {dayPlan.sessions.length > 0 ? (
                    dayPlan.sessions.map((session, j) => (
                      <div key={j} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg p-3 relative">
                        <div className="absolute -left-9.75 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white dark:ring-gray-800" />
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-purple-700 dark:text-purple-400 text-sm">{session.time}</span>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                            {session.studentName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{session.topic}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic py-2">No sessions scheduled</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
