import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Eye, EyeOff } from "lucide-react";

type FieldVis = { current: boolean; new: boolean; confirm: boolean };

export function ChangePasswordForm() {
  const changePassword = useAction(api.users.changePassword);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [show, setShow] = useState<FieldVis>({ current: false, new: false, confirm: false });

  const toggle = (field: keyof FieldVis) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password baru minimal 6 karakter." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password tidak cocok." });
      return;
    }
    setIsSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setMessage({ type: "success", text: "Password berhasil diubah." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const isWrong = msg.toLowerCase().includes("incorrect") || msg.toLowerCase().includes("invalid");
      setMessage({
        type: "error",
        text: isWrong
          ? "Password saat ini salah. Silakan coba lagi."
          : "Gagal mengubah password. Silakan coba lagi.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fields = [
    { id: "current", label: "Password Saat Ini", value: currentPassword, setter: setCurrentPassword, vis: show.current, field: "current" as const },
    { id: "new", label: "Password Baru", value: newPassword, setter: setNewPassword, vis: show.new, field: "new" as const },
    { id: "confirm", label: "Konfirmasi Password Baru", value: confirmPassword, setter: setConfirmPassword, vis: show.confirm, field: "confirm" as const },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${
          message.type === "success"
            ? "bg-green-50 text-green-800 border border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
            : "bg-red-50 text-red-800 border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {fields.map(({ id, label, value, setter, vis, field }) => (
        <div key={id}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
          <div className="relative">
            <input
              type={vis ? "text" : "password"}
              value={value}
              onChange={(e) => setter(e.target.value)}
              required
              className="w-full pl-4 pr-12 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all bg-gray-50 dark:bg-gray-800 dark:text-white text-sm"
            />
            <button
              type="button"
              onClick={() => toggle(field)}
              className="absolute right-0 top-0 h-full min-w-11 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              tabIndex={-1}
            >
              {vis ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
      >
        {isSaving ? "Memperbarui..." : "Ubah Password"}
      </button>
    </form>
  );
}
