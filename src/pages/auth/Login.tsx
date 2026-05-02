import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Role = "student" | "lecturer";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuthActions();
  const currentUser = useCurrentUser();
  const convex = useConvex();

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in and not loading/error, redirect immediately
  React.useEffect(() => {
    if (currentUser && !isLoading && !error) {
      navigate(currentUser.role === "student" ? "/student" : "/lecturer", {
        replace: true,
      });
    }
  }, [currentUser, isLoading, error, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Validate role BEFORE signing in — one-shot query call (READ-ONLY)
      const validation = await convex.query(api.users.validateRole, { email, expectedRole: role });

      if (!validation.valid) {
        if (validation.reason === "role_mismatch") {
          setError(
            `Role tidak sesuai. Akun ini tidak terdaftar sebagai ${
              role === "student" ? "Mahasiswa" : "Dosen"
            }.`
          );
        } else {
          // not_found -> generic error
          setError("Email atau password salah. Silakan coba lagi.");
        }
        setIsLoading(false);
        return;
      }

      // 2. Role is valid — proceed to authenticate
      await signIn("password", { email, password, flow: "signIn" });
      
      // We do NOT navigate imperatively here.
      // Instead, we let the useEffect above handle the redirection automatically
      // once `currentUser` is fetched from Convex. This guarantees we don't
      // redirect before the auth cookie/state is fully propagated, preventing
      // the ProtectedRoute from kicking us back to /login.

    } catch (err: any) {
      console.error("Login error:", err);
      // Check if it's a server configuration error (like missing JWKS)
      if (err?.message?.includes("JWKS") || err?.message?.includes("500")) {
        setError("Terjadi kesalahan konfigurasi server (JWKS missing). Hubungi admin.");
      } else {
        setError("Email atau password salah. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* ── LEFT PANEL: Form ── */}
      <div className="flex w-full md:w-1/2 h-screen items-center justify-center px-6 md:px-12 bg-white">
        <div className="w-full max-w-sm">

          {/* Logo wordmark */}
          <div className="mb-7">
            <span className="text-xl font-bold tracking-tight" style={{ color: "#EAB308" }}>
              Ayo Konsultasi
            </span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight mb-1">
              Masuk
            </h1>
            <p className="text-sm text-gray-500">
              AI-assisted academic consultation system.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Email Universitas
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "student" ? "nama@student.unklab.ac.id" : "nama@unklab.ac.id"}
                required
                disabled={isLoading}
                className="
                  w-full border border-gray-200 rounded-lg px-3.5 py-2.5
                  text-sm text-gray-900 outline-none
                  transition-[border-color,box-shadow] duration-200
                  focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10
                  placeholder:text-gray-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="
                    w-full border border-gray-200 rounded-lg pl-3.5 pr-11 py-2.5
                    text-sm text-gray-900 outline-none
                    transition-[border-color,box-shadow] duration-200
                    focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="
                    absolute right-0 top-1/2 -translate-y-1/2
                    flex items-center justify-center
                    min-w-[44px] min-h-[44px]
                    text-gray-400 hover:text-gray-600
                    transition-colors duration-150
                  "
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Masuk sebagai
              </label>
              <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50">
                {(["student", "lecturer"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    disabled={isLoading}
                    className={`
                      flex-1 py-2 text-[13px] font-medium rounded-md
                      transition-all duration-200 cursor-pointer
                      disabled:cursor-not-allowed
                      ${role === r
                        ? "bg-white text-gray-900 shadow-sm"
                        : "bg-transparent text-gray-500 hover:text-gray-700"
                      }
                    `}
                  >
                    {r === "student" ? "Mahasiswa" : "Dosen"}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-2.5 mt-1 rounded-lg
                text-sm font-semibold text-white
                transition-opacity duration-200 cursor-pointer
                hover:opacity-90 active:scale-[0.99]
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
              style={{ backgroundColor: "#EAB308", boxShadow: "0 2px 8px rgba(234,179,8,0.25)" }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <Link to="/register" className="font-semibold text-gray-900 hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Brand / Illustration ── */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center relative overflow-hidden bg-[#FAFAFA] border-l border-gray-100">
        <div
          className="absolute pointer-events-none"
          style={{
            width: "500px", height: "500px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, rgba(234,179,8,0.08) 40%, rgba(250,250,250,0) 70%)",
            filter: "blur(40px)", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div className="relative z-10 text-center max-w-sm w-full px-8">
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-[20px] relative"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 100%)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(168,85,247,0.12), inset 0 0 0 1px rgba(255,255,255,0.6)",
              }}
            >
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)" }} />
              <svg width="0" height="0" className="absolute">
                <defs>
                  <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#EAB308" />
                  </linearGradient>
                </defs>
              </svg>
              <Sparkles size={32} className="relative z-10" style={{ stroke: "url(#brand-gradient)" }} />
            </div>
          </div>
          <h2 className="text-[26px] font-bold text-gray-900 mb-3 tracking-tight">
            Lebih cepat. Lebih akurat.
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed">
            Sistem mencocokkan jadwal dan keahlian untuk pengalaman konsultasi akademik yang lebih baik.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["AI Recommendation", "Real-time Booking", "Smart Matching"].map((tag) => (
              <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full text-gray-500"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.06)", backdropFilter: "blur(4px)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
