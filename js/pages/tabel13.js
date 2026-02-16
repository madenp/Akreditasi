// ========================================
// Tabel 13 Content - Waktu Tunggu Lulusan Mendapat Pekerjaan
// ========================================
const Tabel13Content = () => {
    const [waktuTungguData, setWaktuTungguData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // TS (Tahun Sekarang) = 2025
    const TS = 2025;

    // Function to get actual year from TS label
    const getYearFromTS = (tsLabel) => {
        if (!tsLabel) return '';
        const match = tsLabel.match(/TS-(\d+)/);
        if (match) {
            return TS - parseInt(match[1]);
        }
        if (tsLabel === 'TS') return TS;
        return tsLabel;
    };

    // Load JSON data
    useEffect(() => {
        fetch('Tabel_13.json')
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    tahunLulus: item["1"] || '',
                    tahunActual: getYearFromTS(item["1"]),
                    jumlahLulusan: item["2"] || 0,
                    jumlahTerlacak: item["3"] || 0,
                    wtKurang6: item["4"] || 0,      // WT < 6 bulan
                    wt6sampai18: item["5"] || 0,    // 6 ≤ WT ≤ 18 bulan
                    wtLebih18: item["6"] || 0       // WT > 18 bulan
                }));
                setWaktuTungguData(formattedData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                setLoading(false);
            });
    }, []);

    // Calculate statistics
    const stats = React.useMemo(() => {
        const totalLulusan = waktuTungguData.reduce((sum, d) => sum + (d.jumlahLulusan || 0), 0);
        const totalTerlacak = waktuTungguData.reduce((sum, d) => sum + (d.jumlahTerlacak || 0), 0);
        const totalWTKurang6 = waktuTungguData.reduce((sum, d) => sum + (d.wtKurang6 || 0), 0);
        const totalWT6sampai18 = waktuTungguData.reduce((sum, d) => sum + (d.wt6sampai18 || 0), 0);
        const totalWTLebih18 = waktuTungguData.reduce((sum, d) => sum + (d.wtLebih18 || 0), 0);

        // Track rate
        const trackRate = totalLulusan > 0 ? ((totalTerlacak / totalLulusan) * 100).toFixed(1) : 0;

        // Fast employment rate (WT < 6 bulan)
        const fastEmploymentRate = totalTerlacak > 0 ? ((totalWTKurang6 / totalTerlacak) * 100).toFixed(1) : 0;

        return {
            totalLulusan,
            totalTerlacak,
            totalWTKurang6,
            totalWT6sampai18,
            totalWTLebih18,
            trackRate,
            fastEmploymentRate,
            periodCount: waktuTungguData.length
        };
    }, [waktuTungguData]);

    // Sort data
    const sortedData = React.useMemo(() => {
        let data = [...waktuTungguData];
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
    }, [waktuTungguData, sortConfig]);

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

    // Chart data - Waktu Tunggu Distribution (Stacked Bar)
    const waktuTungguChartData = {
        labels: waktuTungguData.map(d => `${d.tahunLulus} (${d.tahunActual})`),
        datasets: [
            {
                label: 'WT < 6 bulan',
                data: waktuTungguData.map(d => d.wtKurang6),
                backgroundColor: '#1cc88a',
                borderRadius: 4
            },
            {
                label: '6 ≤ WT ≤ 18 bulan',
                data: waktuTungguData.map(d => d.wt6sampai18),
                backgroundColor: '#f6c23e',
                borderRadius: 4
            },
            {
                label: 'WT > 18 bulan',
                data: waktuTungguData.map(d => d.wtLebih18),
                backgroundColor: '#e74a3b',
                borderRadius: 4
            }
        ]
    };

    const waktuTungguChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { usePointStyle: true, padding: 15 }
            }
        },
        scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, beginAtZero: true, grid: { display: false } }
        }
    };

    // Chart data - Lulusan vs Terlacak (Bar Chart)
    const comparisonChartData = {
        labels: waktuTungguData.map(d => `${d.tahunLulus} (${d.tahunActual})`),
        datasets: [
            {
                label: 'Jumlah Lulusan',
                data: waktuTungguData.map(d => d.jumlahLulusan),
                backgroundColor: '#4e73df',
                borderRadius: 8
            },
            {
                label: 'Jumlah Terlacak',
                data: waktuTungguData.map(d => d.jumlahTerlacak),
                backgroundColor: '#1cc88a',
                borderRadius: 8
            }
        ]
    };

    const comparisonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { usePointStyle: true, padding: 15 }
            }
        },
        scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    // Chart data - Overall Waktu Tunggu Distribution (Doughnut)
    const overallWTChartData = {
        labels: ['WT < 6 bulan', '6 ≤ WT ≤ 18 bulan', 'WT > 18 bulan'],
        datasets: [{
            data: [stats.totalWTKurang6, stats.totalWT6sampai18, stats.totalWTLebih18],
            backgroundColor: ['#1cc88a', '#f6c23e', '#e74a3b'],
            borderWidth: 0
        }]
    };

    const overallWTChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: { usePointStyle: true, padding: 10 }
            }
        }
    };

    // Chart data - Track Rate per Period (Bar)
    const trackRateChartData = {
        labels: waktuTungguData.map(d => `${d.tahunLulus} (${d.tahunActual})`),
        datasets: [{
            label: 'Track Rate (%)',
            data: waktuTungguData.map(d => d.jumlahLulusan > 0 ? ((d.jumlahTerlacak / d.jumlahLulusan) * 100).toFixed(1) : 0),
            backgroundColor: waktuTungguData.map(d => {
                const rate = d.jumlahLulusan > 0 ? (d.jumlahTerlacak / d.jumlahLulusan) * 100 : 0;
                return rate >= 50 ? '#1cc88a' : rate >= 30 ? '#f6c23e' : '#e74a3b';
            }),
            borderRadius: 8
        }]
    };

    const trackRateChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { display: false },
                ticks: { callback: (value) => value + '%' }
            },
            x: { grid: { display: false } }
        }
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
            <div className="breadcrumb-wrapper">
                <h1 className="page-title">DKPS - Tabel 13</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>DKPS</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Tabel 13</span>
                </div>
            </div>

            <div className="alert info fade-in">
                <i className="fas fa-info-circle"></i>
                <span><strong>Tabel 13:</strong> Waktu Tunggu Lulusan Mendapatkan Pekerjaan - Data distribusi waktu tunggu lulusan berdasarkan kategori waktu. TS = {TS}.</span>
            </div>

            <div className="stat-cards">
                <StatCard title="Total Lulusan" value={stats.totalLulusan} icon="fas fa-user-graduate" color="primary" />
                <StatCard title="Lulusan Terlacak" value={stats.totalTerlacak} icon="fas fa-search" color="success" />
                <StatCard title="Track Rate" value={`${stats.trackRate}%`} icon="fas fa-chart-pie" color="info" />
                <StatCard title="WT < 6 Bulan" value={`${stats.fastEmploymentRate}%`} icon="fas fa-bolt" color="warning" />
            </div>

            <div className="row">
                <div className="col col-8">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-bar"></i> Distribusi Waktu Tunggu per Periode</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '280px' }}>
                                <ChartComponent type="bar" data={waktuTungguChartData} options={waktuTungguChartOptions} id="tabel13WaktuTungguChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-4">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-pie"></i> Distribusi Overall</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '250px', position: 'relative' }}>
                                <ChartComponent type="doughnut" data={overallWTChartData} options={overallWTChartOptions} id="tabel13OverallChart" />
                                <div style={{
                                    position: 'absolute',
                                    top: '38%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--dark)' }}>{stats.totalTerlacak}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Terlacak</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col col-6">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-bar"></i> Perbandingan Lulusan vs Terlacak</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '250px' }}>
                                <ChartComponent type="bar" data={comparisonChartData} options={comparisonChartOptions} id="tabel13ComparisonChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-6">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-percentage"></i> Track Rate per Periode</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '250px' }}>
                                <ChartComponent type="bar" data={trackRateChartData} options={trackRateChartOptions} id="tabel13TrackRateChart" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Data Waktu Tunggu Lulusan</h3>
                </div>
                <div className="box-body">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('tahunLulus')}>
                                        Tahun Lulus {getSortIcon('tahunLulus')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('jumlahLulusan')}>
                                        Jumlah Lulusan {getSortIcon('jumlahLulusan')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('jumlahTerlacak')}>
                                        Jumlah Terlacak {getSortIcon('jumlahTerlacak')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(28,200,138,0.1)' }} onClick={() => requestSort('wtKurang6')}>
                                        WT &lt; 6 bulan {getSortIcon('wtKurang6')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(246,194,62,0.1)' }} onClick={() => requestSort('wt6sampai18')}>
                                        6 ≤ WT ≤ 18 bulan {getSortIcon('wt6sampai18')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(231,74,59,0.1)' }} onClick={() => requestSort('wtLebih18')}>
                                        WT &gt; 18 bulan {getSortIcon('wtLebih18')}
                                    </th>
                                    <th style={{ textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        Track Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((item, index) => {
                                    const trackRate = item.jumlahLulusan > 0
                                        ? ((item.jumlahTerlacak / item.jumlahLulusan) * 100).toFixed(1)
                                        : 0;
                                    const totalWT = item.wtKurang6 + item.wt6sampai18 + item.wtLebih18;
                                    const wtKurang6Pct = totalWT > 0 ? ((item.wtKurang6 / totalWT) * 100).toFixed(0) : 0;
                                    const wt6to18Pct = totalWT > 0 ? ((item.wt6sampai18 / totalWT) * 100).toFixed(0) : 0;
                                    const wtLebih18Pct = totalWT > 0 ? ((item.wtLebih18 / totalWT) * 100).toFixed(0) : 0;

                                    return (
                                        <tr key={index}>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <strong style={{
                                                        background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)',
                                                        color: 'white',
                                                        padding: '6px 14px',
                                                        borderRadius: '20px',
                                                        display: 'inline-block'
                                                    }}>
                                                        {item.tahunLulus}
                                                    </strong>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>({item.tahunActual})</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: '600', fontSize: '1.1rem' }}>
                                                {item.jumlahLulusan}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{item.jumlahTerlacak}</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', background: 'rgba(28,200,138,0.05)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span className="status-badge success" style={{ minWidth: '50px' }}>
                                                        {item.wtKurang6}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#1cc88a' }}>{wtKurang6Pct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', background: 'rgba(246,194,62,0.05)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span className="status-badge warning" style={{ minWidth: '50px' }}>
                                                        {item.wt6sampai18}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#f6c23e' }}>{wt6to18Pct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', background: 'rgba(231,74,59,0.05)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span className="status-badge danger" style={{ minWidth: '50px' }}>
                                                        {item.wtLebih18}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#e74a3b' }}>{wtLebih18Pct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    background: trackRate >= 50 ? 'linear-gradient(135deg, #1cc88a 0%, #13855c 100%)' :
                                                        trackRate >= 30 ? 'linear-gradient(135deg, #f6c23e 0%, #dda20a 100%)' :
                                                            'linear-gradient(135deg, #e74a3b 0%, #be2617 100%)',
                                                    color: 'white',
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontWeight: '600',
                                                    display: 'inline-block',
                                                    minWidth: '65px'
                                                }}>
                                                    {trackRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="box-footer">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                            Menampilkan {sortedData.length} periode data | TS (Tahun Sekarang) = {TS}
                        </span>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
                            <span><span className="status-badge success" style={{ padding: '3px 8px' }}>&lt;6 bln</span> Cepat</span>
                            <span><span className="status-badge warning" style={{ padding: '3px 8px' }}>6-18 bln</span> Sedang</span>
                            <span><span className="status-badge danger" style={{ padding: '3px 8px' }}>&gt;18 bln</span> Lama</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
