// ========================================
// Data Dummy untuk Dashboard
// ========================================
const dashboardData = {
    stats: {
        totalBeritaAcara: 156,
        beritaAcaraBaru: 24,
        dalamProses: 18,
        selesai: 114
    },
    akreditasiProgress: [
        { label: 'Orientasi Strategis', progress: 95, status: 'success' },
        { label: 'Standar 2 - Tata Kelola', progress: 88, status: 'success' },
        { label: 'Standar 3 - Mahasiswa', progress: 75, status: 'info' },
        { label: 'Standar 4 - SDM', progress: 82, status: 'success' },
        { label: 'Standar 5 - Keuangan', progress: 60, status: 'warning' },
        { label: 'Standar 6 - Pendidikan', progress: 70, status: 'info' },
        { label: 'Standar 7 - Penelitian', progress: 45, status: 'danger' },
        { label: 'Standar 8 - PkM', progress: 55, status: 'warning' },
        { label: 'Standar 9 - Luaran', progress: 65, status: 'warning' }
    ],
    recentActivities: [
        { time: '2 menit lalu', title: 'Berita Acara Rapat Senat', desc: 'Dokumen telah disetujui oleh Dekan', status: 'success' },
        { time: '1 jam lalu', title: 'Upload Bukti Standar 3', desc: 'File tracer study telah diunggah', status: 'primary' },
        { time: '3 jam lalu', title: 'Review Standar 7', desc: 'Perlu revisi pada bagian publikasi', status: 'warning' },
        { time: 'Kemarin', title: 'Verifikasi Data SDM', desc: 'Data dosen telah diverifikasi', status: 'success' },
        { time: '2 hari lalu', title: 'Rapat Tim Akreditasi', desc: 'Pembahasan persiapan visitasi', status: 'primary' }
    ],
    beritaAcaraList: [
        { id: 'BA-2026-001', judul: 'Rapat Senat Fakultas', tanggal: '05 Feb 2026', status: 'Selesai', kategori: 'Rapat' },
        { id: 'BA-2026-002', judul: 'Sosialisasi Akreditasi', tanggal: '04 Feb 2026', status: 'Proses', kategori: 'Sosialisasi' },
        { id: 'BA-2026-003', judul: 'Workshop Penyusunan LED', tanggal: '03 Feb 2026', status: 'Selesai', kategori: 'Workshop' },
        { id: 'BA-2026-004', judul: 'Rapat Tim Penyusun LKPS', tanggal: '02 Feb 2026', status: 'Pending', kategori: 'Rapat' },
        { id: 'BA-2026-005', judul: 'FGD Tracer Study', tanggal: '01 Feb 2026', status: 'Selesai', kategori: 'FGD' },
        { id: 'BA-2026-006', judul: 'Monitoring Penelitian', tanggal: '31 Jan 2026', status: 'Proses', kategori: 'Monitoring' }
    ],
    chartData: {
        monthly: [12, 19, 15, 25, 22, 18, 30, 28, 24, 20, 26, 32],
        categories: ['Rapat', 'Workshop', 'FGD', 'Sosialisasi', 'Monitoring', 'Lainnya'],
        categoryValues: [45, 28, 18, 32, 20, 13]
    }
};

