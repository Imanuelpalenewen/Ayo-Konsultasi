import { useState } from "react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";

export function ProfileForm() {
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();
  
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [major, setMajor] = useState(user?.major || "");
  const [expertise, setExpertise] = useState(user?.expertise?.join(", ") || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateProfile({
        name,
        avatarUrl: avatarUrl || undefined,
        ...(user.role === "student" ? { major } : {}),
        ...(user.role === "lecturer" ? { expertise: expertise.split(",").map(s => s.trim()).filter(Boolean) } : {}),
      });
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.jpg"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
        />
      </div>

      {user.role === "student" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Major</label>
          <input
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>
      )}

      {user.role === "lecturer" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expertise (comma separated)</label>
          <input
            type="text"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            placeholder="Machine Learning, Algorithms"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
