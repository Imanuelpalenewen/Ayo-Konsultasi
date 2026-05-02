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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Incoming Requests</h3>
        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {requests.length} Pending
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
            <p>No pending requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((req) => (
              <div key={req.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{req.studentName}</h4>
                    <p className="text-xs text-gray-500">{req.major}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{req.date}</p>
                    <p className="text-xs text-gray-500">{req.time}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-2 rounded-md border border-gray-100">
                  <span className="font-medium text-gray-900">Topic:</span> {req.topic}
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button className="flex-1 bg-white hover:bg-gray-50 text-red-600 border border-gray-200 hover:border-red-200 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
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
