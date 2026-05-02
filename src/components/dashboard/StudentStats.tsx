import { Calendar, Clock, CheckCircle } from "lucide-react";

export function StudentStats() {
  const stats = [
    {
      label: "Upcoming Consultations",
      value: "2",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Pending Requests",
      value: "1",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "Completed",
      value: "5",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
