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
      setMessage({ type: "success", text: "Profil berhasil diperbarui." });
    } catch (err) {
      setMessage({ type: "error", text: "Gagal memperbarui profil." });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all bg-gray-50 dark:bg-gray-800 dark:text-white text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-100" : "bg-red-50 text-red-800 border border-red-100"}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">URL Avatar</label>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.jpg"
          className={inputClass}
        />
      </div>

      {user.role === "student" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Program Studi</label>
          <input
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {user.role === "lecturer" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Keahlian (pisahkan dengan koma)</label>
          <input
            type="text"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            placeholder="Machine Learning, Algoritma"
            className={inputClass}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
      >
        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

