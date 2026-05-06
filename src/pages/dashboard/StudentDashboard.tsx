import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { StudentStats } from "../../components/dashboard/StudentStats";
import { Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";

function getStatusBadge(status: string) {
  if (status === "accepted") return (
    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 text-xs font-semibold px-2.5 py-1 rounded-full">
      <CheckCircle2 className="w-3 h-3" /> Diterima
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-100 text-xs font-semibold px-2.5 py-1 rounded-full">
      <Clock className="w-3 h-3" /> Menunggu Dosen
    </span>
  );
  if (status === "rejected") return (
    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 text-xs font-semibold px-2.5 py-1 rounded-full">
      <AlertCircle className="w-3 h-3" /> Ditolak
    </span>
  );
  if (status === "completed") return (
    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-2.5 py-1 rounded-full">
      <CheckCircle2 className="w-3 h-3" /> Selesai
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold px-2.5 py-1 rounded-full">
      {status}
    </span>
  );
}

export function StudentDashboard() {
  const user = useCurrentUser();
  const history = useQuery(api.consultations.getStudentHistory) || [];

  const upcomingConsultations = history.filter(h => h.status === "accepted");
  const pendingRequests = history.filter(h => h.status === "pending");
  const completedConsultations = history.filter(h => h.status === "completed");

  // All recent consultations (upcoming + pending) for main card view
  const recentConsultations = history.filter(h => h.status === "accepted" || h.status === "pending");

  const firstName = user?.name?.split(" ")[0] || "Mahasiswa";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Selamat datang kembali,</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {firstName} 👋
            </h1>
            {pendingRequests.length > 0 ? (
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Anda punya <span className="font-semibold text-primary">{pendingRequests.length} permintaan</span> menunggu konfirmasi.
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mt-1">Jadwal Anda kosong. Yuk booking konsultasi baru!</p>
            )}
          </div>
          <Link
            to="/student/book"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Permintaan Baru
          </Link>
        </div>

        {/* Stats Row */}
        <StudentStats
          upcomingCount={upcomingConsultations.length}
          pendingCount={pendingRequests.length}
          completedCount={completedConsultations.length}
        />

        {/* AI Recommendation Banner (if pending) */}
        {pendingRequests.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ada {pendingRequests.length} permintaan konsultasi yang butuh perhatian dosen.
              </span>
            </div>
            <Link
              to="/student/history"
              className="text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors shrink-0 ml-4"
            >
              Lihat Status →
            </Link>
          </div>
        )}

        {/* Tab-like section: Belum Selesai / Selesai */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-1">
              <button className="px-4 py-1.5 text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg">
                Belum Selesai
                {recentConsultations.length > 0 && (
                  <span className="ml-1.5 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {recentConsultations.length}
                  </span>
                )}
              </button>
              <Link to="/student/history" className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors">
                Selesai
              </Link>
            </div>
          </div>

          {recentConsultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-semibold mb-1">Belum ada konsultasi</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">Mulai booking konsultasi pertama Anda sekarang.</p>
              <Link
                to="/student/find-lecturer"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Booking Sekarang
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {recentConsultations.map((consultation) => (
                <div
                  key={consultation._id}
                  className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 hover:shadow-md transition-all group cursor-default ${
                    consultation.status === "accepted"
                      ? "border-l-4 border-l-green-400 border-gray-100 dark:border-gray-800"
                      : "border-gray-100 dark:border-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    {getStatusBadge(consultation.status)}
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{consultation.date}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-2">
                    {consultation.topic}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">
                    {consultation.lecturer?.name || "Dosen belum ditentukan"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <span>📅</span> {consultation.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>🕐</span> {consultation.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
