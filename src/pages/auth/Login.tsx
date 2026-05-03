import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Loader2, Sparkles } from "lucide-react";
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

  React.useEffect(() => {
    if (currentUser && !isLoading && !error) {
      navigate(currentUser.role === "student" ? "/student" : "/lecturer", { replace: true });
    }
  }, [currentUser, isLoading, error, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const validation = await convex.query(api.users.validateRole, { email, expectedRole: role });

      if (!validation.valid) {
        if (validation.reason === "role_mismatch") {
          setError(`Role tidak sesuai. Akun ini tidak terdaftar sebagai ${role === "student" ? "Mahasiswa" : "Dosen"}.`);
        } else {
          setError("Email atau password salah. Silakan coba lagi.");
        }
        setIsLoading(false);
        return;
      }

      await signIn("password", { email, password, flow: "signIn" });
    } catch (err: any) {
      console.error("Login error:", err);
      if (err?.message?.includes("JWKS") || err?.message?.includes("500")) {
        setError("Terjadi kesalahan konfigurasi server. Hubungi admin.");
      } else {
        setError("Email atau password salah. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      {/* ── LEFT PANEL: Form Card ── */}
      <div className="flex w-full md:w-[480px] h-screen items-center justify-center px-6 md:px-12">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 md:p-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm">AK</span>
            </div>
            <span className="text-base font-bold text-gray-900">Ayo Konsultasi</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Masuk</h1>
            <p className="text-sm text-gray-500">
              AI membantu menemukan dosen. Anda tetap menentukan keputusan.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email kampus
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "student" ? "nama@student.unklab.ac.id" : "nama@unklab.ac.id"}
                required
                disabled={isLoading}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-gray-400 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className="w-full border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm text-gray-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Masuk sebagai</label>
              <div className="flex border border-gray-200 rounded-xl p-1 bg-gray-50">
                {(["student", "lecturer"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    disabled={isLoading}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${
                      role === r
                        ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                        : "bg-transparent text-gray-500 hover:text-gray-700"
                    }`}
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
              className="w-full py-3 mt-1 rounded-xl text-sm font-bold text-primary-foreground bg-primary transition-all hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-primary/20"
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
              Daftar
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="hidden md:flex flex-1 h-screen items-center justify-center relative overflow-hidden bg-[#f0f4f8]">

        {/* Radial glow — absolute background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 55% 40%, rgba(234,179,8,0.12) 0%, transparent 65%)`,
          }}
        />

        {/* Grid — absolute background, top area */}
        <div
          className="absolute top-0 inset-x-0 flex justify-center pt-10 opacity-90 pointer-events-none"
        >
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(7, 56px)",
              gridTemplateRows: "repeat(4, 56px)",
            }}
          >
            {Array.from({ length: 28 }).map((_, i) => {
              const colors = [
                "bg-white border border-gray-100 shadow-sm",
                "bg-white border border-gray-100 shadow-sm",
                "bg-white border border-gray-100 shadow-sm",
                "bg-primary/10 border border-primary/20",
                "bg-primary/10 border border-primary/20",
                "bg-purple-100/60 border border-purple-200/40",
                "flex items-center justify-center bg-white border border-purple-100 shadow-sm",
              ];
              const pattern = [0,1,3,1,0,2,0,4,1,0,6,1,3,0,1,0,2,0,4,6,3,0,1,0,2,1,0,6];
              const colorIdx = pattern[i % pattern.length];
              const isPlus = colorIdx === 6;
              return (
                <div key={i} className={`rounded-2xl ${colors[colorIdx]}`}>
                  {isPlus && <span className="text-base font-bold text-purple-400">✦</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Text block — true center of panel */}
        <div className="relative z-10 text-center px-10 max-w-sm">
          <div className="inline-flex items-center gap-2 mb-5 bg-white/90 border border-gray-100 shadow-sm rounded-full px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Asisten Akademik</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 leading-snug mb-3">
            Rekomendasi terlihat jelas, dapat diperiksa, dan selalu bisa dibatalkan.
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Didukung AI untuk membantu Anda menemukan dosen yang tepat.
          </p>
        </div>
      </div>
    </div>
  );
}
