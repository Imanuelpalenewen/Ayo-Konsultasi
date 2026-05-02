import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { LecturerStats } from "../../components/dashboard/LecturerStats";
import { IncomingRequests } from "../../components/dashboard/IncomingRequests";
import { WeeklySchedule } from "../../components/dashboard/WeeklySchedule";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export function LecturerDashboard() {
  const user = useCurrentUser();

  return (
    <DashboardLayout>
      <div className="space-y-6 h-full flex flex-col text-gray-900 dark:text-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lecturer Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your consultation requests and schedule.</p>
        </div>

        {/* Action Banner */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 max-w-xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Welcome back, {user?.name?.split(" ")[0] || "Lecturer"}!</h3>
            <p className="text-yellow-50 mb-4 text-sm md:text-base">
              You have 4 pending requests that need your attention. Review and manage them below to keep your schedule organized.
            </p>
          </div>
        </div>

        <LecturerStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[500px]">
          <IncomingRequests />
          <WeeklySchedule />
        </div>
      </div>
    </DashboardLayout>
  );
}
