import { Check, X } from "lucide-react";

export function IncomingRequests() {
  // Mock data
  const requests = [
    {
      id: "1",
      studentName: "Budi Santoso",
      major: "Informatics",
      topic: "Thesis Chapter 1 Guidance",
      date: "Mon, 12 Oct",
      time: "10:00 AM",
    },
    {
      id: "2",
      studentName: "Siti Aminah",
      major: "Information Systems",
      topic: "KRS Consultation",
      date: "Tue, 13 Oct",
      time: "02:30 PM",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col transition-colors">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Incoming Requests</h3>
        <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {requests.length} Pending
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full">
            <p>No pending requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.map((req) => (
              <div key={req.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{req.studentName}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{req.major}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{req.date}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{req.time}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md border border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Topic:</span> {req.topic}
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 border border-gray-200 dark:border-gray-600 hover:border-red-200 dark:hover:border-red-500 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
