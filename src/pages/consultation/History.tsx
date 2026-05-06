import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { History as HistoryIcon, Clock, CheckCircle, XCircle, SearchX, Video } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Spinner } from "../../components/shared/Spinner";
import { EmptyState } from "../../components/shared/EmptyState";

export function HistoryPage() {
  const user = useCurrentUser();
  
  // Conditionally fetch based on role
  const studentHistory = useQuery(api.consultations.getStudentHistory);
  const lecturerRequests = useQuery(api.consultations.getLecturerRequests);
  const updateStatus = useMutation(api.consultations.updateStatus);
  
  const history = user?.role === "student" ? studentHistory : lecturerRequests;

  const handleStatusUpdate = async (id: Id<"consultations">, status: "completed" | "cancelled") => {
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;
    try {
      await updateStatus({ consultationId: id, status });
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending": return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Pending</span>;
      case "accepted": return <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Accepted</span>;
      case "rejected": return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Rejected</span>;
      case "completed": return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Completed</span>;
      case "cancelled": return <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Cancelled</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-primary" />
            Consultation History
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View your past and upcoming consultations.</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date & Time</th>
                  <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {user?.role === "student" ? "Lecturer" : "Student"}
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Topic</th>
                  <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {!history ? (
                  <tr>
                    <td colSpan={5} className="p-16">
                      <Spinner size="lg" />
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState 
                        icon={SearchX}
                        title="No history found"
                        description="You haven't had any consultations yet."
                      />
                    </td>
                  </tr>
                ) : (
                  history.map((item: any) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.date}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {item.time}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {user?.role === "student" ? item.lecturer?.name : item.student?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user?.role === "student" ? item.lecturer?.expertise?.join(", ") : item.student?.major}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-800 dark:text-gray-200">{item.topic}</div>
                        {item.reassignReason && (
                          <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                            Dialihkan: {item.reassignReason}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end gap-2">
                          {item.status === "accepted" && item.locationType === "online" && item.meetLink && (
                            <a
                              href={item.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium"
                            >
                              <Video className="w-4 h-4" /> Join Meeting
                            </a>
                          )}
                          {item.status === "accepted" && user?.role === "lecturer" && (
                            <button
                              onClick={() => handleStatusUpdate(item._id, "completed")}
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <CheckCircle className="w-4 h-4" /> Mark Completed
                            </button>
                          )}
                          {item.status === "pending" && user?.role === "student" && (
                            <button
                              onClick={() => handleStatusUpdate(item._id, "cancelled")}
                              className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                            >
                              <XCircle className="w-4 h-4" /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
