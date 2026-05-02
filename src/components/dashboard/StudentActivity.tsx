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
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: 2,
      title: "New message",
      description: "You have a new message from Dr. Siti.",
      time: "5 hours ago",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: 3,
      title: "Consultation rejected",
      description: "Dr. Joko rejected your request for 'KRS' due to conflict.",
      time: "1 day ago",
      icon: CalendarX,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-0">
        {activities.map((activity, i) => (
          <div 
            key={activity.id} 
            className={`p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors ${
              i !== activities.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className={`p-2.5 rounded-full shrink-0 ${activity.bgColor}`}>
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600 truncate mt-0.5">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 text-center border-t border-gray-200">
        <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
          View all activity
        </button>
      </div>
    </div>
  );
}
