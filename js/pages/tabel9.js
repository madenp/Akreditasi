// ========================================
// Tabel 9 Content - Masa Studi Lulusan
// ========================================
const Tabel9Content = () => {
    const [lulusanData, setLulusanData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // TS (Tahun Sekarang) = 2025
    const TS = 2025;

    // Load JSON data
    useEffect(() => {
        fetch('Tabel_9.json')
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    tahunMasuk: item["1"] || '',
                    jumlahDiterima: item["2"] || 0,
                    lulusTS3: item["6"] || null,      // TS-3 (2022)
                    lulusTS2: item["7"] || null,      // TS-2 (2023)
                    lulusTS1: item["8"] || null,      // TS-1 (2024)
                    lulusTS: item["9"] || 0,          // TS (2025)
                    jumlahLulusan: item["10"] || 0,   // Jumlah lulusan s/d akhir TS
                    rataRataMasaStudi: item["11"] ? parseFloat(item["11"].replace(',', '.')) : 0
                }));
                setLulusanData(formattedData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                setLoading(false);
            });
    }, []);

    // Calculate statistics
    const stats = React.useMemo(() => {
        const totalDiterima = lulusanData.reduce((sum, d) => sum + (d.jumlahDiterima || 0), 0);
        const totalLulusan = lulusanData.reduce((sum, d) => sum + (d.jumlahLulusan || 0), 0);
        const avgMasaStudi = lulusanData.length > 0
            ? (lulusanData.reduce((sum, d) => sum + d.rataRataMasaStudi, 0) / lulusanData.length).toFixed(2)
            : 0;

        // Graduation rate overall
        const graduationRate = totalDiterima > 0 ? ((totalLulusan / totalDiterima) * 100).toFixed(1) : 0;

        return {
            totalDiterima,
            totalLulusan,
            avgMasaStudi,
            graduationRate,
            periodCount: lulusanData.length
        };
    }, [lulusanData]);

    // Sort data
    const sortedData = React.useMemo(() => {
        let data = [...lulusanData];
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
    }, [lulusanData, sortConfig]);

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

    // Chart data - Jumlah Mahasiswa Diterima per Tahun (Bar Chart)
    const diterimaChartData = {
        labels: lulusanData.map(d => d.tahunMasuk),
        datasets: [{
            label: 'Jumlah Mahasiswa Diterima',
            data: lulusanData.map(d => d.jumlahDiterima),
            backgroundColor: '#4e73df',
            borderRadius: 8
        }]
    };

    const diterimaChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    // Chart data - Rata-rata Masa Studi Trend (Line Chart)
    const masaStudiChartData = {
        labels: lulusanData.map(d => d.tahunMasuk),
        datasets: [{
            label: 'Rata-rata Masa Studi (Tahun)',
            data: lulusanData.map(d => d.rataRataMasaStudi),
            borderColor: '#1cc88a',
            backgroundColor: 'rgba(28, 200, 138, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#1cc88a',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6
        }]
    };

    const masaStudiChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { display: false },
                title: { display: true, text: 'Tahun' }
            },
            x: { grid: { display: false } }
        }
    };

    // Chart data - Diterima vs Lulusan (Bar Chart with comparison)
    const comparisonChartData = {
        labels: lulusanData.map(d => d.tahunMasuk),
        datasets: [
            {
                label: 'Mahasiswa Diterima',
                data: lulusanData.map(d => d.jumlahDiterima),
                backgroundColor: '#4e73df',
                borderRadius: 8
            },
            {
                label: 'Jumlah Lulusan',
                data: lulusanData.map(d => d.jumlahLulusan),
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

    // Chart data - Graduation Rate (Doughnut for overall)
    const graduationRateChartData = {
        labels: ['Lulus', 'Belum Lulus'],
        datasets: [{
            data: [stats.totalLulusan, stats.totalDiterima - stats.totalLulusan],
            backgroundColor: ['#1cc88a', '#e74a3b'],
            borderWidth: 0
        }]
    };

    const graduationRateChartOptions = {
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

    // Get badge color based on masa studi
    const getMasaStudiBadgeClass = (masa) => {
        if (masa === null || masa === undefined) return '';
        if (masa <= 4) return 'success';
        if (masa <= 5) return 'primary';
        if (masa <= 6) return 'warning';
        return 'danger';
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
                <h1 className="page-title">DKPS - Tabel 9</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>DKPS</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Tabel 9</span>
                </div>
            </div>

            <div className="alert info fade-in">
                <i className="fas fa-info-circle"></i>
                <span><strong>Tabel 9:</strong> Masa Studi Lulusan - Data rata-rata masa studi mahasiswa berdasarkan tahun masuk. TS = {TS}.</span>
            </div>

            <div className="stat-cards">
                <StatCard title="Total Mhs Diterima" value={stats.totalDiterima} icon="fas fa-user-plus" color="primary" />
                <StatCard title="Total Lulusan" value={stats.totalLulusan} icon="fas fa-user-graduate" color="success" />
                <StatCard title="Rata-rata Masa Studi" value={`${stats.avgMasaStudi} thn`} icon="fas fa-clock" color="info" />
                <StatCard title="Tingkat Kelulusan" value={`${stats.graduationRate}%`} icon="fas fa-chart-pie" color="warning" />
            </div>

            <div className="row">
                <div className="col col-6">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-bar"></i> Jumlah Mahasiswa Diterima per Tahun</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '250px' }}>
                                <ChartComponent type="bar" data={diterimaChartData} options={diterimaChartOptions} id="tabel9DiterimaChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-6">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-line"></i> Trend Rata-rata Masa Studi (Tahun)</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '250px' }}>
                                <ChartComponent type="line" data={masaStudiChartData} options={masaStudiChartOptions} id="tabel9MasaStudiChart" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col col-8">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-bar"></i> Perbandingan Diterima vs Lulusan</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '250px' }}>
                                <ChartComponent type="bar" data={comparisonChartData} options={comparisonChartOptions} id="tabel9ComparisonChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-4">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-pie"></i> Tingkat Kelulusan</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '220px', position: 'relative' }}>
                                <ChartComponent type="doughnut" data={graduationRateChartData} options={graduationRateChartOptions} id="tabel9GraduationChart" />
                                <div style={{
                                    position: 'absolute',
                                    top: '40%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--dark)' }}>{stats.graduationRate}%</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Lulus</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Data Masa Studi Lulusan</h3>
                </div>
                <div className="box-body">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('tahunMasuk')}>
                                        Tahun Masuk {getSortIcon('tahunMasuk')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('jumlahDiterima')}>
                                        Jumlah Diterima {getSortIcon('jumlahDiterima')}
                                    </th>
                                    <th style={{ textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        TS-3 ({TS - 3})
                                    </th>
                                    <th style={{ textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        TS-2 ({TS - 2})
                                    </th>
                                    <th style={{ textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        TS-1 ({TS - 1})
                                    </th>
                                    <th style={{ textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        TS ({TS})
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('jumlahLulusan')}>
                                        Jumlah Lulusan {getSortIcon('jumlahLulusan')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('rataRataMasaStudi')}>
                                        Rata-rata Masa Studi {getSortIcon('rataRataMasaStudi')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((item, index) => {
                                    const graduationRate = item.jumlahDiterima > 0
                                        ? ((item.jumlahLulusan / item.jumlahDiterima) * 100).toFixed(1)
                                        : 0;
                                    return (
                                        <tr key={index}>
                                            <td style={{ textAlign: 'center' }}>
                                                <strong style={{
                                                    background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)',
                                                    color: 'white',
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    display: 'inline-block'
                                                }}>
                                                    {item.tahunMasuk}
                                                </strong>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: '600', fontSize: '1.1rem' }}>
                                                {item.jumlahDiterima}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {item.lulusTS3 !== null ? (
                                                    <span className="status-badge success">
                                                        {item.lulusTS3}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#ccc' }}>-</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {item.lulusTS2 !== null ? (
                                                    <span className="status-badge primary">
                                                        {item.lulusTS2}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#ccc' }}>-</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {item.lulusTS1 !== null ? (
                                                    <span className="status-badge info">
                                                        {item.lulusTS1}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#ccc' }}>-</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="status-badge warning">
                                                    {item.lulusTS}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: '600' }}>{item.jumlahLulusan}</span>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        color: graduationRate >= 70 ? '#1cc88a' : graduationRate >= 50 ? '#f6c23e' : '#e74a3b',
                                                        background: graduationRate >= 70 ? 'rgba(28,200,138,0.1)' : graduationRate >= 50 ? 'rgba(246,194,62,0.1)' : 'rgba(231,74,59,0.1)',
                                                        padding: '2px 6px',
                                                        borderRadius: '10px'
                                                    }}>
                                                        {graduationRate}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    background: item.rataRataMasaStudi <= 4 ? 'linear-gradient(135deg, #1cc88a 0%, #13855c 100%)' :
                                                        item.rataRataMasaStudi <= 5 ? 'linear-gradient(135deg, #36b9cc 0%, #258391 100%)' :
                                                            'linear-gradient(135deg, #f6c23e 0%, #dda20a 100%)',
                                                    color: 'white',
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontWeight: '600',
                                                    display: 'inline-block',
                                                    minWidth: '60px'
                                                }}>
                                                    {item.rataRataMasaStudi.toFixed(1)} thn
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
                            <span><span className="status-badge success" style={{ padding: '3px 8px' }}>≤4</span> Tepat Waktu</span>
                            <span><span className="status-badge primary" style={{ padding: '3px 8px' }}>≤5</span> Baik</span>
                            <span><span className="status-badge warning" style={{ padding: '3px 8px' }}>&gt;5</span> Lebih Lama</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
