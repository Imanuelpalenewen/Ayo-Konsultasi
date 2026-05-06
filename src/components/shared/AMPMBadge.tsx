interface AMPMBadgeProps {
  period: "AM" | "PM";
  className?: string;
}

const TOOLTIP: Record<"AM" | "PM", string> = {
  AM: "AM (Ante Meridiem): pukul 00:00 – 11:59 PAGI - SIANG",
  PM: "PM (Post Meridiem): pukul 12:00 – 23:59 SIANG - MALAM",
};

export function AMPMBadge({ period, className = "" }: AMPMBadgeProps) {
  return (
    <span
      title={TOOLTIP[period]}
      className={`inline-flex items-center cursor-help text-xs font-semibold px-1.5 py-0.5 rounded select-none ${
        period === "PM"
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          : "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
      } ${className}`}
    >
      {period}
    </span>
  );
}
