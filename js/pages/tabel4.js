// ========================================
// Tabel 4 Content - Produktivitas Dosen (Estimasi)
// ========================================
const Tabel4Content = () => {
    const [dosenData, setDosenData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Load JSON data
    useEffect(() => {
        fetch('Tabel_4.json')
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    no: item["0"] || '',
                    nama: item["1"] || '',
                    pendidikan: parseFloat(item["2"]) || 0,
                    penelitian: parseFloat(item["5"]) || 0,
                    pkm: parseFloat(item["6"]) || 0,
                    penunjang: parseFloat(item["7"]) || 0,
                    jumlah: parseFloat(item["8"]) || 0,
                    rataRata: parseFloat(item["9"]) || 0
                }));
                // Filter out empty rows (where name is null)
                setDosenData(formattedData.filter(d => d.nama));
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
        const totalSKS = dosenData.reduce((sum, d) => sum + d.jumlah, 0);
        const avgSKS = totalDosen > 0 ? (totalSKS / totalDosen).toFixed(2) : 0;

        // SKS Distribution
        const sksDistribution = {
            'Rendah (< 10)': dosenData.filter(d => d.rataRata < 10).length,
            'Sedang (10-14)': dosenData.filter(d => d.rataRata >= 10 && d.rataRata <= 14).length,
            'Tinggi (> 14)': dosenData.filter(d => d.rataRata > 14).length,
        };

        // Totals per component
        const totalPendidikan = dosenData.reduce((sum, d) => sum + d.pendidikan, 0);
        const totalPenelitian = dosenData.reduce((sum, d) => sum + d.penelitian, 0);
        const totalPkM = dosenData.reduce((sum, d) => sum + d.pkm, 0);
        const totalPenunjang = dosenData.reduce((sum, d) => sum + d.penunjang, 0);

        return {
            totalDosen,
            avgSKS,
            totalSKS,
            sksDistribution,
            components: { totalPendidikan, totalPenelitian, totalPkM, totalPenunjang }
        };
    }, [dosenData]);

    // Filter and Sort data
    const filteredData = React.useMemo(() => {
        let data = dosenData.filter(d => d.nama && d.nama.toLowerCase().includes(searchTerm.toLowerCase()));

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

    // Chart data - Distribution
    const distChartData = {
        labels: Object.keys(stats.sksDistribution),
        datasets: [{
            data: Object.values(stats.sksDistribution),
            backgroundColor: ['#ffc107', '#17a2b8', '#28a745'],
            borderWidth: 0
        }]
    };

    const distChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { padding: 10, usePointStyle: true } }
        }
    };

    // Chart data - Components Comparison
    const compChartData = {
        labels: ['Pendidikan', 'Penelitian', 'PkM', 'Penunjang'],
        datasets: [{
            label: 'Total SKS',
            data: [
                stats.components.totalPendidikan,
                stats.components.totalPenelitian,
                stats.components.totalPkM,
                stats.components.totalPenunjang
            ],
            backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
            borderRadius: 5
        }]
    };

    const compChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true }
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
                <h1 className="page-title">DKPS - Tabel 4</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>DKPS</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Tabel 4</span>
                </div>
            </div>

            <div className="alert info fade-in">
                <i className="fas fa-info-circle"></i>
                <span><strong>Tabel 4:</strong> Sumber Daya Manusia - Beban Kerja Dosen (Pendidikan, Penelitian, PkM, Penunjang).</span>
            </div>

            <div className="stat-cards">
                <StatCard title="Total Dosen" value={stats.totalDosen} icon="fas fa-users" color="primary" />
                <StatCard title="Rata-rata SKS" value={stats.avgSKS} icon="fas fa-calculator" color="info" />
                <StatCard title="Total Pendidkan" value={stats.components.totalPendidikan.toFixed(2)} icon="fas fa-book" color="success" />
                <StatCard title="Total Penelitian" value={stats.components.totalPenelitian.toFixed(2)} icon="fas fa-flask" color="warning" />
            </div>

            <div className="row">
                <div className="col col-4">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-pie"></i> Distribusi Rata-rata SKS</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '250px' }}>
                                <ChartComponent type="doughnut" data={distChartData} options={distChartOptions} id="tabel4DistChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-8">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-bar"></i> Komposisi Beban Kerja (Total)</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '250px' }}>
                                <ChartComponent type="bar" data={compChartData} options={compChartOptions} id="tabel4CompChart" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Daftar Beban Kerja Dosen Tetap</h3>
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
                                    <th style={{ width: '50px', cursor: 'pointer' }} onClick={() => requestSort('no')}>
                                        No {getSortIcon('no')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => requestSort('nama')}>
                                        Nama Dosen {getSortIcon('nama')}
                                    </th>
                                    <th style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => requestSort('pendidikan')}>
                                        Pendidikan {getSortIcon('pendidikan')}
                                    </th>
                                    <th style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => requestSort('penelitian')}>
                                        Penelitian {getSortIcon('penelitian')}
                                    </th>
                                    <th style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => requestSort('pkm')}>
                                        PkM {getSortIcon('pkm')}
                                    </th>
                                    <th style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => requestSort('penunjang')}>
                                        Penunjang {getSortIcon('penunjang')}
                                    </th>
                                    <th style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => requestSort('jumlah')}>
                                        Jumlah {getSortIcon('jumlah')}
                                    </th>
                                    <th style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => requestSort('rataRata')}>
                                        Rata-rata {getSortIcon('rataRata')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((dosen, index) => (
                                    <tr key={index}>
                                        <td><strong>{dosen.no}</strong></td>
                                        <td>{dosen.nama}</td>
                                        <td style={{ textAlign: 'center' }}>{dosen.pendidikan}</td>
                                        <td style={{ textAlign: 'center' }}>{dosen.penelitian}</td>
                                        <td style={{ textAlign: 'center' }}>{dosen.pkm}</td>
                                        <td style={{ textAlign: 'center' }}>{dosen.penunjang}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{dosen.jumlah}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`status-badge ${dosen.rataRata > 14 ? 'success' : dosen.rataRata < 10 ? 'warning' : 'primary'}`}>
                                                {dosen.rataRata}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="box-footer">
                    <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                        Menampilkan {filteredData.length} dari {stats.totalDosen} data
                    </span>
                </div>
            </div>
        </div>
    );
};
