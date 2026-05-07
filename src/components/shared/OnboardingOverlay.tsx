import { useNavigate } from "react-router-dom";
import { HelpCircle, ArrowRight, BookOpen } from "lucide-react";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export function OnboardingOverlay() {
  const user = useCurrentUser();
  const navigate = useNavigate();

  if (!user) return null;

  const guideHref = user.role === "student" ? "/student/help" : "/lecturer/help";

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6"
      // Block all pointer events on the backdrop itself
      onClick={(e) => e.stopPropagation()}
    >
      {/* Glowing ? circle — the visual focal point */}
      <div className="relative mb-8">
        {/* Outer pulse ring */}
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        {/* Middle ring */}
        <span className="absolute -inset-3 rounded-full border-2 border-primary/20" />
        {/* Core circle */}
        <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.5)]">
          <HelpCircle className="w-12 h-12 text-primary-foreground" strokeWidth={1.5} />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Panduan Wajib</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Selamat datang di Ayo Konsultasi!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Sebelum mulai, baca panduan penggunaan terlebih dahulu agar kamu bisa menggunakan sistem ini dengan benar.
        </p>

        <button
          onClick={() => navigate(guideHref)}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors shadow-md text-sm"
        >
          Baca Panduan Sekarang
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
          Kamu tidak bisa menggunakan sistem ini sebelum membaca panduan.
        </p>
      </div>
    </div>
  );
}
