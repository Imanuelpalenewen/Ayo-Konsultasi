import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

type Role = "student" | "lecturer";

export function RegisterPage() {
  const navigate = useNavigate();
  const { signIn } = useAuthActions();

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState(""); // NIM or NIP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      // Pass ALL profile data as params, the Password provider's `profile`
      // function + createOrUpdateUser callback in auth.ts handle everything.
      // No separate createUserProfile mutation needed (avoids race condition).
      await signIn("password", {
        email: email.toLowerCase().trim(),
        password,
        flow: "signUp",
        name: name.trim(),
        role,
        ...(role === "student" ? { nim: idNumber.trim() } : {}),
        ...(role === "lecturer" ? { nip: idNumber.trim() } : {}),
      });

      // Redirect to the appropriate dashboard
      navigate(role === "student" ? "/student" : "/lecturer", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("already")) {
        setError("Email ini sudah terdaftar. Silakan masuk.");
      } else {
        setError("Pendaftaran gagal. Silakan periksa data Anda dan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950 transition-colors">

      {/* LEFT PANEL: Form */}
      <div className="flex w-full md:w-1/2 h-screen items-center justify-center px-6 md:px-12 bg-white dark:bg-gray-950">
        <div className="w-full max-w-sm">

          {/* Logo wordmark */}
          <div className="mb-5">
            <span className="text-xl font-bold tracking-tight" style={{ color: "#EAB308" }}>
              Ayo Konsultasi
            </span>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight mb-1">
              Buat Akun
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Daftar untuk memulai konsultasi akademik.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-4">

            {/* Role selector */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mendaftar sebagai
              </label>
              <div className="flex border border-gray-200 dark:border-gray-800 rounded-lg p-1 bg-gray-50 dark:bg-gray-900/50">
                {(["student", "lecturer"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    disabled={isLoading}
                    className={`
                      flex-1 py-1.5 md:py-2 text-[13px] font-medium rounded-md
                      transition-all duration-200 cursor-pointer
                      disabled:cursor-not-allowed
                      ${role === r
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                        : "bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }
                    `}
                  >
                    {r === "student" ? "Mahasiswa" : "Dosen"}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="reg-fullName" className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nama Lengkap
              </label>
              <input
                id="reg-fullName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
                disabled={isLoading}
                className="
                  w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3.5 py-2 md:py-2.5
                  text-sm text-gray-900 dark:text-gray-100 outline-none
                  transition-[border-color,box-shadow] duration-200
                  focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10
                  placeholder:text-gray-400 dark:placeholder:text-gray-600 bg-white dark:bg-gray-900
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
            </div>

            {/* NIM / NIP */}
            <div>
              <label htmlFor="reg-idNumber" className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {role === "student" ? "NIM" : "NIP"}
              </label>
              <input
                id="reg-idNumber"
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={role === "student" ? "Masukkan NIM" : "Masukkan NIP"}
                required
                disabled={isLoading}
                className="
                  w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3.5 py-2 md:py-2.5
                  text-sm text-gray-900 dark:text-gray-100 outline-none
                  transition-[border-color,box-shadow] duration-200
                  focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10
                  placeholder:text-gray-400 dark:placeholder:text-gray-600 bg-white dark:bg-gray-900
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email Universitas
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "student" ? "nama@student.unklab.ac.id" : "nama@unklab.ac.id"}
                required
                disabled={isLoading}
                className="
                  w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3.5 py-2 md:py-2.5
                  text-sm text-gray-900 dark:text-gray-100 outline-none
                  transition-[border-color,box-shadow] duration-200
                  focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10
                  placeholder:text-gray-400 dark:placeholder:text-gray-600 bg-white dark:bg-gray-900
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                  className="
                    w-full border border-gray-200 dark:border-gray-800 rounded-lg pl-3.5 pr-11 py-2 md:py-2.5
                    text-sm text-gray-900 dark:text-gray-100 outline-none
                    transition-[border-color,box-shadow] duration-200
                    focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 bg-white dark:bg-gray-900
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
              <p className="mt-1 text-[11px] text-gray-400">Minimal 8 karakter</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-2.5 mt-0.5 rounded-lg
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
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                "Daftar"
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold text-gray-900 dark:text-white hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Brand / Illustration */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center relative overflow-hidden bg-[#FAFAFA] dark:bg-[#0A0A0A] border-l border-gray-100 dark:border-gray-900">
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
                  <linearGradient id="brand-gradient-reg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#EAB308" />
                  </linearGradient>
                </defs>
              </svg>
              <Sparkles size={32} className="relative z-10" style={{ stroke: "url(#brand-gradient-reg)" }} />
            </div>
          </div>
          <h2 className="text-[26px] font-bold text-gray-900 mb-3 tracking-tight">
            Mulai perjalanan akademis Anda
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed">
            Akses rekomendasi jadwal pintar dan nikmati kemudahan bimbingan bersama dosen terbaik Anda.
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
