import { CalendarCheck, CalendarX, MessageSquare } from "lucide-react";

export function StudentActivity() {
  // Placeholder data until Feature 9
  const activities = [
    {
      id: 1,
      title: "Consultation accepted",
      description: "Dr. Budi has accepted your request for 'Thesis Bab 1'.",
      time: "2 hours ago",
      icon: CalendarCheck,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      id: 2,
      title: "New message",
      description: "You have a new message from Dr. Siti.",
      time: "5 hours ago",
      icon: MessageSquare,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      id: 3,
      title: "Consultation rejected",
      description: "Dr. Joko rejected your request for 'KRS' due to conflict.",
      time: "1 day ago",
      icon: CalendarX,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col transition-colors">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
      </div>
      <div className="p-0 flex-1 overflow-y-auto">
        {activities.map((activity, i) => (
          <div 
            key={activity.id} 
            className={`p-5 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
              i !== activities.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""
            }`}
          >
            <div className={`p-2.5 rounded-full shrink-0 ${activity.bgColor}`}>
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activity.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">{activity.description}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-200 dark:border-gray-700">
        <button className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
          View all activity
        </button>
      </div>
    </div>
  );
}
