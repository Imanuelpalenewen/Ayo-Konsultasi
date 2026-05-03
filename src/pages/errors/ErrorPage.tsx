import { Link, useNavigate } from "react-router-dom";
import { Home, RefreshCw, ArrowLeft, AlertTriangle, ServerCrash, SearchX, ShieldAlert } from "lucide-react";

type ErrorType = "404" | "500" | "403" | "generic";

interface ErrorPageProps {
  type?: ErrorType;
  message?: string;
  onRetry?: () => void;
}

const errorConfig = {
  "404": {
    code: "404",
    title: "Halaman Tidak Ditemukan",
    description: "Sepertinya halaman yang Anda cari sudah dipindahkan, dihapus, atau belum pernah ada.",
    icon: SearchX,
    accent: "text-primary",
    bg: "bg-primary/10",
    emoji: "🔍",
  },
  "500": {
    code: "500",
    title: "Kesalahan Server",
    description: "Terjadi kesalahan di sisi server kami. Tim teknis sudah diberitahu dan sedang bekerja memperbaikinya.",
    icon: ServerCrash,
    accent: "text-red-500",
    bg: "bg-red-50",
    emoji: "🔧",
  },
  "403": {
    code: "403",
    title: "Akses Ditolak",
    description: "Anda tidak memiliki izin untuk mengakses halaman ini. Silakan login dengan akun yang benar.",
    icon: ShieldAlert,
    accent: "text-orange-500",
    bg: "bg-orange-50",
    emoji: "🚫",
  },
  "generic": {
    code: "Oops!",
    title: "Terjadi Kesalahan",
    description: "Sesuatu yang tidak terduga terjadi. Coba muat ulang halaman atau kembali ke beranda.",
    icon: AlertTriangle,
    accent: "text-yellow-500",
    bg: "bg-yellow-50",
    emoji: "⚡",
  },
};

export function ErrorPage({ type = "generic", message, onRetry }: ErrorPageProps) {
  const navigate = useNavigate();
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(234,179,8,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(234,179,8,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
            transform: "translate(-30%, 30%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 md:p-12">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm">AK</span>
            </div>
            <span className="text-sm font-bold text-gray-900">Ayo Konsultasi</span>
          </div>

          {/* Icon + Error Code */}
          <div className="flex flex-col items-center mb-8">
            <div className={`w-24 h-24 ${config.bg} rounded-3xl flex items-center justify-center mb-6 shadow-inner`}>
              <Icon className={`w-12 h-12 ${config.accent}`} strokeWidth={1.5} />
            </div>
            <div className="text-7xl font-black text-gray-100 leading-none select-none mb-2">
              {config.code}
            </div>
          </div>

          {/* Text */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{config.title}</h1>
          <p className="text-gray-500 text-base leading-relaxed mb-2">
            {message || config.description}
          </p>

          {/* Divider */}
          <div className="border-t border-gray-100 my-8" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>

            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
            )}

            <Link
              to="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors shadow-sm shadow-primary/20 w-full sm:w-auto"
            >
              <Home className="w-4 h-4" />
              Ke Beranda
            </Link>
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-sm text-gray-400">
          Butuh bantuan?{" "}
          <span className="font-medium text-primary cursor-pointer hover:underline">
            Hubungi support
          </span>
        </p>
      </div>
    </div>
  );
}

// Convenience exports for direct use
export function NotFoundPage() {
  return <ErrorPage type="404" />;
}

export function ServerErrorPage() {
  return <ErrorPage type="500" />;
}

export function ForbiddenPage() {
  return <ErrorPage type="403" />;
}
