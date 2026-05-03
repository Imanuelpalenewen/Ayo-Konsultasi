import { Check, X, Inbox } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Spinner } from "../../components/shared/Spinner";
import { EmptyState } from "../../components/shared/EmptyState";

export function IncomingRequests() {
  const requests = useQuery(api.consultations.getLecturerRequests);
  const updateStatus = useMutation(api.consultations.updateStatus);

  const pendingRequests = requests?.filter(req => req.status === "pending") || [];

  const handleStatusUpdate = async (id: Id<"consultations">, status: "accepted" | "rejected") => {
    try {
      await updateStatus({ consultationId: id, status });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden h-full flex flex-col transition-colors">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Incoming Requests</h3>
        <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {pendingRequests.length} Pending
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {requests === undefined ? (
          <div className="h-full flex items-center justify-center p-8">
            <Spinner size="lg" />
          </div>
        ) : pendingRequests.length === 0 ? (
          <EmptyState 
            icon={Inbox}
            title="All caught up"
            description="You don't have any pending requests."
            className="h-full"
          />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {pendingRequests.map((req) => (
              <div key={req._id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{req.student?.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{req.student?.major}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{req.date}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{req.time}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md border border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Topic:</span> {req.topic}
                  {req.notes && (
                    <span className="block mt-1 text-gray-500 text-xs">Notes: {req.notes}</span>
                  )}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusUpdate(req._id, "accepted")}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(req._id, "rejected")}
                    className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 border border-gray-200 dark:border-gray-600 hover:border-red-200 dark:hover:border-red-500 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
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
