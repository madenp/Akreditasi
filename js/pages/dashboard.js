// ========================================
// Dashboard Content Page - Updated with Real Data
// ========================================
const DashboardContent = () => {
    const [tabelData, setTabelData] = useState({
        tabel13: null,
        tabel15: null,
        tabel16: null,
        tabel17: null
    });

    useEffect(() => {
        // Load data from JSON files
        Promise.all([
            fetch('Tabel_13.json').then(res => res.json()),
            fetch('Tabel_15.json').then(res => res.json()),
            fetch('Tabel_16.json').then(res => res.json()),
            fetch('Tabel_17.json').then(res => res.json())
        ]).then(([data13, data15, data16, data17]) => {
            setTabelData({
                tabel13: data13,
                tabel15: data15,
                tabel16: data16,
                tabel17: data17
            });
        }).catch(err => console.error('Error loading data:', err));
    }, []);

    // Calculate statistics from Tabel 13 (Masa Tunggu Lulusan)
    const getTabel13Stats = () => {
        if (!tabelData.tabel13) return { total: 0, tracked: 0, fastEmployment: 0, trackRate: 0 };

        const total = tabelData.tabel13.reduce((sum, row) => sum + parseInt(row['2'] || 0), 0);
        const tracked = tabelData.tabel13.reduce((sum, row) => sum + parseInt(row['3'] || 0), 0);
        const fastEmployment = tabelData.tabel13.reduce((sum, row) => sum + parseInt(row['4'] || 0), 0);
        const trackRate = tracked > 0 ? ((tracked / total) * 100).toFixed(1) : 0;

        return { total, tracked, fastEmployment, trackRate };
    };

    // Calculate statistics from Tabel 16 (Kesesuaian Bidang Kerja)
    const getTabel16Stats = () => {
        if (!tabelData.tabel16) return { total: 0, sesuai: 0, percentage: 0 };

        // Find "Jumlah" row or calculate total
        const jumlahRow = tabelData.tabel16.find(row => row['1'] === 'Jumlah');
        if (jumlahRow) {
            const total = parseInt(jumlahRow['3'] || 0);
            const sesuai = parseInt(jumlahRow['4'] || 0);
            const percentage = total > 0 ? ((sesuai / total) * 100).toFixed(1) : 0;
            return { total, sesuai, percentage };
        }
        return { total: 0, sesuai: 0, percentage: 0 };
    };

    // Calculate average satisfaction from Tabel 17
    const getTabel17Stats = () => {
        if (!tabelData.tabel17) return { avgScore: 0, excellent: 0 };

        let totalScore = 0;
        let count = 0;
        let excellentCount = 0;

        tabelData.tabel17.forEach(row => {
            const sangat = parseInt(row['2'] || 0);
            const baik = parseInt(row['3'] || 0);
            const cukup = parseInt(row['4'] || 0);
            const kurang = parseInt(row['5'] || 0);

            const total = sangat + baik + cukup + kurang;
            if (total > 0) {
                const score = (sangat * 4 + baik * 3 + cukup * 2 + kurang * 1) / total;
                totalScore += score;
                count++;

                if (score >= 3.5) excellentCount++;
            }
        });

        const avgScore = count > 0 ? (totalScore / count).toFixed(2) : 0;
        return { avgScore, excellent: excellentCount };
    };

    const stats13 = getTabel13Stats();
    const stats16 = getTabel16Stats();
    const stats17 = getTabel17Stats();

    // Chart data for Tabel 13 - Masa Tunggu
    const masaTungguChartData = tabelData.tabel13 ? {
        labels: tabelData.tabel13.map(row => row['1']),
        datasets: [
            {
                label: '< 6 bulan',
                data: tabelData.tabel13.map(row => parseInt(row['4'] || 0)),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
            },
            {
                label: '6-18 bulan',
                data: tabelData.tabel13.map(row => parseInt(row['5'] || 0)),
                backgroundColor: 'rgba(243, 156, 18, 0.8)',
            },
            {
                label: '> 18 bulan',
                data: tabelData.tabel13.map(row => parseInt(row['6'] || 0)),
                backgroundColor: 'rgba(221, 75, 57, 0.8)',
            }
        ]
    } : null;

    // Chart data for Tabel 17 - Kepuasan Pengguna
    const kepuasanChartData = tabelData.tabel17 ? {
        labels: tabelData.tabel17.map(row => {
            const label = row['1'];
            return label.length > 20 ? label.substring(0, 20) + '...' : label;
        }),
        datasets: [{
            label: 'Skor Kepuasan',
            data: tabelData.tabel17.map(row => {
                const sangat = parseInt(row['2'] || 0);
                const baik = parseInt(row['3'] || 0);
                const cukup = parseInt(row['4'] || 0);
                const kurang = parseInt(row['5'] || 0);
                const total = sangat + baik + cukup + kurang;
                return total > 0 ? ((sangat * 4 + baik * 3 + cukup * 2 + kurang * 1) / total).toFixed(2) : 0;
            }),
            backgroundColor: tabelData.tabel17.map(row => {
                const sangat = parseInt(row['2'] || 0);
                const baik = parseInt(row['3'] || 0);
                const cukup = parseInt(row['4'] || 0);
                const kurang = parseInt(row['5'] || 0);
                const total = sangat + baik + cukup + kurang;
                const score = total > 0 ? (sangat * 4 + baik * 3 + cukup * 2 + kurang * 1) / total : 0;

                if (score >= 3.5) return 'rgba(17, 153, 142, 0.8)';
                if (score >= 3.0) return 'rgba(102, 126, 234, 0.8)';
                if (score >= 2.5) return 'rgba(243, 156, 18, 0.8)';
                return 'rgba(221, 75, 57, 0.8)';
            }),
            borderWidth: 0
        }]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'bottom' }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
        }
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 4.0,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: {
                    stepSize: 0.5
                }
            },
            x: { grid: { display: false } }
        }
    };

    // Available tables list
    const availableTables = [
        { id: 'tabel-1', name: 'Tabel 1', desc: 'Kerjasama Pendidikan', icon: 'fa-handshake' },
        { id: 'tabel-2', name: 'Tabel 2', desc: 'Kerjasama Penelitian', icon: 'fa-flask' },
        { id: 'tabel-3a', name: 'Tabel 3a', desc: 'Kerjasama Pengabdian', icon: 'fa-hands-helping' },
        { id: 'tabel-4', name: 'Tabel 4', desc: 'Penelitian DTPS', icon: 'fa-search' },
        { id: 'tabel-5', name: 'Tabel 5', desc: 'PkM DTPS', icon: 'fa-users' },
        { id: 'tabel-7', name: 'Tabel 7', desc: 'Penelitian Mahasiswa', icon: 'fa-graduation-cap' },
        { id: 'tabel-9', name: 'Tabel 9', desc: 'Luaran Penelitian', icon: 'fa-book' },
        { id: 'tabel-13', name: 'Tabel 13', desc: 'Masa Tunggu Lulusan', icon: 'fa-clock' },
        { id: 'tabel-15', name: 'Tabel 15', desc: 'Kepuasan Lulusan', icon: 'fa-smile' },
        { id: 'tabel-16', name: 'Tabel 16', desc: 'Kesesuaian Bidang Kerja', icon: 'fa-briefcase' },
        { id: 'tabel-17', name: 'Tabel 17', desc: 'Kepuasan Pengguna', icon: 'fa-star' }
    ];

    return (
        <div className="content">
            {/* Breadcrumb */}
            <div className="breadcrumb-wrapper">
                <h1 className="page-title">Dashboard DKPS</h1>
                <div className="breadcrumb">
                    <a href="#dashboard">Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Dashboard</span>
                </div>
            </div>

            {/* Alert */}
            <div className="alert info fade-in">
                <i className="fas fa-info-circle"></i>
                <span>Selamat datang di Dashboard DKPS! Ringkasan data dari <strong>{availableTables.length} tabel</strong> tersedia untuk Anda.</span>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards">
                <StatCard
                    title="Total Lulusan"
                    value={stats13.total}
                    icon="fas fa-user-graduate"
                    color="primary"
                    trend="up"
                    trendValue={`${stats13.trackRate}% terlacak`}
                />
                <StatCard
                    title="Cepat Terserap (< 6 bln)"
                    value={stats13.fastEmployment}
                    icon="fas fa-rocket"
                    color="success"
                    trend="up"
                    trendValue={`${((stats13.fastEmployment / stats13.tracked) * 100).toFixed(1)}% dari terlacak`}
                />
                <StatCard
                    title="Kesesuaian Bidang"
                    value={`${stats16.percentage}%`}
                    icon="fas fa-bullseye"
                    color="info"
                    trend="up"
                    trendValue={`${stats16.sesuai} dari ${stats16.total} lulusan`}
                />
                <StatCard
                    title="Skor Kepuasan Pengguna"
                    value={stats17.avgScore}
                    icon="fas fa-star"
                    color="warning"
                    trendValue={`${stats17.excellent} kompetensi sangat baik`}
                />
            </div>

            {/* Charts Row */}
            <div className="row">
                <div className="col col-6">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-clock"></i> Masa Tunggu Lulusan per Periode</h3>
                            <div className="box-tools">
                                <button className="box-tool-btn secondary" onClick={() => window.location.hash = 'tabel-13'}>
                                    <i className="fas fa-external-link-alt"></i> Detail
                                </button>
                            </div>
                        </div>
                        <div className="box-body">
                            <div className="chart-container">
                                {masaTungguChartData && (
                                    <ChartComponent type="bar" data={masaTungguChartData} options={chartOptions} id="masaTungguChart" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-6">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-star"></i> Skor Kepuasan Pengguna per Kompetensi</h3>
                            <div className="box-tools">
                                <button className="box-tool-btn secondary" onClick={() => window.location.hash = 'tabel-17'}>
                                    <i className="fas fa-external-link-alt"></i> Detail
                                </button>
                            </div>
                        </div>
                        <div className="box-body">
                            <div className="chart-container">
                                {kepuasanChartData && (
                                    <ChartComponent type="bar" data={kepuasanChartData} options={barChartOptions} id="kepuasanChart" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Available Tables Grid */}
            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Tabel DKPS Tersedia</h3>
                    <div className="box-tools">
                        <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                            {availableTables.length} tabel data
                        </span>
                    </div>
                </div>
                <div className="box-body">
                    <div className="dkps-table-grid">
                        {availableTables.map((table, index) => (
                            <div
                                key={index}
                                className="dkps-table-card"
                                onClick={() => window.location.hash = table.id}
                            >
                                <div className="dkps-card-icon">
                                    <i className={`fas ${table.icon}`}></i>
                                </div>
                                <div className="dkps-card-content">
                                    <h4>{table.name}</h4>
                                    <p>{table.desc}</p>
                                </div>
                                <div className="dkps-card-arrow">
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="row">
                <div className="col col-4">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-pie"></i> Status Lulusan</h3>
                        </div>
                        <div className="box-body">
                            {tabelData.tabel13 && (
                                <div style={{ padding: '20px 0' }}>
                                    {tabelData.tabel13.map((row, idx) => (
                                        <div key={idx} className="progress-wrapper">
                                            <div className="progress-label">
                                                <span>{row['1']}</span>
                                                <span>{((parseInt(row['3']) / parseInt(row['2'])) * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill success"
                                                    style={{ width: `${((parseInt(row['3']) / parseInt(row['2'])) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col col-8">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-info-circle"></i> Informasi Dashboard</h3>
                        </div>
                        <div className="box-body">
                            <div className="info-list">
                                <div className="info-item">
                                    <div className="info-icon primary">
                                        <i className="fas fa-database"></i>
                                    </div>
                                    <div className="info-content">
                                        <h4>Data Terintegrasi</h4>
                                        <p>Dashboard ini menampilkan data real-time dari {availableTables.length} tabel DKPS yang tersedia di sistem.</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon success">
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                    <div className="info-content">
                                        <h4>Analisis Otomatis</h4>
                                        <p>Statistik dan visualisasi dihasilkan secara otomatis berdasarkan data yang diinput.</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon warning">
                                        <i className="fas fa-mouse-pointer"></i>
                                    </div>
                                    <div className="info-content">
                                        <h4>Akses Cepat</h4>
                                        <p>Klik pada card tabel di atas untuk melihat detail dan visualisasi lengkap dari setiap tabel.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
