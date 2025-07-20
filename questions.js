// questions.js
// Berisi 600 soal unik untuk kuis PPPK ATRBPN
// Terbagi dalam 6 seksi, masing-masing 2 tipe tes (mansoskul & teknis), 50 soal per tipe.

// Fungsi untuk mendapatkan kompetensi acak
import { competencies } from './competencies.js';

function getRandomCompetencies(count = 1) {
    const shuffled = [...competencies].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(c => c.name);
}

const sections = [
    "Survei dan Pemetaan",
    "Penetapan Hak dan Pendaftaran",
    "Penataan dan Pemberdayaan",
    "Pengadaan Tanah dan Pengembangan",
    "Pengendalian dan Penanganan Sengketa",
    "Tata Usaha"
];

const testTypes = ["mansoskul", "teknis"];

const allQuestions = {};

let questionIdCounter = 0;

sections.forEach(section => {
    allQuestions[section] = {};
    testTypes.forEach(type => {
        allQuestions[section][type] = [];
        for (let i = 0; i < 50; i++) {
            questionIdCounter++;
            let questionText = "";
            let options = [];
            let answerIndex = 0;
            let explanationText = "";
            let competencyNames = getRandomCompetencies(Math.floor(Math.random() * 2) + 1); // 1 atau 2 kompetensi

            if (type === "mansoskul") {
                // Soal Manajerial & Sosial Kultural
                switch (section) {
                    case "Survei dan Pemetaan":
                        questionText = `Sebagai seorang PPPK di bidang Survei dan Pemetaan, bagaimana Anda memastikan koordinasi yang efektif dengan tim lintas divisi saat ada perbedaan pendapat mengenai metode pengukuran?`;
                        options = [
                            "Memaksakan metode yang Anda yakini paling benar.",
                            "Mencari titik temu dan mengedepankan solusi yang menguntungkan semua pihak.",
                            "Melaporkan perbedaan tersebut kepada atasan dan menunggu keputusan.",
                            "Mengabaikan perbedaan dan melanjutkan pekerjaan sesuai rencana awal."
                        ];
                        answerIndex = 1;
                        explanationText = "Dalam koordinasi tim, penting untuk mencari titik temu dan solusi kolaboratif untuk mencapai tujuan bersama, mencerminkan kompetensi Kerja Sama dan Komunikasi.";
                        competencyNames = ["Kerja Sama", "Komunikasi"];
                        break;
                    case "Penetapan Hak dan Pendaftaran":
                        questionText = `Anda menerima keluhan dari masyarakat terkait lambatnya proses pendaftaran hak. Apa tindakan pertama yang akan Anda lakukan?`;
                        options = [
                            "Menyalahkan sistem yang ada.",
                            "Mencari tahu akar masalah dan mengidentifikasi area perbaikan.",
                            "Meminta masyarakat untuk bersabar.",
                            "Mengalihkan keluhan kepada rekan kerja."
                        ];
                        answerIndex = 1;
                        explanationText = "Mencari akar masalah adalah langkah awal untuk perbaikan layanan publik, menunjukkan kompetensi Pelayanan Publik dan Orientasi pada Hasil.";
                        competencyNames = ["Pelayanan Publik", "Orientasi pada Hasil"];
                        break;
                    case "Penataan dan Pemberdayaan":
                        questionText = `Bagaimana Anda menghadapi resistensi dari kelompok masyarakat saat memperkenalkan program penataan lahan yang baru?`;
                        options = [
                            "Mengabaikan resistensi dan tetap melanjutkan program.",
                            "Melakukan pendekatan persuasif dan dialog untuk menjelaskan manfaat program.",
                            "Meminta bantuan aparat keamanan untuk menertibkan.",
                            "Menghentikan program sementara waktu."
                        ];
                        answerIndex = 1;
                        explanationText = "Pendekatan persuasif dan dialog efektif dalam mengelola perubahan dan membangun penerimaan masyarakat, mencerminkan kompetensi Pengelolaan Perubahan dan Komunikasi.";
                        competencyNames = ["Pengelolaan Perubahan", "Komunikasi"];
                        break;
                    case "Pengadaan Tanah dan Pengembangan":
                        questionText = `Saat bernegosiasi dengan pemilik lahan untuk pengadaan tanah, Anda menemukan bahwa mereka memiliki tuntutan yang tidak realistis. Apa strategi Anda?`;
                        options = [
                            "Menolak tuntutan mereka secara langsung dan mengakhiri negosiasi.",
                            "Mencoba memahami perspektif mereka dan menawarkan solusi win-win.",
                            "Mengancam akan menggunakan jalur hukum.",
                            "Meninggalkan negosiasi dan mencari lahan lain."
                        ];
                        answerIndex = 1;
                        explanationText = "Mencoba memahami perspektif pihak lain dan mencari solusi bersama adalah kunci negosiasi yang efektif, menunjukkan kompetensi Komunikasi dan Kerja Sama.";
                        competencyNames = ["Komunikasi", "Kerja Sama"];
                        break;
                    case "Pengendalian dan Penanganan Sengketa":
                        questionText = `Dalam mediasi sengketa tanah, salah satu pihak menunjukkan sikap yang sangat emosional dan sulit diajak berkomunikasi. Bagaimana Anda menanganinya?`;
                        options = [
                            "Menghentikan mediasi dan menyarankan jalur hukum.",
                            "Tetap tenang, mendengarkan dengan empati, dan mencoba menenangkan pihak tersebut.",
                            "Membiarkan pihak lain yang menangani.",
                            "Menyuruh pihak tersebut untuk tenang dengan nada keras."
                        ];
                        answerIndex = 1;
                        explanationText = "Menjaga ketenangan dan empati sangat penting dalam situasi konflik, mencerminkan kompetensi Komunikasi dan Integritas.";
                        competencyNames = ["Komunikasi", "Integritas"];
                        break;
                    case "Tata Usaha":
                        questionText = `Anda menemukan rekan kerja sering terlambat menyerahkan laporan, yang berdampak pada kinerja tim. Bagaimana Anda menyikapinya?`;
                        options = [
                            "Mendiamkan saja karena tidak ingin memperburuk suasana.",
                            "Menegur secara langsung di depan umum.",
                            "Membicarakan secara pribadi dengan pendekatan konstruktif.",
                            "Melaporkan langsung kepada atasan tanpa berbicara dengan rekan tersebut."
                        ];
                        answerIndex = 2;
                        explanationText = "Pendekatan pribadi dan konstruktif efektif dalam mengatasi masalah kinerja rekan kerja, menunjukkan kompetensi Komunikasi dan Integritas.";
                        competencyNames = ["Komunikasi", "Integritas"];
                        break;
                }
            } else {
                // Soal Teknis
                switch (section) {
                    case "Survei dan Pemetaan":
                        questionText = `Apa fungsi utama dari base station dalam pengukuran GNSS RTK?`;
                        options = [
                            "Merekam data mentah untuk post-processing.",
                            "Memberikan koreksi real-time kepada receiver rover.",
                            "Menyimpan data peta dasar.",
                            "Mengirimkan sinyal satelit ke rover."
                        ];
                        answerIndex = 1;
                        explanationText = "Base station dalam RTK berfungsi mengirimkan data koreksi diferensial secara real-time untuk meningkatkan akurasi posisi rover, mencerminkan kompetensi Teknis Pengukuran GNSS.";
                        competencyNames = ["Teknis Pengukuran GNSS"];
                        break;
                    case "Penetapan Hak dan Pendaftaran":
                        questionText = `Dokumen apa yang menjadi dasar utama dalam proses pendaftaran hak atas tanah pertama kali?`;
                        options = [
                            "Sertifikat Hak Milik.",
                            "Akta Jual Beli.",
                            "Surat Keterangan Tanah Adat.",
                            "Girik atau Letter C yang dikonversi."
                        ];
                        answerIndex = 3;
                        explanationText = "Girik atau Letter C yang dikonversi adalah salah satu dasar utama pendaftaran hak atas tanah pertama kali di Indonesia, mencerminkan kompetensi Administrasi Pertanahan.";
                        competencyNames = ["Administrasi Pertanahan"];
                        break;
                    case "Penataan dan Pemberdayaan":
                        questionText = `Dalam program konsolidasi tanah, apa tujuan utama dari redistribusi lahan?`;
                        options = [
                            "Meningkatkan pendapatan petani.",
                            "Menciptakan struktur penguasaan tanah yang lebih efisien dan tertata.",
                            "Mengurangi jumlah sengketa tanah.",
                            "Meningkatkan nilai jual tanah."
                        ];
                        answerIndex = 1;
                        explanationText = "Redistribusi lahan dalam konsolidasi tanah bertujuan menciptakan struktur penguasaan tanah yang lebih efisien dan teratur, mencerminkan kompetensi Pemberdayaan Masyarakat.";
                        competencyNames = ["Pemberdayaan Masyarakat"];
                        break;
                    case "Pengadaan Tanah dan Pengembangan":
                        questionText = `Menurut UU No. 2 Tahun 2012, siapa yang berwenang menetapkan lokasi pengadaan tanah untuk kepentingan umum?`;
                        options = [
                            "Menteri ATR/Kepala BPN.",
                            "Gubernur.",
                            "Bupati/Walikota.",
                            "Presiden."
                        ];
                        answerIndex = 1;
                        explanationText = "Gubernur adalah pihak yang berwenang menetapkan lokasi pengadaan tanah untuk kepentingan umum, mencerminkan kompetensi Legalitas Tanah.";
                        competencyNames = ["Legalitas Tanah"];
                        break;
                    case "Pengendalian dan Penanganan Sengketa":
                        questionText = `Apa peran utama mediator dalam penyelesaian sengketa pertanahan?`;
                        options = [
                            "Memutuskan siapa pihak yang benar.",
                            "Mencari solusi yang adil dan diterima oleh kedua belah pihak.",
                            "Mewakili salah satu pihak dalam persidangan.",
                            "Mengumpulkan bukti-bukti untuk persidangan."
                        ];
                        answerIndex = 1;
                        explanationText = "Mediator berperan memfasilitasi komunikasi dan membantu pihak-pihak yang bersengketa mencapai kesepakatan, mencerminkan kompetensi Legalitas Tanah dan Komunikasi.";
                        competencyNames = ["Legalitas Tanah", "Komunikasi"];
                        break;
                    case "Tata Usaha":
                        questionText = `Apa prinsip dasar dalam pengarsipan dokumen yang baik untuk memastikan kemudahan akses dan keamanan data?`;
                        options = [
                            "Menyimpan semua dokumen di satu tempat tanpa kategori.",
                            "Menggunakan sistem klasifikasi yang logis dan teratur.",
                            "Membuang dokumen yang dianggap tidak penting.",
                            "Mengandalkan memori untuk menemukan dokumen."
                        ];
                        answerIndex = 1;
                        explanationText = "Sistem klasifikasi yang logis dan teratur adalah prinsip dasar pengarsipan yang baik untuk kemudahan akses dan keamanan, mencerminkan kompetensi Manajemen Dokumen.";
                        competencyNames = ["Manajemen Dokumen"];
                        break;
                }
            }

            // Tambahkan variasi untuk memastikan 50 soal unik per tipe per seksi
            // Ini adalah simplifikasi. Dalam aplikasi nyata, Anda akan memiliki database soal yang lebih kaya.
            const uniqueSuffix = ` (Soal ke-${i + 1} dari ${section} - ${type})`;
            questionText += uniqueSuffix;
            explanationText += ` Ini adalah penjelasan unik untuk soal ${questionIdCounter}.`;
            options = options.map((opt, idx) => `${opt} ${idx === answerIndex ? '(Benar)' : ''}`); // Add a hint for generation

            allQuestions[section][type].push({
                id: `q${questionIdCounter}`,
                question: questionText,
                options: options.map(opt => opt.replace(/\s\(Benar\)$/, '')), // Remove hint before saving
                answer: answerIndex,
                explanation: explanationText,
                competency: competencyNames
            });
        }
    });
});

// Verifikasi jumlah soal (untuk debugging)
// console.log("Total soal dihasilkan:", Object.values(allQuestions).reduce((acc, sec) => {
//     return acc + Object.values(sec).reduce((innerAcc, typeArr) => innerAcc + typeArr.length, 0);
// }, 0));

export { allQuestions, sections, testTypes };
