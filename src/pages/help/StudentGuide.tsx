import type { ReactNode } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Clock,
  HelpCircle,
  AlertTriangle,
  Sparkles,
  Search,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

interface GuideSection {
  icon: ReactNode;
  title: string;
  steps: string[];
}

function Section({ icon, title, steps }: GuideSection) {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

interface QAItem {
  q: string;
  a: string;
}

function FAQSection({ items }: { items: QAItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <Card key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{item.q}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.a}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const bookingSections: GuideSection[] = [
  {
    icon: <Sparkles className="w-4 h-4 text-primary" />,
    title: "Booking dengan Rekomendasi AI",
    steps: [
      "Buka menu 'Booking Konsultasi' di sidebar.",
      "Pilih jenis konsultasi (Skripsi, Akademik Umum, Karier, dll.).",
      "Tulis deskripsi kebutuhanmu secara jelas agar AI dapat mencocokkan dosen terbaik.",
      "Klik 'Cari Dosen' — AI akan menganalisis keahlian dan jadwal dosen.",
      "Pilih salah satu dari 3 rekomendasi dosen yang ditampilkan.",
      "Tentukan tanggal, waktu, dan lokasi konsultasi, lalu klik 'Submit'.",
    ],
  },
  {
    icon: <Search className="w-4 h-4 text-primary" />,
    title: "Booking Manual (Pilih Dosen Sendiri)",
    steps: [
      "Di halaman Booking, pilih mode 'Pilih Manual'.",
      "Gunakan filter berdasarkan keahlian untuk mempersempit pilihan.",
      "Klik nama dosen untuk melihat profil dan jadwal tersedia.",
      "Tentukan tanggal, waktu, dan lokasi, lalu kirim permintaan.",
    ],
  },
  {
    icon: <RotateCcw className="w-4 h-4 text-primary" />,
    title: "Reschedule atau Batalkan Booking",
    steps: [
      "Buka menu 'Detail Konsultasi' di sidebar.",
      "Temukan konsultasi yang ingin diubah (status Pending atau Diterima).",
      "Klik tombol 'Batalkan' jika tidak jadi konsultasi.",
      "Untuk reschedule, batalkan dulu lalu buat booking baru dengan jadwal baru.",
    ],
  },
];

const historySections: GuideSection[] = [
  {
    icon: <Clock className="w-4 h-4 text-primary" />,
    title: "Melihat Riwayat Konsultasi",
    steps: [
      "Buka menu 'Riwayat' di sidebar.",
      "Semua konsultasi masa lalu dan saat ini ditampilkan di sini.",
      "Gunakan filter status (Selesai, Dibatalkan, dll.) untuk mempersempit tampilan.",
      "Klik baris konsultasi untuk melihat detail lengkap.",
    ],
  },
  {
    icon: <Calendar className="w-4 h-4 text-primary" />,
    title: "Arti Status Konsultasi",
    steps: [
      "Pending — permintaanmu sudah terkirim, menunggu respons dosen.",
      "Diterima — dosen menyetujui; catat jadwal dan lokasi konsultasi.",
      "Ditolak — dosen tidak bisa; coba booking dengan dosen lain.",
      "Dialihkan — dosen mengalihkan ke dosen lain yang lebih sesuai.",
      "Selesai — konsultasi sudah berlangsung dan ditandai selesai.",
      "Dibatalkan — kamu atau dosen membatalkan konsultasi.",
    ],
  },
];

const faqs: QAItem[] = [
  {
    q: "Berapa lama dosen akan merespons permintaanku?",
    a: "Tidak ada batas waktu baku. Biasanya dosen merespons dalam 1–2 hari kerja. Jika belum ada kabar, kamu bisa membatalkan dan mencoba dosen lain.",
  },
  {
    q: "Apakah saya bisa booking lebih dari satu dosen sekaligus?",
    a: "Ya, kamu bisa membuat beberapa permintaan sekaligus. Setiap permintaan diproses secara independen.",
  },
  {
    q: "Apa perbedaan Rekomendasi AI dan Pilih Manual?",
    a: "Rekomendasi AI menganalisis deskripsi kebutuhanmu dan mengurutkan dosen berdasarkan kecocokan keahlian. Pilih Manual memperlihatkan semua dosen agar kamu bisa memilih sendiri.",
  },
  {
    q: "Bagaimana cara mendapatkan link meeting untuk konsultasi online?",
    a: "Dosen akan mengisi link meeting setelah menerima permintaan. Link akan muncul di halaman Detail Konsultasi.",
  },
  {
    q: "Bisakah saya mengubah jadwal setelah booking diterima?",
    a: "Sistem belum mendukung edit langsung. Batalkan booking yang ada dan buat permintaan baru dengan jadwal yang diinginkan.",
  },
];

const troubleshooting: QAItem[] = [
  {
    q: "Saya tidak bisa login — kata sandi salah.",
    a: "Pastikan kamu memasukkan email dan kata sandi yang benar (case-sensitive). Hubungi admin jika akun belum dibuat.",
  },
  {
    q: "Rekomendasi AI tidak muncul atau error.",
    a: "Pastikan kamu sudah mengisi deskripsi kebutuhan dengan jelas (minimal 20 karakter). Coba lagi setelah beberapa detik — sistem AI kadang membutuhkan waktu lebih lama.",
  },
  {
    q: "Booking saya tidak muncul di Riwayat.",
    a: "Coba refresh halaman. Jika masih tidak muncul, pastikan kamu login dengan akun yang benar.",
  },
  {
    q: "Foto profil saya tidak berubah setelah di-upload.",
    a: "Pastikan ukuran file di bawah 5 MB dan format JPG/PNG. Coba refresh halaman setelah upload berhasil.",
  },
  {
    q: "Notifikasi tidak muncul padahal dosen sudah merespons.",
    a: "Coba refresh halaman atau logout lalu login kembali. Notifikasi real-time bergantung pada koneksi internet yang stabil.",
  },
];

export function StudentGuide() {
  const user = useCurrentUser();
  const markGuideAsSeen = useMutation(api.users.markGuideAsSeen);
  const navigate = useNavigate();
  const isFirstTime = user !== undefined && user !== null && !user.hasSeenGuide;

  const handleFinish = async () => {
    await markGuideAsSeen({});
    navigate("/student");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* First-time banner */}
        {isFirstTime && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary/10 border border-primary/30 rounded-xl px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Baca panduan ini sebelum memulai</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Setelah selesai, klik tombol di samping untuk mulai menggunakan Ayo Konsultasi.</p>
            </div>
            <button
              onClick={() => void handleFinish()}
              className="shrink-0 flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Selesai, Mulai Gunakan!
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panduan Mahasiswa</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pelajari cara menggunakan Ayo Konsultasi</p>
          </div>
        </div>

        <Tabs defaultValue="booking" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-4">
            <TabsTrigger value="booking" className="rounded-lg text-sm">Booking</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg text-sm">Riwayat</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-lg text-sm">FAQ</TabsTrigger>
            <TabsTrigger value="troubleshooting" className="rounded-lg text-sm">Troubleshooting</TabsTrigger>
          </TabsList>

          <TabsContent value="booking" className="space-y-4 mt-0">
            {bookingSections.map((s, i) => (
              <Section key={i} {...s} />
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-0">
            {historySections.map((s, i) => (
              <Section key={i} {...s} />
            ))}
          </TabsContent>

          <TabsContent value="faq" className="mt-0">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pertanyaan yang Sering Ditanyakan</h2>
            </div>
            <FAQSection items={faqs} />
          </TabsContent>

          <TabsContent value="troubleshooting" className="mt-0">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Masalah Umum &amp; Solusinya</h2>
            </div>
            <FAQSection items={troubleshooting} />
          </TabsContent>
        </Tabs>

        <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
          Masih ada pertanyaan? Hubungi admin FILKOM UNKLAB.
        </p>
      </div>
    </DashboardLayout>
  );
}
