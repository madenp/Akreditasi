// ========================================
// Tabel 3a Content - Beban Kerja Dosen
// ========================================
const Tabel3aContent = () => {
    const [dosenData, setDosenData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState({});
    const [modalData, setModalData] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Load JSON data
    useEffect(() => {
        fetch('Tabel_3a.json')
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    no: item["0"] || '',
                    nama: item["1"] || '',
                    mataKuliahAkuntansi: item["2"] || '',
                    mataKuliahPSLain: item["3"] || '',
                    mataKuliahLuarPT: item["4"] || '',
                    bimbinganTS2: parseInt(item["5"]) || 0,
                    bimbinganTS1: parseInt(item["6"]) || 0,
                    bimbinganTS: parseInt(item["7"]) || 0,
                    rataRata: parseFloat(item["8"]) || 0
                }));
                setDosenData(formattedData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                setLoading(false);
            });
    }, []);

    // Calculate statistics
    const stats = React.useMemo(() => {
        const totalDosen = dosenData.length;
        const dosenAktif = dosenData.filter(d => d.rataRata > 0).length;
        const totalBimbingan = dosenData.reduce((sum, d) => sum + d.rataRata, 0);
        const avgBimbingan = dosenAktif > 0 ? (totalBimbingan / dosenAktif).toFixed(1) : 0;

        // Bimbingan distribution
        const bimbinganDistribution = {
            'Rendah (< 8)': dosenData.filter(d => d.rataRata > 0 && d.rataRata < 8).length,
            'Normal (8-12)': dosenData.filter(d => d.rataRata >= 8 && d.rataRata <= 12).length,
            'Tinggi (13-16)': dosenData.filter(d => d.rataRata >= 13 && d.rataRata <= 16).length,
            'Sangat Tinggi (> 16)': dosenData.filter(d => d.rataRata > 16).length,
            'Tidak Aktif': dosenData.filter(d => d.rataRata === 0).length
        };

        // Total bimbingan per periode
        const totalTS2 = dosenData.reduce((sum, d) => sum + d.bimbinganTS2, 0);
        const totalTS1 = dosenData.reduce((sum, d) => sum + d.bimbinganTS1, 0);
        const totalTS = dosenData.reduce((sum, d) => sum + d.bimbinganTS, 0);

        return { totalDosen, dosenAktif, avgBimbingan, bimbinganDistribution, totalBimbingan, totalTS2, totalTS1, totalTS };
    }, [dosenData]);

    // Filter and Sort data
    const filteredData = React.useMemo(() => {
        let data = dosenData.filter(d => d.nama.toLowerCase().includes(searchTerm.toLowerCase()));

        if (sortConfig.key) {
            data.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return data;
    }, [dosenData, searchTerm, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <i className="fas fa-sort" style={{ color: '#ccc', marginLeft: '5px' }}></i>;
        if (sortConfig.direction === 'asc') return <i className="fas fa-sort-up" style={{ color: 'var(--primary)', marginLeft: '5px' }}></i>;
        return <i className="fas fa-sort-down" style={{ color: 'var(--primary)', marginLeft: '5px' }}></i>;
    };

    // Chart data - Bimbingan Distribution
    const bimbinganChartData = {
        labels: Object.keys(stats.bimbinganDistribution),
        datasets: [{
            data: Object.values(stats.bimbinganDistribution),
            backgroundColor: ['#ffc107', '#28a745', '#17a2b8', '#dc3545', '#6c757d'],
            borderWidth: 0
        }]
    };

    const bimbinganChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { padding: 10, usePointStyle: true, font: { size: 10 } } }
        }
    };

    // Bar chart - Top 10 dosen by Bimbingan
    const top10Dosen = [...dosenData].sort((a, b) => b.rataRata - a.rataRata).slice(0, 10);
    const barChartData = {
        labels: top10Dosen.map(d => d.nama.split(',')[0].substring(0, 20) + '...'),
        datasets: [{
            label: 'Rata-rata Bimbingan',
            data: top10Dosen.map(d => d.rataRata),
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderColor: '#667eea',
            borderWidth: 2,
            borderRadius: 6
        }]
    };

    const barChartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            y: { grid: { display: false } }
        }
    };

    // Line chart - Bimbingan per periode trend
    const lineChartData = {
        labels: ['TS-2', 'TS-1', 'TS'],
        datasets: [{
            label: 'Total Bimbingan',
            data: [stats.totalTS2, stats.totalTS1, stats.totalTS],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 8
        }]
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
        }
    };

    const getBimbinganColor = (value) => {
        if (value === 0) return 'secondary';
        if (value < 8) return 'warning';
        if (value <= 12) return 'success';
        if (value <= 16) return 'info';
        return 'danger';
    };

    // Open modal with full course list
    const openModal = (dosen) => {
        setModalData(dosen);
    };

    // Close modal
    const closeModal = () => {
        setModalData(null);
    };

    const formatMataKuliah = (mk, index, dosen) => {
        if (!mk) return '-';
        const courses = mk.split('\n').filter(c => c.trim());
        if (courses.length === 0) return '-';

        const displayCourses = courses.slice(0, 3);

        return (
            <div style={{ fontSize: '0.8rem' }}>
                {displayCourses.map((c, i) => (
                    <div key={i} style={{ marginBottom: '2px' }}>• {c.trim()}</div>
                ))}
                {courses.length > 3 && (
                    <span
                        className="status-badge info"
                        style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={() => openModal(dosen)}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'var(--info)';
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '';
                            e.target.style.color = '';
                        }}
                        title="Klik untuk melihat semua mata kuliah"
                    >
                        <i className="fas fa-plus-circle" style={{ marginRight: '4px' }}></i>
                        +{courses.length - 3} lainnya
                    </span>
                )}
            </div>
        );
    };

    // Modal Component
    const Modal = ({ dosen, onClose }) => {
        if (!dosen) return null;

        const courses = dosen.mataKuliahAkuntansi ? dosen.mataKuliahAkuntansi.split('\n').filter(c => c.trim()) : [];
        const coursesPSLain = dosen.mataKuliahPSLain ? dosen.mataKuliahPSLain.split('\n').filter(c => c.trim()) : [];

        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    animation: 'fadeIn 0.2s ease'
                }}
                onClick={onClose}
            >
                <div
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '0',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        animation: 'slideUp 0.3s ease'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        color: 'white',
                        padding: '20px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                                <i className="fas fa-book-open" style={{ marginRight: '10px' }}></i>
                                Daftar Mata Kuliah
                            </h3>
                            <p style={{ margin: '5px 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                                {dosen.nama}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div style={{ padding: '24px', maxHeight: '50vh', overflowY: 'auto' }}>
                        {/* Mata Kuliah PS */}
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{
                                margin: '0 0 12px',
                                fontSize: '0.9rem',
                                color: 'var(--dark)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span className="status-badge primary" style={{ padding: '4px 10px' }}>
                                    <i className="fas fa-graduation-cap" style={{ marginRight: '5px' }}></i>
                                    Mata Kuliah di Akuntansi
                                </span>
                                <span style={{ color: 'var(--secondary)', fontWeight: 400 }}>
                                    ({courses.length} mata kuliah)
                                </span>
                            </h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: '8px'
                            }}>
                                {courses.map((course, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '10px 14px',
                                            background: 'var(--light)',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        <span style={{
                                            background: 'var(--primary)',
                                            color: 'white',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            flexShrink: 0
                                        }}>
                                            {i + 1}
                                        </span>
                                        {course.trim()}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mata Kuliah di PS Lain */}
                        {coursesPSLain.length > 0 && (
                            <div>
                                <h4 style={{
                                    margin: '0 0 12px',
                                    fontSize: '0.9rem',
                                    color: 'var(--dark)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span className="status-badge success" style={{ padding: '4px 10px' }}>
                                        <i className="fas fa-external-link-alt" style={{ marginRight: '5px' }}></i>
                                        Mata Kuliah di PS Lain
                                    </span>
                                    <span style={{ color: 'var(--secondary)', fontWeight: 400 }}>
                                        ({coursesPSLain.length} mata kuliah)
                                    </span>
                                </h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                    gap: '8px'
                                }}>
                                    {coursesPSLain.map((course, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '10px 14px',
                                                background: 'rgba(17, 153, 142, 0.1)',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <span style={{
                                                background: 'var(--success)',
                                                color: 'white',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                flexShrink: 0
                                            }}>
                                                {i + 1}
                                            </span>
                                            {course.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div style={{
                        padding: '16px 24px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px'
                    }}>
                        <button
                            className="btn btn-outline"
                            onClick={onClose}
                            style={{ padding: '8px 20px' }}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="content">
            {/* Modal */}
            {modalData && <Modal dosen={modalData} onClose={closeModal} />}

            <div className="breadcrumb-wrapper">
                <h1 className="page-title">DKPS - Tabel 3a</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>DKPS</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Tabel 3a</span>
                </div>
            </div>

            <div className="alert info fade-in">
                <i className="fas fa-info-circle"></i>
                <span><strong>Tabel 3a:</strong> Beban Kerja Dosen - Bimbingan pada Jurusan Akuntansi. Data ini mencakup mata kuliah yang diampu dan jumlah bimbingan mahasiswa per periode.</span>
            </div>

            <div className="stat-cards">
                <StatCard title="Total Dosen" value={stats.totalDosen} icon="fas fa-users" color="primary" />
                <StatCard title="Dosen Aktif Bimbingan" value={stats.dosenAktif} icon="fas fa-chalkboard-teacher" color="success" />
                <StatCard title="Rata-rata Bimbingan/Dosen" value={stats.avgBimbingan} icon="fas fa-calculator" color="info" />
                <StatCard title="Total Bimbingan" value={Math.round(stats.totalBimbingan)} icon="fas fa-user-graduate" color="warning" />
            </div>

            {/* Charts Row */}
            <div className="row">
                <div className="col col-4">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-pie"></i> Distribusi Beban Bimbingan</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '280px' }}>
                                <ChartComponent type="doughnut" data={bimbinganChartData} options={bimbinganChartOptions} id="bimbinganDistChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-8">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-line"></i> Trend Bimbingan per Periode</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '280px' }}>
                                <ChartComponent type="line" data={lineChartData} options={lineChartOptions} id="bimbinganTrendChart" />
                            </div>
                            {/* Summary Cards */}
                            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                                <div style={{ flex: 1, padding: '15px', background: 'var(--light)', borderRadius: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{stats.totalTS2}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Total TS-2</div>
                                </div>
                                <div style={{ flex: 1, padding: '15px', background: 'var(--light)', borderRadius: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--info)' }}>{stats.totalTS1}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Total TS-1</div>
                                </div>
                                <div style={{ flex: 1, padding: '15px', background: 'var(--light)', borderRadius: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{stats.totalTS}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Total TS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top 10 Dosen */}
            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-trophy"></i> Top 10 Dosen dengan Beban Bimbingan Tertinggi</h3>
                </div>
                <div className="box-body">
                    <div className="chart-container" style={{ height: '350px' }}>
                        <ChartComponent type="bar" data={barChartData} options={barChartOptions} id="topDosenBimbinganChart" />
                    </div>
                </div>
            </div>

            {/* Progress Bars for Bimbingan Distribution */}
            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-tasks"></i> Ringkasan Distribusi Beban Bimbingan</h3>
                </div>
                <div className="box-body">
                    <div className="row">
                        {Object.entries(stats.bimbinganDistribution).map(([label, count], index) => (
                            <div className="col col-6" key={index}>
                                <ProgressBar
                                    label={`${label} (${count} dosen)`}
                                    progress={Math.round((count / stats.totalDosen) * 100)}
                                    status={['warning', 'success', 'info', 'danger', 'primary'][index % 5]}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Daftar Beban Kerja Dosen - Bimbingan Jurusan Akuntansi</h3>
                    <div className="box-tools">
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Cari nama dosen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '250px' }}
                            />
                        </div>
                    </div>
                </div>
                <div className="box-body">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px', cursor: 'pointer' }} onClick={() => requestSort('no')}>
                                        No {getSortIcon('no')}
                                    </th>
                                    <th style={{ width: '220px', cursor: 'pointer' }} onClick={() => requestSort('nama')}>
                                        Nama Dosen {getSortIcon('nama')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => requestSort('mataKuliahAkuntansi')}>
                                        Mata Kuliah di Akuntansi {getSortIcon('mataKuliahAkuntansi')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => requestSort('mataKuliahPSLain')}>
                                        Mata Kuliah PS Lain {getSortIcon('mataKuliahPSLain')}
                                    </th>
                                    <th style={{ width: '100px', textAlign: 'center', cursor: 'pointer' }} onClick={() => requestSort('bimbinganTS2')}>
                                        <div>TS-2</div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 400, textTransform: 'none' }}>Bimbingan {getSortIcon('bimbinganTS2')}</div>
                                    </th>
                                    <th style={{ width: '100px', textAlign: 'center', cursor: 'pointer' }} onClick={() => requestSort('bimbinganTS1')}>
                                        <div>TS-1</div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 400, textTransform: 'none' }}>Bimbingan {getSortIcon('bimbinganTS1')}</div>
                                    </th>
                                    <th style={{ width: '100px', textAlign: 'center', cursor: 'pointer' }} onClick={() => requestSort('bimbinganTS')}>
                                        <div>TS</div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 400, textTransform: 'none' }}>Bimbingan {getSortIcon('bimbinganTS')}</div>
                                    </th>
                                    <th style={{ width: '120px', textAlign: 'center', cursor: 'pointer' }} onClick={() => requestSort('rataRata')}>
                                        Rata-rata {getSortIcon('rataRata')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((dosen, index) => (
                                    <tr key={index}>
                                        <td><strong>{dosen.no}</strong></td>
                                        <td style={{ fontSize: '0.85rem' }}>{dosen.nama}</td>
                                        <td>{formatMataKuliah(dosen.mataKuliahAkuntansi, index, dosen)}</td>
                                        <td>{formatMataKuliah(dosen.mataKuliahPSLain, index, dosen)}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                minWidth: '40px',
                                                padding: '4px 8px',
                                                background: dosen.bimbinganTS2 > 0 ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                                                borderRadius: '6px',
                                                fontWeight: dosen.bimbinganTS2 > 0 ? 600 : 400
                                            }}>
                                                {dosen.bimbinganTS2 || '-'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                minWidth: '40px',
                                                padding: '4px 8px',
                                                background: dosen.bimbinganTS1 > 0 ? 'rgba(0, 192, 239, 0.1)' : 'transparent',
                                                borderRadius: '6px',
                                                fontWeight: dosen.bimbinganTS1 > 0 ? 600 : 400
                                            }}>
                                                {dosen.bimbinganTS1 || '-'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                minWidth: '40px',
                                                padding: '4px 8px',
                                                background: dosen.bimbinganTS > 0 ? 'rgba(0, 166, 90, 0.1)' : 'transparent',
                                                borderRadius: '6px',
                                                fontWeight: dosen.bimbinganTS > 0 ? 600 : 400
                                            }}>
                                                {dosen.bimbinganTS || '-'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`status-badge ${getBimbinganColor(dosen.rataRata)}`}>
                                                {dosen.rataRata || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="box-footer">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                            Menampilkan {filteredData.length} dari {stats.totalDosen} data
                        </span>
                        <button className="btn btn-primary">
                            <i className="fas fa-download"></i> Export Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
