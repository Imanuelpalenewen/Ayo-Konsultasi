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
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  Video,
  ClipboardList,
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

const scheduleSections: GuideSection[] = [
  {
    icon: <Calendar className="w-4 h-4 text-primary" />,
    title: "Mengatur Jadwal Tersedia",
    steps: [
      "Buka menu 'Profil' di sidebar, lalu pilih tab 'Jadwal Tersedia'.",
      "Centang hari-hari di mana kamu tersedia untuk konsultasi.",
      "Isi rentang jam mulai dan selesai untuk setiap hari.",
      "Klik 'Simpan Jadwal', jadwal ini langsung digunakan AI saat mencocokkan mahasiswa.",
      "Perbarui jadwal kapan saja jika ada perubahan ketersediaanmu.",
    ],
  },
];

const requestSections: GuideSection[] = [
  {
    icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
    title: "Menerima atau Menolak Permintaan",
    steps: [
      "Permintaan masuk tampil di dashboard bagian 'Permintaan Konsultasi'.",
      "Klik 'Accept' untuk menyetujui, mahasiswa akan mendapat notifikasi.",
      "Klik 'Decline' jika tidak bisa, berikan alasan agar mahasiswa mengerti.",
      "Status permintaan berubah otomatis dan riwayat tercatat di sistem.",
    ],
  },
  {
    icon: <ClipboardList className="w-4 h-4 text-primary" />,
    title: "Mengalihkan ke Dosen Lain (Reassign)",
    steps: [
      "Klik tombol 'Reassign' pada permintaan yang masuk.",
      "AI akan merekomendasikan dosen lain yang sesuai dengan topik mahasiswa.",
      "Pilih salah satu dosen dari daftar rekomendasi.",
      "Isi alasan pengalihan lalu konfirmasi — sistem akan memberitahu mahasiswa.",
    ],
  },
];

const meetingSections: GuideSection[] = [
  {
    icon: <Video className="w-4 h-4 text-primary" />,
    title: "Menambahkan Link Meeting Online",
    steps: [
      "Setelah menerima permintaan konsultasi online, buka halaman 'Riwayat'.",
      "Temukan konsultasi yang berstatus 'Diterima'.",
      "Klik ikon edit atau tombol 'Tambah Link Meeting'.",
      "Tempel link Google Meet, Zoom, atau platform lain yang kamu gunakan.",
      "Klik 'Simpan' dan link akan otomatis terlihat oleh mahasiswa.",
    ],
  },
];

const faqs: QAItem[] = [
  {
    q: "Apakah saya harus merespons setiap permintaan yang masuk?",
    a: "Sangat disarankan untuk merespons secepat mungkin. Jika tidak bisa, gunakan fitur Reassign agar mahasiswa tidak menunggu terlalu lama.",
  },
  {
    q: "Bisakah saya mengubah keahlian yang tercantum di profil?",
    a: "Ya. Buka Profil → tab 'Info Pribadi' → edit daftar keahlian. Keahlian ini digunakan AI untuk mencocokkan topik konsultasi mahasiswa.",
  },
  {
    q: "Apakah jadwal saya harus diperbarui setiap minggu?",
    a: "Tidak harus. Jadwal yang kamu set berlaku secara berulang setiap minggunya sampai kamu mengubahnya sendiri.",
  },
  {
    q: "Apa yang terjadi jika saya tidak merespons dalam waktu lama?",
    a: "Mahasiswa dapat membatalkan permintaan dan booking ke dosen lain. Tidak ada penalti otomatis dari sistem.",
  },
  {
    q: "Bagaimana jika mahasiswa tidak hadir saat konsultasi?",
    a: "Kamu dapat menandai sesi sebagai 'Selesai' dari halaman Riwayat, atau biarkan apa adanya. Sistem tidak memiliki mekanisme kehadiran otomatis.",
  },
];

const troubleshooting: QAItem[] = [
  {
    q: "Permintaan konsultasi tidak muncul di dashboard saya.",
    a: "Coba refresh halaman. Pastikan koneksi internet stabil, Ayo Konsultasi menggunakan data real-time.",
  },
  {
    q: "Saya tidak bisa login atau kata sandi salah.",
    a: "Pastikan email dan kata sandi benar (case-sensitive). Hubungi admin jika perlu reset akun.",
  },
  {
    q: "Foto profil tidak berubah setelah upload.",
    a: "Pastikan file di bawah 5 MB dan format JPG/PNG. Refresh halaman setelah upload berhasil.",
  },
  {
    q: "Link meeting yang saya tambahkan tidak terlihat oleh mahasiswa.",
    a: "Pastikan kamu sudah menekan 'Simpan' setelah mengisi link. Coba refresh halaman dan periksa kembali.",
  },
  {
    q: "Fitur Reassign error saat digunakan.",
    a: "Pastikan ada dosen lain yang terdaftar dan memiliki jadwal tersedia. Jika masih error, coba decline dulu dan informasikan mahasiswa secara langsung.",
  },
];

export function LecturerGuide() {
  const user = useCurrentUser();
  const markGuideAsSeen = useMutation(api.users.markGuideAsSeen);
  const navigate = useNavigate();
  const isFirstTime = user !== undefined && user !== null && !user.hasSeenGuide;

  const handleFinish = async () => {
    await markGuideAsSeen({});
    navigate("/lecturer");
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panduan Dosen</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pelajari cara mengelola konsultasi di Ayo Konsultasi</p>
          </div>
        </div>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-4">
            <TabsTrigger value="schedule" className="rounded-lg text-sm">Jadwal</TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg text-sm">Permintaan</TabsTrigger>
            <TabsTrigger value="meeting" className="rounded-lg text-sm">Meeting Link</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-lg text-sm">FAQ</TabsTrigger>
            <TabsTrigger value="troubleshooting" className="rounded-lg text-sm">Troubleshooting</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4 mt-0">
            {scheduleSections.map((s, i) => (
              <Section key={i} {...s} />
            ))}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4 mt-0">
            {requestSections.map((s, i) => (
              <Section key={i} {...s} />
            ))}
          </TabsContent>

          <TabsContent value="meeting" className="space-y-4 mt-0">
            {meetingSections.map((s, i) => (
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
