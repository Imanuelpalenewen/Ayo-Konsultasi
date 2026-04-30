# Ayo Konsultasi

**Ayo Konsultasi** adalah platform konsultasi akademik berbasis web dengan bantuan *AI-assisted decision making*. Sistem ini membantu mahasiswa menemukan dosen yang paling tepat untuk topik konsultasi mereka berdasarkan keahlian dosen, urgensi, jadwal, dan preferensi.

Sistem dibangun menggunakan:
- **Frontend**: React + TypeScript (via Vite)
- **Backend / Database**: Convex (BaaS)
- **AI Engine**: Google Gemini API

## Fitur Utama MVP
- **Permintaan Konsultasi**: Mahasiswa dapat mengajukan konsultasi (Skripsi, KRS, Karir, dll) dengan dukungan deskripsi bebas yang akan dianalisis AI.
- **Rekomendasi Cerdas**: Rule Engine & AI akan mencocokkan dosen terbaik dan waktu yang tersedia.
- **Penjelasan AI (XAI)**: Setiap rekomendasi disertai alasan transparan mengapa rekomendasi tersebut dipilih.
- **Manajemen Jadwal Dosen**: Dosen memiliki kontrol penuh untuk menerima, menolak, atau mengalihkan permintaan ke dosen lain.

## Prasyarat
- Node.js (versi 18+)
- Akun [Convex](https://convex.dev) untuk backend database & serverless functions.
- API Key Google Gemini (untuk NLU dan XAI Text Generation).

## Cara Menjalankan Proyek (Development)

Proyek ini menggunakan Convex sebagai backend yang menyatu dengan *frontend* React.

### 1. Instalasi Dependensi
Jalankan perintah berikut di root folder `AyoKonsultasi`:
```bash
npm install
```

### 2. Konfigurasi Backend (Convex)
Pastikan Anda sudah login ke Convex CLI.
```bash
npx convex dev
```
Perintah ini akan secara otomatis:
- Melakukan sinkronisasi schema dan backend functions Anda ke Convex cloud.
- Mengisi file `.env.local` dengan kredensial *development* yang dibutuhkan oleh frontend.

*Catatan: Biarkan terminal ini tetap berjalan untuk melacak perubahan di folder `convex/`.*

### 3. Menjalankan Frontend Server (Vite)
Buka terminal baru di folder yang sama, lalu jalankan:
```bash
npm run dev
```
Buka `http://localhost:5173` di browser Anda.

## Struktur Direktori
- `convex/`: Berisi seluruh logika *backend* (schema database, query, mutation, AI orchestrator, cron jobs).
- `src/`: Berisi kode React untuk *frontend* (pages, UI components, hooks).
