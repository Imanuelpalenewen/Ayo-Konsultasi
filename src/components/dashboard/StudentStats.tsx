import { Calendar, Clock, CheckCircle } from "lucide-react";

interface StudentStatsProps {
  upcomingCount: number;
  pendingCount: number;
  completedCount: number;
}

export function StudentStats({ upcomingCount, pendingCount, completedCount }: StudentStatsProps) {
  const stats = [
    {
      label: "Permintaan aktif",
      value: pendingCount,
      subLabel: `${upcomingCount} menunggu Anda`,
      icon: Clock,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Sesi mendatang",
      value: upcomingCount,
      subLabel: upcomingCount > 0 ? "Terjadwal minggu ini" : "Belum ada jadwal",
      icon: Calendar,
      iconColor: "text-green-500",
      iconBg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Rata-rata respons",
      value: completedCount,
      subLabel: "Konsultasi selesai",
      icon: CheckCircle,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.subLabel}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.iconBg}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
