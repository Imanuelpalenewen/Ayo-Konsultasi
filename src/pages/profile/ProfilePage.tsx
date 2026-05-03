import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { ProfileForm } from "../../components/profile/ProfileForm";
import { ChangePasswordForm } from "../../components/profile/ChangePasswordForm";
import { AvailabilityForm } from "../../components/profile/AvailabilityForm";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export function ProfilePage() {
  const user = useCurrentUser();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto text-gray-900 dark:text-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account information and security settings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar / Avatar Area */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 text-center transition-colors">
              <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl border-4 border-primary/20 overflow-hidden mb-4 shadow-inner">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 capitalize text-sm font-medium">{user?.role}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Email</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200 truncate ml-2" title={user?.email}>{user?.email}</span>
                </div>
                {user?.role === "student" && user?.nim && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">NIM</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{user?.nim}</span>
                  </div>
                )}
                {user?.role === "lecturer" && user?.nip && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">NIP</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{user?.nip}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Forms Area */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
              </div>
              <div className="p-5">
                <ProfileForm />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h3>
              </div>
              <div className="p-5">
                <ChangePasswordForm />
              </div>
            </div>

            {user?.role === "lecturer" && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Availability</h3>
                </div>
                <div className="p-5">
                  <AvailabilityForm />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
