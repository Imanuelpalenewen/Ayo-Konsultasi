import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { HelpSnippet } from "../../lib/helpContent";

interface HelpModalProps {
  snippet: HelpSnippet;
}

export function HelpModal({ snippet }: HelpModalProps) {
  return (
    <div className="w-72">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        {snippet.title}
      </p>
      <ol className="space-y-1.5 mb-3">
        {snippet.steps.map((step, i) => (
          <li key={i} className="flex gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <Link
        to={snippet.link}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        Lihat panduan lengkap <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