// Menu Items Configuration
const menuItems = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { id: 'berita-acara', icon: 'fas fa-file-alt', label: 'Berita Acara' },
    {
        id: 'akreditasi',
        icon: 'fas fa-award',
        label: 'Akreditasi',
        submenu: [
            { id: 'led', label: 'LED' },
            { id: 'lkps', label: 'LKPS' },
            { id: 'dokumen', label: 'Dokumen Pendukung' }
        ]
    },
    {
        id: 'sitasi',
        icon: 'fas fa-quote-right',
        label: 'Sitasi',
        submenu: [
            { id: 'sitasi-hasbudin', label: 'Hasbudin' },
            { id: 'sitasi-arifuddin', label: 'Arifuddin' },
            { id: 'sitasi-ishak', label: 'Ishak Awaluddin' },
            { id: 'sitasi-laode', label: 'La Ode Anto' },
            { id: 'sitasi-nasrullah', label: 'Nasrullah Dali' },
            { id: 'sitasi-husin', label: 'Husin' },
            { id: 'sitasi-mulyati', label: 'Mulyati Akib' },
            { id: 'sitasi-muntu', label: 'Muntu Abdullah' },
            { id: 'sitasi-emillia', label: 'Emillia Nurdin' },
            { id: 'sitasi-erwin', label: 'Erwin Hadisantoso' },
            { id: 'sitasi-nitri', label: 'Nitri Mirosea' },
            { id: 'sitasi-tuti', label: 'Tuti Dharmawati' },
            { id: 'sitasi-sulvariany', label: 'Sulvariany' },
            { id: 'sitasi-nurasni', label: 'Nur Asni' },
            { id: 'sitasi-aswati', label: 'Wa Ode Aswati' },
            { id: 'sitasi-ika', label: 'Ika Maya Sari' },
            { id: 'sitasi-safaruddin', label: 'Safaruddin' },
            { id: 'sitasi-santiadji', label: 'Santiadji Mustafa' },
            { id: 'sitasi-yuli', label: 'Yuli Lestari' },
            { id: 'sitasi-andi-muh-fuad', label: 'Andi Muh Fuad' },
            { id: 'sitasi-made', label: 'Si Made Ngurah P' },
            { id: 'sitasi-syaiah', label: 'Syaiah' },
            { id: 'sitasi-hasnidar', label: 'Hasnidar' }
        ]
    },
    {
        id: 'dkps',
        icon: 'fas fa-table',
        label: 'DKPS',
        submenu: [
            { id: 'tabel-1', label: 'Tabel 1' },
            { id: 'tabel-2', label: 'Tabel 2' },
            { id: 'tabel-3a', label: 'Tabel 3a' },
            { id: 'tabel-4', label: 'Tabel 4' },
            { id: 'tabel-5', label: 'Tabel 5' },
            { id: 'tabel-7', label: 'Tabel 7' },
            { id: 'tabel-9', label: 'Tabel 9' },
            { id: 'tabel-13', label: 'Tabel 13' },
            { id: 'tabel-15', label: 'Tabel 15' },
            { id: 'tabel-16', label: 'Tabel 16' },
            { id: 'tabel-17', label: 'Tabel 17' },
            { id: 'tabel-23a', label: 'Tabel 23a' },
            { id: 'tabel-23b', label: 'Tabel 23b' }
        ]
    },
    {
        id: 'standar',
        icon: 'fas fa-tasks',
        label: 'Standar',
        submenu: [
            { id: 'orientasi-strategis', label: 'Orientasi Strategis' },
            { id: 'standar-2', label: 'Standar 2 - Tata Kelola' },
            { id: 'standar-3', label: 'Standar 3 - Mahasiswa' },
            { id: 'standar-4', label: 'Standar 4 - SDM' },
            { id: 'standar-5', label: 'Standar 5 - Keuangan' },
            { id: 'standar-6', label: 'Standar 6 - Pendidikan' },
            { id: 'standar-7', label: 'Standar 7 - Penelitian' },
            { id: 'standar-8', label: 'Standar 8 - PkM' },
            { id: 'standar-9', label: 'Standar 9 - Luaran' }
        ]
    },
    { id: 'report', icon: 'fas fa-chart-bar', label: 'Laporan' },
    { id: 'calendar', icon: 'fas fa-calendar-alt', label: 'Kalender' },
    { id: 'users', icon: 'fas fa-users', label: 'Tim Akreditasi' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Pengaturan' }
];

// CSV Parser Utility
const parseCSV = (text) => {
    const lines = text.split('\n');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const regex = /(?:,|^)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
            const values = [];
            let match;
            while ((match = regex.exec(',' + line)) !== null) {
                values.push(match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2]);
            }
            if (values.length >= 1) {
                data.push(values);
            }
        }
    }
    return data;
};
