import { useState } from "react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function AvailabilityForm() {
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();
  
  const [availability, setAvailability] = useState(
    user?.availability || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  if (!user || user.role !== "lecturer") return null;

  const handleAddSlot = (day: string) => {
    setAvailability([...availability, { day, startTime: "09:00", endTime: "17:00" }]);
  };

  const handleRemoveSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleUpdateSlot = (index: number, field: "startTime" | "endTime", value: string) => {
    const newAvail = [...availability];
    newAvail[index] = { ...newAvail[index], [field]: value };
    setAvailability(newAvail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateProfile({
        name: user.name, // required by mutation
        availability,
      });
      setMessage({ type: "success", text: "Availability updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update availability." });
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

      <div className="space-y-6">
        {DAYS.map((day) => {
          const slots = availability.filter((a) => a.day === day);
          return (
            <div key={day} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="capitalize font-medium text-gray-800 dark:text-gray-200">{day}</h4>
                <button
                  type="button"
                  onClick={() => handleAddSlot(day)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  + Add Slot
                </button>
              </div>
              
              {slots.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Unavailable</p>
              ) : (
                <div className="space-y-2">
                  {availability.map((slot, index) => {
                    if (slot.day !== day) return null;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleUpdateSlot(index, "startTime", e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleUpdateSlot(index, "endTime", e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(index)}
                          className="text-red-500 hover:text-red-700 px-2"
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
        className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Availability"}
      </button>
    </form>
  );
}
