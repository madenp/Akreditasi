// ========================================
// Tabel 5 Content - Tenaga Kependidikan
// ========================================
const Tabel5Content = () => {
    const [tendikData, setTendikData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filterStatus, setFilterStatus] = useState('Semua');

    // Load JSON data
    useEffect(() => {
        fetch('Tabel_5.json')
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    no: item["0"] || '',
                    nama: item["1"] || '',
                    status: item["2"] || '',
                    jabatan: item["3"] || ''
                }));
                // Filter out empty rows
                setTendikData(formattedData.filter(d => d.nama));
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                setLoading(false);
            });
    }, []);

    // Calculate statistics
    const stats = React.useMemo(() => {
        const totalTendik = tendikData.length;

        // Status Distribution
        const statusDistribution = tendikData.reduce((acc, d) => {
            const status = d.status || 'Lainnya';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Jabatan Distribution
        const jabatanDistribution = tendikData.reduce((acc, d) => {
            const jabatan = d.jabatan || 'Lainnya';
            acc[jabatan] = (acc[jabatan] || 0) + 1;
            return acc;
        }, {});

        // Count by status
        const tetap = tendikData.filter(d => d.status === 'Tetap').length;
        const tidakTetap = tendikData.filter(d => d.status !== 'Tetap').length;

        return {
            totalTendik,
            statusDistribution,
            jabatanDistribution,
            tetap,
            tidakTetap
        };
    }, [tendikData]);

    // Get unique statuses for filter
    const uniqueStatuses = React.useMemo(() => {
        const statuses = new Set(tendikData.map(d => d.status));
        return ['Semua', ...Array.from(statuses)];
    }, [tendikData]);

    // Filter and Sort data
    const filteredData = React.useMemo(() => {
        let data = tendikData.filter(d => {
            const matchSearch = d.nama && d.nama.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = filterStatus === 'Semua' || d.status === filterStatus;
            return matchSearch && matchStatus;
        });

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
    }, [tendikData, searchTerm, sortConfig, filterStatus]);

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

    // Chart data - Status Distribution (Pie Chart)
    const statusChartData = {
        labels: Object.keys(stats.statusDistribution),
        datasets: [{
            data: Object.values(stats.statusDistribution),
            backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#dc3545', '#6c757d'],
            borderWidth: 0
        }]
    };

    const statusChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { padding: 15, usePointStyle: true, font: { size: 12 } } }
        }
    };

    // Chart data - Jabatan Distribution (Bar Chart)
    const jabatanChartData = {
        labels: Object.keys(stats.jabatanDistribution),
        datasets: [{
            label: 'Jumlah',
            data: Object.values(stats.jabatanDistribution),
            backgroundColor: [
                '#4e73df',
                '#1cc88a',
                '#36b9cc',
                '#f6c23e',
                '#e74a3b',
                '#858796'
            ],
            borderRadius: 8
        }]
    };

    const jabatanChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { display: false }
            },
            y: {
                grid: { display: false },
                ticks: { font: { size: 11 } }
            }
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
                <h1 className="page-title">DKPS - Tabel 5</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>DKPS</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Tabel 5</span>
                </div>
            </div>

            <div className="alert info fade-in">
                <i className="fas fa-info-circle"></i>
                <span><strong>Tabel 5:</strong> Sumber Daya Manusia - Data Tenaga Kependidikan (Tendik) Tetap dan Tidak Tetap.</span>
            </div>

            <div className="stat-cards">
                <StatCard title="Total Tendik" value={stats.totalTendik} icon="fas fa-user-tie" color="primary" />
                <StatCard title="Tendik Tetap" value={stats.tetap} icon="fas fa-user-check" color="success" />
                <StatCard title="Tendik Tidak Tetap" value={stats.tidakTetap} icon="fas fa-user-clock" color="warning" />
                <StatCard title="Jenis Jabatan" value={Object.keys(stats.jabatanDistribution).length} icon="fas fa-briefcase" color="info" />
            </div>

            <div className="row">
                <div className="col col-4">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-pie"></i> Distribusi Status</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '250px' }}>
                                <ChartComponent type="doughnut" data={statusChartData} options={statusChartOptions} id="tabel5StatusChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-8">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-bar"></i> Distribusi Jabatan/Keahlian</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '250px' }}>
                                <ChartComponent type="bar" data={jabatanChartData} options={jabatanChartOptions} id="tabel5JabatanChart" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Daftar Tenaga Kependidikan</h3>
                    <div className="box-tools">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                marginRight: '10px',
                                fontSize: '0.9rem',
                                background: 'var(--light)',
                                cursor: 'pointer'
                            }}
                        >
                            {uniqueStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Cari nama tendik..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '220px' }}
                            />
                        </div>
                    </div>
                </div>
                <div className="box-body">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px', cursor: 'pointer' }} onClick={() => requestSort('no')}>
                                        No {getSortIcon('no')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => requestSort('nama')}>
                                        Nama Tendik {getSortIcon('nama')}
                                    </th>
                                    <th style={{ cursor: 'pointer', width: '150px' }} onClick={() => requestSort('status')}>
                                        Status {getSortIcon('status')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => requestSort('jabatan')}>
                                        Jabatan/Keahlian {getSortIcon('jabatan')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((tendik, index) => (
                                    <tr key={index}>
                                        <td><strong>{tendik.no}</strong></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${tendik.status === 'Tetap' ? '#28a745' : '#17a2b8'} 0%, ${tendik.status === 'Tetap' ? '#20c997' : '#36b9cc'} 100%)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {tendik.nama ? tendik.nama.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                {tendik.nama}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${tendik.status === 'Tetap' ? 'success' : 'primary'}`}>
                                                {tendik.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                background: 'var(--light)',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                color: 'var(--dark)'
                                            }}>
                                                {tendik.jabatan}
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
                        Menampilkan {filteredData.length} dari {stats.totalTendik} data
                    </span>
                </div>
            </div>
        </div>
    );
};
