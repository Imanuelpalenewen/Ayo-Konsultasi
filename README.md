# Ayo Konsultasi

Platform konsultasi akademik berbasis web yang menghubungkan mahasiswa dengan dosen FILKOM UNKLAB. Dibangun sebagai MVP untuk mata kuliah Software Engineering berdasarkan prinsip-prinsip Roger Pressman.

---

## Project Overview

**Ayo Konsultasi** membantu mahasiswa menemukan dosen yang paling sesuai untuk kebutuhan konsultasi mereka. Mulai dari Skripsi, KRS, Karir, hingga topik akademik umum. Sistem menggunakan AI (Google Gemini & Mistral) untuk mencocokkan mahasiswa dengan dosen berdasarkan keahlian, jadwal tersedia, dan relevansi topik.

---

## Tech Stack

| Layer | Teknologi |
|-------|----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Convex (serverless functions + real-time database) |
| Auth | Convex Auth (password provider + JWT) |
| AI Primary | Google Gemini API (`gemini-2.0-flash`) |
| AI Fallback | Mistral API (otomatis jika Gemini rate-limit) |
| Routing | React Router v6 |
| Hosting | Vercel (frontend) + Convex Cloud (backend) |

---

## Features

- **Rekomendasi Dosen dengan AI** — Mahasiswa mendeskripsikan kebutuhan konsultasi → Gemini menganalisis keahlian dan jadwal semua dosen → menampilkan 3 rekomendasi terbaik dengan skor dan alasan (XAI)
- **Booking Manual** — Pilih dosen secara langsung dengan filter berdasarkan keahlian
- **Manajemen Konsultasi Dosen** — Accept, Decline, atau Reassign permintaan masuk; tambah link meeting untuk sesi online
- **Notifikasi Real-Time** — Bell notifikasi dengan dot kuning; data reaktif via Convex WebSocket
- **Sistem Panduan (Help Center)** — Panduan langkah demi langkah untuk mahasiswa dan dosen; onboarding wajib untuk akun baru
- **Profil Lengkap** — Edit profil, upload avatar, ubah password, atur jadwal tersedia (dosen)
- **Riwayat Konsultasi** — Filter berdasarkan status; tampilan berbeda untuk mahasiswa dan dosen
- **Tanya AI** — Chat langsung dengan AI untuk pertanyaan akademik umum
- **Dark Mode** — Dukungan penuh untuk tema gelap dan terang

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- [npm](https://www.npmjs.com/) (sudah termasuk dalam instalasi Node.js)
- Akun [Convex](https://convex.dev) (gratis)
- API Key [Google Gemini](https://aistudio.google.com/app/apikey) (gratis)
- API Key [Mistral](https://admin.mistral.ai/organization/api-keys) (gratis)

### Installation

```bash
# Clone atau ekstrak project
cd AyoKonsultasi

# Install semua dependensi
npm install
```

### Environment Setup

1. Salin file template environment:
   ```bash
   cp .env.example .env.local
   ```

2. Isi nilai yang dibutuhkan di `.env.local`:
   ```
   VITE_CONVEX_URL=https://your-deployment.convex.cloud
   ```
   > **Catatan:** Nilai `VITE_CONVEX_URL` akan otomatis diisi oleh Convex CLI pada langkah berikutnya.

3. Variabel server-side (GEMINI_API_KEY, dll.) diatur di **Convex Dashboard**, bukan di `.env.local`. Lihat bagian [Convex Dashboard Variables](#convex-dashboard-variables) di bawah.

### Running Locally

Jalankan dua terminal secara bersamaan:

**Terminal 1 — Convex Backend:**
```bash
npx convex dev
```
Perintah ini akan login ke Convex, sinkronisasi schema dan functions, dan mengisi `.env.local` secara otomatis. Biarkan terminal ini tetap berjalan.

**Terminal 2 — Frontend:**
```bash
npm run dev
```
Buka `http://localhost:5173` di browser.

### Convex Dashboard Variables

Login ke [dashboard.convex.dev](https://dashboard.convex.dev) → pilih project → **Settings → Environment Variables**, lalu tambahkan:

| Variable | Value | Keterangan |
|----------|-------|-----------|
| `GEMINI_API_KEY` | `AIza...` | API key Google Gemini |
| `MISTRAL_API_KEY` | `...` | Opsional; fallback AI |
| `JWT_PRIVATE_KEY` | (dari generateKeys.mjs) | Kunci privat untuk JWT auth |
| `JWKS` | (dari generateKeys.mjs) | Public key set untuk verifikasi |
| `SITE_URL` | `http://localhost:5173` | URL dev; ganti ke URL produksi saat deploy |

Untuk generate `JWT_PRIVATE_KEY` dan `JWKS`:
```bash
node generateKeys.mjs
```
Salin outputnya ke variabel yang sesuai di Convex Dashboard.

### Seeding Data (Development Only)

Untuk mengisi database **development** dengan data dummy (24 dosen + 25 mahasiswa FILKOM UNKLAB):

1. Pastikan `npx convex dev` sedang berjalan (menggunakan deployment *development*)
2. Buka [dashboard.convex.dev](https://dashboard.convex.dev) → pilih project → **Functions**
3. Cari `seed:seedTestAccounts` → klik **Run**
4. Login dengan akun seed: `stenly.pungus@unklab.ac.id` / `dosen123` atau `mahasiswa1@student.unklab.ac.id` / `student67`

> ⚠️ **Jangan jalankan seed di deployment *production*.** Dev dan production adalah database yang terpisah di Convex — seed hanya boleh dijalankan di deployment development.

---

## Folder Structure

```
AyoKonsultasi/
├── convex/           Backend: schema, queries, mutations, AI actions, auth
├── src/
│   ├── pages/        Halaman-halaman React (auth, dashboard, booking, help, dll.)
│   ├── components/   UI components (shared, dashboard, profile, ui/)
│   ├── hooks/        Custom hooks (useCurrentUser, useDarkMode)
│   └── lib/          Utilities (bookingDraft, helpContent)
├── docs/             Dokumentasi internal (gitignored — local only)
├── .env.example      Template environment variables
├── vercel.json       Konfigurasi Vercel untuk SPA routing
└── generateKeys.mjs  Utility untuk generate JWT keys (Convex Auth)
```

---

## Available Scripts

| Script | Perintah | Keterangan |
|--------|---------|-----------|
| Dev server | `npm run dev` | Jalankan frontend di localhost:5173 |
| Build | `npm run build` | Build production ke folder `dist/` |
| Preview | `npm run preview` | Preview build production secara lokal |
| Lint | `npm run lint` | Jalankan ESLint |
| Test | `npm run test` | Jalankan unit test (vitest) |
| Convex dev | `npx convex dev` | Sinkronisasi backend dan watch perubahan |
| Convex deploy | `npx convex deploy` | Deploy backend ke production |

---

## Project Workflow

Proyek ini menggunakan workflow berbasis branch per fitur. Setiap fitur dikerjakan di branch tersendiri, di-review, lalu di-merge ke `development`, kemudian ke `main`.

Lihat `docs/git-workflow.md` untuk panduan lengkap branch naming, commit message format, dan PR template.

---

## Documentation

File dokumentasi ada di folder `docs/`. Folder ini di-*gitignore* (tidak di-push ke GitHub), namun tersedia di dalam ZIP submission:

| File | Isi |
|------|-----|
| `docs/implementation.md` | Master plan + progress tracker semua fitur |
| `docs/user-stories.md` | User stories (US-01 s/d US-16) + NFR (traceability ke Pressman) |
| `docs/architecture.md` | Layer diagram, schema, keputusan arsitektur |
| `docs/git-workflow.md` | Branch naming, commit format, PR template |

---

## Contributing

1. Baca `docs/implementation.md` untuk mengetahui fitur yang sudah selesai dan yang akan dikerjakan
2. Buat branch baru dari `development` dengan nama sesuai konvensi (lihat `docs/git-workflow.md`)
3. Kerjakan satu fitur per branch, satu perubahan logis per commit
4. Jalankan `npm run lint` dan pastikan tidak ada error sebelum membuat PR
5. Buat PR ke `development` dengan deskripsi yang mengacu pada User Story

---

## Notes for Instructors

Proyek ini dibangun sebagai **MVP Software Engineering** menggunakan pendekatan **Incremental Process Model** dari Roger S. Pressman:

| Prinsip Pressman | Implementasi |
|-----------------|-------------|
| Incremental Model | Setiap fitur dikerjakan di branch terpisah, dapat didemonstrasikan secara mandiri |
| Requirements Traceability | Setiap PR mengacu User Story (US-XX) di `docs/user-stories.md` |
| Software Quality Attributes | Maintainability (strict TypeScript), Reliability (error handling), Usability (loading states, onboarding) |
| Design Patterns | Repository Pattern via Convex queries/mutations; AI Provider Abstraction layer |
| Documentation | `docs/implementation.md` diperbarui setelah setiap fitur selesai |
