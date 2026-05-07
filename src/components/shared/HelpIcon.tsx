import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { HelpModal } from "./HelpModal";
import { helpContent } from "../../lib/helpContent";

interface HelpIconProps {
  topic: string;
  className?: string;
}

export function HelpIcon({ topic, className = "" }: HelpIconProps) {
  const snippet = helpContent[topic];
  if (!snippet) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center justify-center w-6 h-6 min-w-[44px] min-h-[44px] rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
          aria-label="Bantuan"
          style={{ width: 44, height: 44 }}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl z-50"
      >
        <HelpModal snippet={snippet} />
      </PopoverContent>
    </Popover>
  );
}
