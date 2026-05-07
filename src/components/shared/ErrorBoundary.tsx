import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { RefreshCw, Home, ServerCrash } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6">
          {/* Background blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-40"
              style={{
                background: "radial-gradient(circle, rgba(234,179,8,0.10) 0%, transparent 70%)",
                filter: "blur(50px)",
                transform: "translate(30%, -30%)",
              }}
            />
          </div>

          <div className="relative z-10 w-full max-w-lg text-center">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 md:p-12">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-10">
                <div className="w-8 h-8 bg-[#EAB308] rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">AK</span>
                </div>
                <span className="text-sm font-bold text-gray-900">Ayo Konsultasi</span>
              </div>

              {/* Icon */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
                  <ServerCrash className="w-12 h-12 text-red-500" strokeWidth={1.5} />
                </div>
                <div className="text-7xl font-black text-gray-100 leading-none select-none mb-2">500</div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">Terjadi Kesalahan</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-2">
                {this.state.error?.message
                  ? `Error: ${this.state.error.message}`
                  : "Komponen ini mengalami kesalahan yang tidak terduga. Coba muat ulang halaman."}
              </p>

              <div className="border-t border-gray-100 my-8" />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Muat Ulang
                </button>
                <a
                  href="/"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#ca9a07] text-white font-semibold text-sm transition-colors shadow-sm w-full sm:w-auto"
                >
                  <Home className="w-4 h-4" />
                  Ke Beranda
                </a>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-400">
              Masalah terus terjadi?{" "}
              <span className="font-medium text-[#EAB308] cursor-pointer hover:underline">
                Hubungi tim support
              </span>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
