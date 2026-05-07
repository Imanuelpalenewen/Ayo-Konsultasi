import { useRef, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { ProfileForm } from "../../components/profile/ProfileForm";
import { ChangePasswordForm } from "../../components/profile/ChangePasswordForm";
import { AvailabilityForm } from "../../components/profile/AvailabilityForm";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { HelpIcon } from "../../components/shared/HelpIcon";
import { Camera, Loader2 } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function ProfilePage() {
  const user = useCurrentUser();
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateAvatar = useMutation(api.users.updateAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Resolve avatar URL: handles both legacy HTTP URLs and Convex storageIds.
  // useStorageUrl does not exist in convex@1.36 — we use a backend query instead.
  const resolvedAvatarUrl = useQuery(
    api.users.resolveStorageUrl,
    user !== undefined ? { storageId: user?.avatarUrl ?? null } : "skip"
  );
  const avatarDisplayUrl = resolvedAvatarUrl ?? undefined;

  const handleAvatarClick = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Ukuran file maksimal 5 MB.");
      return;
    }
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload gagal.");
      const { storageId } = await res.json();
      await updateAvatar({ storageId });
    } catch {
      setUploadError("Gagal mengupload foto. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const initials = user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto text-gray-900 dark:text-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Profil
            <HelpIcon topic="profile" />
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Kelola informasi akun dan pengaturan keamananmu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar card */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 text-center">
              {/* Avatar with upload overlay */}
              <div className="relative w-28 h-28 mx-auto mb-4">
                <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl border-4 border-primary/20 overflow-hidden shadow-inner">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : avatarDisplayUrl ? (
                    <img src={avatarDisplayUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  title="Ganti foto profil"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {uploadError && (
                <p className="text-xs text-red-500 mb-2">{uploadError}</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleFileChange}
              />

              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 capitalize text-sm font-medium">{user?.role}</p>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Email</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200 truncate ml-2" title={user?.email}>
                    {user?.email}
                  </span>
                </div>
                {user?.role === "student" && user?.nim && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">NIM</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{user.nim}</span>
                  </div>
                )}
                {user?.role === "lecturer" && user?.nip && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">NIP</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{user.nip}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabbed forms area */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <Tabs defaultValue="info">
                  <TabsList className="w-full">
                    <TabsTrigger value="info">Info Pribadi</TabsTrigger>
                    <TabsTrigger value="security">Keamanan</TabsTrigger>
                    {user?.role === "lecturer" && (
                      <TabsTrigger value="schedule">Jadwal Tersedia</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="info" className="p-4">
                    <ProfileForm />
                  </TabsContent>

                  <TabsContent value="security" className="p-4">
                    <ChangePasswordForm />
                  </TabsContent>

                  {user?.role === "lecturer" && (
                    <TabsContent value="schedule" className="p-4">
                      <AvailabilityForm />
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
