import { Users, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Spinner } from "../shared/Spinner";

export function LecturerStats() {
  const stats = useQuery(api.consultations.getLecturerStats);

  const cards = [
    {
      label: "Permintaan Pending",
      value: stats?.pending ?? 0,
      subLabel: "Menunggu tindakan Anda",
      icon: Clock,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      label: "Diterima Minggu Ini",
      value: stats?.acceptedThisWeek ?? 0,
      subLabel: "Jadwal terkonfirmasi",
      icon: Users,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Total Selesai",
      value: stats?.totalCompleted ?? 0,
      subLabel: "Konsultasi selesai",
      icon: CheckCircle,
      iconColor: "text-green-500",
      iconBg: "bg-green-50 dark:bg-green-900/20",
    },
  ];

  if (stats === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <Spinner size="sm" className="h-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.subLabel}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.iconBg}`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
