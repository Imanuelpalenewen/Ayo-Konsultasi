import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { StudentStats } from "../../components/dashboard/StudentStats";
import { StudentActivity } from "../../components/dashboard/StudentActivity";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

export function StudentDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Overview of your consultations and activities.</p>
        </div>

        {/* Action Banner */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 max-w-xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Need Academic Guidance?</h3>
            <p className="text-purple-100 mb-6 text-sm md:text-base">
              Find the perfect lecturer for your needs using our AI-powered recommendation engine, or browse manually.
            </p>
            <Link
              to="/student/find-lecturer"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
              Find a Lecturer
              <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </div>

        <StudentStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Content Area (e.g., upcoming consultations) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h3>
              <Link to="/student/history" className="text-sm text-purple-600 font-medium hover:underline">
                View Calendar
              </Link>
            </div>
            
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-gray-900 font-medium">No upcoming consultations</p>
              <p className="text-gray-500 text-sm mt-1 mb-4">You have a clear schedule for this week.</p>
              <Link
                to="/student/find-lecturer"
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                Book a new session
              </Link>
            </div>
          </div>

          {/* Activity Sidebar Area */}
          <div>
            <StudentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
