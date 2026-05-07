import { useState } from "react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import { AMPMBadge } from "../shared/AMPMBadge";

const DAYS: { key: string; label: string }[] = [
  { key: "monday",    label: "Senin"  },
  { key: "tuesday",   label: "Selasa" },
  { key: "wednesday", label: "Rabu"   },
  { key: "thursday",  label: "Kamis"  },
  { key: "friday",    label: "Jumat"  },
  { key: "saturday",  label: "Sabtu"  },
  { key: "sunday",    label: "Minggu" },
];

function getPeriod(time: string): "AM" | "PM" {
  const h = parseInt(time.split(":")[0] ?? "0", 10);
  return h >= 12 ? "PM" : "AM";
}

export function AvailabilityForm() {
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [availability, setAvailability] = useState(user?.availability || []);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!user || user.role !== "lecturer") return null;

  const handleAddSlot = (day: string) => {
    setAvailability([...availability, { day, startTime: "09:00", endTime: "17:00" }]);
  };

  const handleRemoveSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleUpdateSlot = (index: number, field: "startTime" | "endTime", value: string) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await updateProfile({ name: user.name, availability });
      setMessage({ type: "success", text: "Jadwal berhasil disimpan." });
    } catch {
      setMessage({ type: "error", text: "Gagal menyimpan jadwal. Coba lagi." });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
              : "bg-red-50 text-red-800 border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-5">
        {DAYS.map(({ key, label }) => {
          const slots = availability.filter((a) => a.day === key);
          return (
            <div key={key} className="border-b border-gray-100 dark:border-gray-800 pb-5">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{label}</h4>
                <button
                  type="button"
                  onClick={() => handleAddSlot(key)}
                  className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  + Tambah Slot
                </button>
              </div>

              {slots.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">Tidak tersedia</p>
              ) : (
                <div className="space-y-2">
                  {availability.map((slot, index) => {
                    if (slot.day !== key) return null;
                    return (
                      <div key={index} className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => handleUpdateSlot(index, "startTime", e.target.value)}
                            className={inputClass}
                          />
                          {slot.startTime && <AMPMBadge period={getPeriod(slot.startTime)} />}
                        </div>
                        <span className="text-gray-400 text-xs font-medium">s/d</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => handleUpdateSlot(index, "endTime", e.target.value)}
                            className={inputClass}
                          />
                          {slot.endTime && <AMPMBadge period={getPeriod(slot.endTime)} />}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(index)}
                          className="text-red-400 hover:text-red-600 dark:hover:text-red-400 text-lg leading-none ml-1 transition-colors"
                          title="Hapus slot"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
      >
        {isSaving ? "Menyimpan..." : "Simpan Jadwal"}
      </button>
    </form>
  );
}
