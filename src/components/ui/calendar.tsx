import { DayPicker, type DayPickerProps } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export type CalendarProps = DayPickerProps;

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      {...props}
      className={cn("p-3 select-none", className)}
      classNames={{
        root: "relative",
        months: "relative",
        month_caption: "flex justify-center items-center h-8 mb-2",
        caption_label: "text-sm font-semibold text-gray-900 dark:text-white",
        nav: "absolute inset-x-0 top-0 flex justify-between items-center",
        button_previous: "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500",
        button_next: "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500",
        month_grid: "w-full border-collapse",
        weekdays: "flex mb-1",
        weekday: "w-9 text-center text-xs text-gray-400 font-normal py-1",
        week: "flex",
        day: "relative flex items-center justify-center w-9 h-9 p-0",
        day_button: cn(
          "w-9 h-9 text-sm rounded-lg transition-colors font-normal",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "focus:outline-none focus:ring-2 focus:ring-primary"
        ),
        selected: "[&>button]:!bg-primary [&>button]:!text-primary-foreground [&>button]:hover:!bg-primary/90",
        today: "[&>button]:font-bold [&>button]:text-primary",
        outside: "[&>button]:text-gray-300 dark:[&>button]:text-gray-600 opacity-50",
        disabled: "[&>button]:text-gray-300 dark:[&>button]:text-gray-600 [&>button]:cursor-not-allowed opacity-50",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          ),
      }}
    />
  );
}
