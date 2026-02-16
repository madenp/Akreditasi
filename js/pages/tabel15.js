// ========================================
// Tabel 15 Content - Kesesuaian Bidang Kerja Lulusan
// ========================================
const Tabel15Content = () => {
    const [kesesuaianData, setKesesuaianData] = useState([]);
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
        fetch('Tabel_15.json')
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    tahunLulus: item["1"] || '',
                    tahunActual: getYearFromTS(item["1"]),
                    jumlahLulusan: item["2"] || 0,
                    jumlahTerlacak: item["3"] || 0,
                    tidakSesuai: item["4"] || 0,
                    sesuai: item["5"] || 0
                }));
                setKesesuaianData(formattedData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                setLoading(false);
            });
    }, []);

    // Calculate statistics
    const stats = React.useMemo(() => {
        const totalLulusan = kesesuaianData.reduce((sum, d) => sum + (d.jumlahLulusan || 0), 0);
        const totalTerlacak = kesesuaianData.reduce((sum, d) => sum + (d.jumlahTerlacak || 0), 0);
        const totalSesuai = kesesuaianData.reduce((sum, d) => sum + (d.sesuai || 0), 0);
        const totalTidakSesuai = kesesuaianData.reduce((sum, d) => sum + (d.tidakSesuai || 0), 0);

        // Track rate
        const trackRate = totalLulusan > 0 ? ((totalTerlacak / totalLulusan) * 100).toFixed(1) : 0;

        // Match rate (dari yang terlacak)
        const matchRate = totalTerlacak > 0 ? ((totalSesuai / totalTerlacak) * 100).toFixed(1) : 0;

        return {
            totalLulusan,
            totalTerlacak,
            totalSesuai,
            totalTidakSesuai,
            trackRate,
            matchRate,
            periodCount: kesesuaianData.length
        };
    }, [kesesuaianData]);

    // Sort data
    const sortedData = React.useMemo(() => {
        let data = [...kesesuaianData];
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
    }, [kesesuaianData, sortConfig]);

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

    // Chart data - Kesesuaian Distribution (Stacked Bar)
    const kesesuaianChartData = {
        labels: kesesuaianData.map(d => `${d.tahunLulus} (${d.tahunActual})`),
        datasets: [
            {
                label: 'Sesuai',
                data: kesesuaianData.map(d => d.sesuai),
                backgroundColor: '#1cc88a',
                borderRadius: 4
            },
            {
                label: 'Tidak Sesuai',
                data: kesesuaianData.map(d => d.tidakSesuai),
                backgroundColor: '#e74a3b',
                borderRadius: 4
            }
        ]
    };

    const kesesuaianChartOptions = {
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
        labels: kesesuaianData.map(d => `${d.tahunLulus} (${d.tahunActual})`),
        datasets: [
            {
                label: 'Jumlah Lulusan',
                data: kesesuaianData.map(d => d.jumlahLulusan),
                backgroundColor: '#4e73df',
                borderRadius: 8
            },
            {
                label: 'Jumlah Terlacak',
                data: kesesuaianData.map(d => d.jumlahTerlacak),
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

    // Chart data - Overall Kesesuaian Distribution (Doughnut)
    const overallKesesuaianChartData = {
        labels: ['Sesuai', 'Tidak Sesuai'],
        datasets: [{
            data: [stats.totalSesuai, stats.totalTidakSesuai],
            backgroundColor: ['#1cc88a', '#e74a3b'],
            borderWidth: 0
        }]
    };

    const overallKesesuaianChartOptions = {
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

    // Chart data - Match Rate per Period (Bar)
    const matchRateChartData = {
        labels: kesesuaianData.map(d => `${d.tahunLulus} (${d.tahunActual})`),
        datasets: [{
            label: 'Match Rate (%)',
            data: kesesuaianData.map(d => {
                const totalKesesuaian = d.sesuai + d.tidakSesuai;
                return totalKesesuaian > 0 ? ((d.sesuai / totalKesesuaian) * 100).toFixed(1) : 0;
            }),
            backgroundColor: kesesuaianData.map(d => {
                const totalKesesuaian = d.sesuai + d.tidakSesuai;
                const rate = totalKesesuaian > 0 ? (d.sesuai / totalKesesuaian) * 100 : 0;
                return rate >= 60 ? '#1cc88a' : rate >= 40 ? '#f6c23e' : '#e74a3b';
            }),
            borderRadius: 8
        }]
    };

    const matchRateChartOptions = {
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
                <h1 className="page-title">DKPS - Tabel 15</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>DKPS</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Tabel 15</span>
                </div>
            </div>

            <div className="alert info fade-in">
                <i className="fas fa-info-circle"></i>
                <span><strong>Tabel 15:</strong> Kesesuaian Bidang Kerja Lulusan - Data tingkat kesesuaian bidang kerja dengan bidang studi lulusan yang terlacak. TS = {TS}.</span>
            </div>

            <div className="stat-cards">
                <StatCard title="Total Lulusan" value={stats.totalLulusan} icon="fas fa-user-graduate" color="primary" />
                <StatCard title="Lulusan Terlacak" value={stats.totalTerlacak} icon="fas fa-search" color="success" />
                <StatCard title="Track Rate" value={`${stats.trackRate}%`} icon="fas fa-chart-pie" color="info" />
                <StatCard title="Match Rate" value={`${stats.matchRate}%`} icon="fas fa-check-circle" color="warning" />
            </div>

            <div className="row">
                <div className="col col-8">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-bar"></i> Distribusi Kesesuaian per Periode</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '280px' }}>
                                <ChartComponent type="bar" data={kesesuaianChartData} options={kesesuaianChartOptions} id="tabel15KesesuaianChart" />
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
                                <ChartComponent type="doughnut" data={overallKesesuaianChartData} options={overallKesesuaianChartOptions} id="tabel15OverallChart" />
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
                                <ChartComponent type="bar" data={comparisonChartData} options={comparisonChartOptions} id="tabel15ComparisonChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-6">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-percentage"></i> Match Rate per Periode</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '250px' }}>
                                <ChartComponent type="bar" data={matchRateChartData} options={matchRateChartOptions} id="tabel15MatchRateChart" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Data Kesesuaian Bidang Kerja Lulusan</h3>
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
                                    <th colSpan="2" style={{ textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(78,115,223,0.1)' }}>
                                        Kesesuaian Bidang Kerja
                                    </th>
                                    <th style={{ textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        Match Rate
                                    </th>
                                </tr>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(28,200,138,0.1)' }} onClick={() => requestSort('sesuai')}>
                                        Sesuai {getSortIcon('sesuai')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(231,74,59,0.1)' }} onClick={() => requestSort('tidakSesuai')}>
                                        Tidak Sesuai {getSortIcon('tidakSesuai')}
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((item, index) => {
                                    const totalKesesuaian = item.sesuai + item.tidakSesuai;
                                    const matchRate = totalKesesuaian > 0
                                        ? ((item.sesuai / totalKesesuaian) * 100).toFixed(1)
                                        : 0;
                                    const sesuaiPct = totalKesesuaian > 0 ? ((item.sesuai / totalKesesuaian) * 100).toFixed(0) : 0;
                                    const tidakSesuaiPct = totalKesesuaian > 0 ? ((item.tidakSesuai / totalKesesuaian) * 100).toFixed(0) : 0;

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
                                                        {item.sesuai}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#1cc88a' }}>{sesuaiPct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', background: 'rgba(231,74,59,0.05)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span className="status-badge danger" style={{ minWidth: '50px' }}>
                                                        {item.tidakSesuai}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#e74a3b' }}>{tidakSesuaiPct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    background: matchRate >= 60 ? 'linear-gradient(135deg, #1cc88a 0%, #13855c 100%)' :
                                                        matchRate >= 40 ? 'linear-gradient(135deg, #f6c23e 0%, #dda20a 100%)' :
                                                            'linear-gradient(135deg, #e74a3b 0%, #be2617 100%)',
                                                    color: 'white',
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontWeight: '600',
                                                    display: 'inline-block',
                                                    minWidth: '65px'
                                                }}>
                                                    {matchRate}%
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
                            <span><span className="status-badge success" style={{ padding: '3px 8px' }}>Sesuai</span> Bidang kerja sesuai dengan bidang studi</span>
                            <span><span className="status-badge danger" style={{ padding: '3px 8px' }}>Tidak Sesuai</span> Bidang kerja tidak sesuai dengan bidang studi</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
