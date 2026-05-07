// Reusable shimmer skeleton primitives.
// Use animate-pulse (Tailwind) — no external deps, performant, works with dark mode.

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`} />
  );
}

export function SkeletonText({ className = "" }: { className?: string }) {
  return (
    <div className={`h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ${className}`} />
  );
}

// Skeleton for a stat card (LecturerStats / StudentStats shape)
export function SkeletonStatCard() {
  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-2/3" />
          <SkeletonBlock className="h-8 w-12 rounded-xl" />
          <SkeletonText className="w-1/2" />
        </div>
        <SkeletonBlock className="w-11 h-11 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

// Skeleton for a request card (IncomingRequests shape)
export function SkeletonRequestCard() {
  return (
    <div className="p-5 border-b border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1.5 flex-1">
          <SkeletonText className="w-1/2" />
          <SkeletonText className="w-1/3" />
        </div>
        <div className="space-y-1.5 items-end flex flex-col">
          <SkeletonText className="w-20" />
          <SkeletonText className="w-10" />
        </div>
      </div>
      <SkeletonBlock className="h-14 mb-4 rounded-md" />
      <div className="flex gap-2">
        <SkeletonBlock className="flex-1 h-9 rounded-lg" />
        <SkeletonBlock className="flex-1 h-9 rounded-lg" />
        <SkeletonBlock className="w-20 h-9 rounded-lg" />
      </div>
    </div>
  );
}

// Skeleton for a history table row
export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <SkeletonText className={i === 0 ? "w-24" : i === cols - 1 ? "w-16 ml-auto" : "w-full"} />
          {i === 0 && <SkeletonText className="w-16 mt-1.5" />}
        </td>
      ))}
    </tr>
  );
}

// Skeleton for a notification item
export function SkeletonNotification() {
  return (
    <div className="p-3 border-b border-gray-100 dark:border-gray-800 space-y-1.5">
      <SkeletonText className="w-full" />
      <SkeletonText className="w-3/4" />
      <SkeletonText className="w-16 mt-1" />
    </div>
  );
}

// Skeleton for the AI Recommendation page (lecturer card shape)
export function SkeletonRecommendationPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-48 rounded-xl" />
          <SkeletonText className="w-40" />
        </div>
        <SkeletonBlock className="h-7 w-20 rounded-full" />
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: lecturer card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
            {/* Lecturer info */}
            <div className="flex items-start gap-4">
              <SkeletonBlock className="w-12 h-12 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonText className="w-2/3" />
                <div className="flex gap-1.5">
                  <SkeletonBlock className="h-5 w-20 rounded-full" />
                  <SkeletonBlock className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
            {/* Slot info */}
            <SkeletonBlock className="h-20 rounded-xl" />
            {/* XAI section */}
            <div className="space-y-2 pt-2">
              <SkeletonText className="w-1/2" />
              <SkeletonText className="w-3/4" />
              <SkeletonText className="w-2/3" />
            </div>
          </div>
        </div>

        {/* Right: timeline */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
          <SkeletonText className="w-1/2" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <SkeletonBlock className="w-6 h-6 rounded-full shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <SkeletonText className="w-3/4" />
                <SkeletonText className="w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton for a day column in the schedule grid
export function SkeletonScheduleDayCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-pulse">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex items-center gap-2">
        <SkeletonBlock className="w-4 h-4 rounded" />
        <SkeletonText className="w-20" />
      </div>
      <div className="p-4 space-y-3">
        <SkeletonBlock className="h-16 rounded-xl" />
      </div>
    </div>
  );
}

// Skeleton for WeeklySchedule timeline items (day + session)
export function SkeletonTimelineSession() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg p-3 animate-pulse">
      <div className="flex justify-between items-start mb-1.5">
        <SkeletonText className="w-12" />
        <SkeletonText className="w-20" />
      </div>
      <SkeletonText className="w-3/4 mt-1" />
      <SkeletonText className="w-16 mt-1.5" />
    </div>
  );
}

// Pulsing AI orb — used for AI-thinking states
export function AIThinkingOrb({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className="relative flex items-center justify-center">
        {/* Outer ring 1 */}
        <span className="absolute w-20 h-20 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: "1.6s" }} />
        {/* Outer ring 2 */}
        <span className="absolute w-14 h-14 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: "1.2s", animationDelay: "0.2s" }} />
        {/* Core */}
        <span className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="w-5 h-5 rounded-full bg-primary animate-pulse" />
        </span>
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{message}</p>
    </div>
  );
}
