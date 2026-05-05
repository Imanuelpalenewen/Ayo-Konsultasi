import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { LecturerStats } from "../../components/dashboard/LecturerStats";
import { IncomingRequests } from "../../components/dashboard/IncomingRequests";
import { WeeklySchedule } from "../../components/dashboard/WeeklySchedule";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export function LecturerDashboard() {
  const user = useCurrentUser();
  const firstName = user?.name?.split(" ")[0] || "Dosen";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Selamat datang kembali,</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {firstName} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Kelola permintaan konsultasi dan jadwal Anda.
            </p>
          </div>
        </div>

        {/* Stats */}
        <LecturerStats />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
          <IncomingRequests />
          <WeeklySchedule />
        </div>
      </div>
    </DashboardLayout>
  );
}
