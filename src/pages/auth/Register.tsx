import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles } from "lucide-react";

type Role = "student" | "lecturer";

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("student");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "student") navigate("/student");
    else navigate("/lecturer");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── LEFT PANEL ── */}
      <div
        style={{
          width: "46%",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center", // Center form horizontally within left panel
          padding: "48px",
          borderRight: "1px solid #F3F4F6",
        }}
      >
        <div style={{ width: "100%", maxWidth: "380px" }}> {/* Compact form width */}
          {/* Logo mark */}
          <div style={{ marginBottom: "40px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#EAB308", // Mustard Yellow
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>A</span>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>
              Buat Akun
            </h1>
            <p style={{ margin: 0, fontSize: "14px", color: "#6B7280" }}>
              Daftar untuk memulai konsultasi akademik.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Role selector */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                Mendaftar sebagai
              </label>
              <div style={{ display: "flex", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "4px", backgroundColor: "#F9FAFB" }}>
                {(["student", "lecturer"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      backgroundColor: role === r ? "#ffffff" : "transparent",
                      color: role === r ? "#111827" : "#6B7280",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: role === r ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    {r === "student" ? "Mahasiswa" : "Dosen"}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                Nama Lengkap
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Masukkan nama lengkap"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "14px",
                  outline: "none",
                  color: "#111827",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#EAB308";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(234, 179, 8, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* NIM / NIP */}
            <div>
              <label htmlFor="idNumber" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                {role === "student" ? "NIM" : "NIP"}
              </label>
              <input
                id="idNumber"
                type="text"
                placeholder={role === "student" ? "Masukkan NIM" : "Masukkan NIP"}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "14px",
                  outline: "none",
                  color: "#111827",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#EAB308";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(234, 179, 8, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                Email Universitas
              </label>
              <input
                id="email"
                type="email"
                placeholder={role === "student" ? "nama@student.unklab.ac.id" : "nama@unklab.ac.id"}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "14px",
                  outline: "none",
                  color: "#111827",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#EAB308";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(234, 179, 8, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    padding: "10px 40px 10px 14px",
                    fontSize: "14px",
                    outline: "none",
                    color: "#111827",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#EAB308";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(234, 179, 8, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    color: "#9CA3AF",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "#EAB308",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                color: "#ffffff",
                cursor: "pointer",
                marginTop: "8px",
                transition: "background-color 0.2s",
                boxShadow: "0 2px 4px rgba(234, 179, 8, 0.2)",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#CA8A04")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#EAB308")}
            >
              Daftar
            </button>
          </form>

          <p style={{ marginTop: "32px", textAlign: "center", fontSize: "14px", color: "#6B7280" }}>
            Sudah punya akun?{" "}
            <Link to="/login" style={{ fontWeight: 600, color: "#111827", textDecoration: "none" }}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#FAFAFA", // Clean enterprise background
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Focused Radial Glow: Purple & Yellow blend */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(234, 179, 8, 0.08) 40%, rgba(250, 250, 250, 0) 70%)",
            filter: "blur(40px)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 48px", maxWidth: "420px" }}>
          {/* Dynamic AI Icon */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.3) 100%)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(168, 85, 247, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.6)",
                position: "relative",
              }}
            >
              {/* Subtle inner top highlight */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "20px",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
                  pointerEvents: "none",
                }}
              />
              
              {/* Gradient Icon using SVG definitions */}
              <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                  <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />   {/* Purple */}
                    <stop offset="100%" stopColor="#EAB308" /> {/* Yellow */}
                  </linearGradient>
                </defs>
              </svg>
              <Sparkles size={32} style={{ stroke: "url(#icon-gradient)", position: "relative", zIndex: 2 }} />
            </div>
          </div>

          <h2 style={{ margin: "0 0 12px", fontSize: "28px", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>
            Mulai perjalanan akademis Anda
          </h2>
          <p style={{ margin: 0, fontSize: "15px", color: "#6B7280", lineHeight: 1.6 }}>
            Akses rekomendasi jadwal pintar dan nikmati kemudahan bimbingan bersama dosen terbaik Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
