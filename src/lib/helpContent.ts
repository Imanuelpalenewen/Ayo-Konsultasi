export interface HelpSnippet {
  title: string;
  steps: string[];
  link: string;
}

const STUDENT_HELP = "/student/help";
const LECTURER_HELP = "/lecturer/help";

export const helpContent: Record<string, HelpSnippet> = {
  "student-dashboard": {
    title: "Cara Menggunakan Dashboard",
    steps: [
      "Lihat ringkasan konsultasi (Pending, Diterima, Selesai) di bagian atas.",
      "Klik 'Booking Konsultasi' atau '+ Permintaan Baru'untuk membuat jadwal baru.",
      "Konsultasi mendatang tampil di kartu 'Belum Selesai'.",
    ],
    link: STUDENT_HELP,
  },
  "booking": {
    title: "Cara Booking Konsultasi",
    steps: [
      "Pilih topik dan deskripsikan kebutuhan konsultasimu.",
      "Pilih 'Rekomendasi AI' atau 'Pilih Manual' untuk menemukan dosen.",
      "Tentukan tanggal, waktu, dan mode pertemuan (online/onsite), lalu kirim permintaan.",
    ],
    link: STUDENT_HELP,
  },
  "booking-confirmation": {
    title: "Status Booking",
    steps: [
      "Dibatalkan : kamu atau dosen membatalkan konsultasi.",
      "Diterima: Konsultasi dikonfirmasi, catat jadwalnya.",
      "Ditolak/Dialihkan: Lihat notifikasi untuk info lebih lanjut.",
    ],
    link: STUDENT_HELP,
  },
  "profile": {
    title: "Kelola Profil",
    steps: [
      "Edit nama dan informasi pribadi di tab 'Info Pribadi'.",
      "Ganti password di tab 'Keamanan'.",
      "Upload foto profil dengan klik avatar di halaman profil.",
    ],
    link: STUDENT_HELP,
  },
  "lecturer-dashboard": {
    title: "Dashboard Dosen",
    steps: [
      "Lihat permintaan masuk di bagian 'Incoming Requests  '.",
      "Klik Accept / Decline / Reassign untuk merespons permintaan.",
      "Jadwal mingguan ditampilkan di bagian bawah dashboard.",
    ],
    link: LECTURER_HELP,
  },
  "lecturer-schedule": {
    title: "Kelola Jadwal Tersedia",
    steps: [
      "Buka Profil → tab 'Jadwal Tersedia' untuk mengatur slot waktu.",
      "Centang hari dan isi rentang jam yang tersedia.",
      "Jadwal ini digunakan AI untuk mencocokkan permintaan mahasiswa.",
    ],
    link: LECTURER_HELP,
  },
};
