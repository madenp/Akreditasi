// ========================================
// Tabel 7 Content - Prestasi Mahasiswa
// ========================================
const Tabel7Content = () => {
    const [prestasiData, setPrestasiData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filterJenis, setFilterJenis] = useState('Semua');
    const [filterTingkat, setFilterTingkat] = useState('Semua');
    const [filterTahun, setFilterTahun] = useState('Semua');

    // Load JSON data
    useEffect(() => {
        fetch('Tabel_7.json')
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => {
                    // Determine level based on which field has value
                    let tingkat = 'Lainnya';
                    if (item["6"] === 1.0 || item["6"] === 1) tingkat = 'Internasional';
                    else if (item["5"] === 1.0 || item["5"] === 1) tingkat = 'Nasional';
                    else if (item["4"] === 1.0 || item["4"] === 1) tingkat = 'Lokal';

                    return {
                        no: item["0"] || '',
                        nama: item["1"] || '',
                        jenis: item["2"] || '',
                        tahun: item["3"] ? Math.floor(item["3"]) : '',
                        tingkat: tingkat,
                        capaian: item["7"] || ''
                    };
                });
                // Filter out empty rows
                setPrestasiData(formattedData.filter(d => d.nama));
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                setLoading(false);
            });
    }, []);

    // Calculate statistics
    const stats = React.useMemo(() => {
        const totalPrestasi = prestasiData.length;

        // Jenis Distribution
        const jenisDistribution = prestasiData.reduce((acc, d) => {
            const jenis = d.jenis || 'Lainnya';
            acc[jenis] = (acc[jenis] || 0) + 1;
            return acc;
        }, {});

        // Tingkat Distribution
        const tingkatDistribution = prestasiData.reduce((acc, d) => {
            acc[d.tingkat] = (acc[d.tingkat] || 0) + 1;
            return acc;
        }, {});

        // Tahun Distribution
        const tahunDistribution = prestasiData.reduce((acc, d) => {
            const tahun = d.tahun || 'Lainnya';
            acc[tahun] = (acc[tahun] || 0) + 1;
            return acc;
        }, {});

        // Capaian/Peringkat Distribution - simplify to main categories
        const capaianCategories = prestasiData.reduce((acc, d) => {
            const capaian = d.capaian.toLowerCase();
            if (capaian.includes('juara 1') || capaian.includes('gold') || capaian === 'juara 1') {
                acc['Juara 1/Gold'] = (acc['Juara 1/Gold'] || 0) + 1;
            } else if (capaian.includes('juara 2') || capaian.includes('silver') || capaian.includes('runner up')) {
                acc['Juara 2/Silver'] = (acc['Juara 2/Silver'] || 0) + 1;
            } else if (capaian.includes('juara 3') || capaian.includes('bronze')) {
                acc['Juara 3/Bronze'] = (acc['Juara 3/Bronze'] || 0) + 1;
            } else if (capaian.includes('harapan') || capaian.includes('finalis') || capaian.includes('top')) {
                acc['Harapan/Finalis'] = (acc['Harapan/Finalis'] || 0) + 1;
            } else {
                acc['Lainnya'] = (acc['Lainnya'] || 0) + 1;
            }
            return acc;
        }, {});

        // Count specific stats
        const akademik = prestasiData.filter(d => d.jenis === 'Akademik').length;
        const nonAkademik = prestasiData.filter(d => d.jenis === 'Non-akademik').length;
        const internasional = prestasiData.filter(d => d.tingkat === 'Internasional').length;
        const nasional = prestasiData.filter(d => d.tingkat === 'Nasional').length;

        return {
            totalPrestasi,
            jenisDistribution,
            tingkatDistribution,
            tahunDistribution,
            capaianCategories,
            akademik,
            nonAkademik,
            internasional,
            nasional
        };
    }, [prestasiData]);

    // Get unique values for filters
    const uniqueJenis = React.useMemo(() => {
        const jenis = new Set(prestasiData.map(d => d.jenis).filter(Boolean));
        return ['Semua', ...Array.from(jenis)];
    }, [prestasiData]);

    const uniqueTingkat = React.useMemo(() => {
        return ['Semua', 'Internasional', 'Nasional', 'Lokal'];
    }, []);

    const uniqueTahun = React.useMemo(() => {
        const tahun = new Set(prestasiData.map(d => d.tahun).filter(Boolean));
        return ['Semua', ...Array.from(tahun).sort((a, b) => b - a)];
    }, [prestasiData]);

    // Filter and Sort data
    const filteredData = React.useMemo(() => {
        let data = prestasiData.filter(d => {
            const matchSearch = d.nama && d.nama.toLowerCase().includes(searchTerm.toLowerCase());
            const matchJenis = filterJenis === 'Semua' || d.jenis === filterJenis;
            const matchTingkat = filterTingkat === 'Semua' || d.tingkat === filterTingkat;
            const matchTahun = filterTahun === 'Semua' || String(d.tahun) === String(filterTahun);
            return matchSearch && matchJenis && matchTingkat && matchTahun;
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
    }, [prestasiData, searchTerm, sortConfig, filterJenis, filterTingkat, filterTahun]);

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

    // Chart data - Jenis Distribution (Doughnut)
    const jenisChartData = {
        labels: Object.keys(stats.jenisDistribution),
        datasets: [{
            data: Object.values(stats.jenisDistribution),
            backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e'],
            borderWidth: 0
        }]
    };

    const jenisChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { padding: 15, usePointStyle: true, font: { size: 12 } } }
        }
    };

    // Chart data - Tingkat Distribution (Doughnut)
    const tingkatChartData = {
        labels: Object.keys(stats.tingkatDistribution),
        datasets: [{
            data: Object.values(stats.tingkatDistribution),
            backgroundColor: ['#e74a3b', '#36b9cc', '#28a745', '#858796'],
            borderWidth: 0
        }]
    };

    const tingkatChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { padding: 15, usePointStyle: true, font: { size: 12 } } }
        }
    };

    // Chart data - Tahun Trend (Bar Chart)
    const sortedTahun = Object.keys(stats.tahunDistribution).sort();
    const tahunChartData = {
        labels: sortedTahun,
        datasets: [{
            label: 'Jumlah Prestasi',
            data: sortedTahun.map(t => stats.tahunDistribution[t]),
            backgroundColor: '#4e73df',
            borderRadius: 8
        }]
    };

    const tahunChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    // Chart data - Capaian Distribution (Horizontal Bar)
    const capaianChartData = {
        labels: Object.keys(stats.capaianCategories),
        datasets: [{
            label: 'Jumlah',
            data: Object.values(stats.capaianCategories),
            backgroundColor: ['#ffc107', '#c0c0c0', '#cd7f32', '#17a2b8', '#6c757d'],
            borderRadius: 8
        }]
    };

    const capaianChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
            x: { beginAtZero: true, grid: { display: false } },
            y: { grid: { display: false } }
        }
    };

    // Get badge color based on capaian
    const getCapaianBadgeClass = (capaian) => {
        const c = capaian.toLowerCase();
        if (c.includes('juara 1') || c.includes('gold') || c === 'juara 1') return 'warning';
        if (c.includes('juara 2') || c.includes('silver') || c.includes('runner up')) return 'secondary';
        if (c.includes('juara 3') || c.includes('bronze')) return 'bronze';
        return 'info';
    };

    // Get tingkat badge color
    const getTingkatBadgeClass = (tingkat) => {
        switch (tingkat) {
            case 'Internasional': return 'danger';
            case 'Nasional': return 'primary';
            case 'Lokal': return 'success';
            default: return 'secondary';
        }
    };

    const selectStyle = {
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        marginRight: '10px',
        fontSize: '0.85rem',
        background: 'var(--light)',
        cursor: 'pointer'
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
                <h1 className="page-title">DKPS - Tabel 7</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>DKPS</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Tabel 7</span>
                </div>
            </div>

            <div className="alert info fade-in">
                <i className="fas fa-info-circle"></i>
                <span><strong>Tabel 7:</strong> Prestasi Mahasiswa - Data capaian prestasi akademik dan non-akademik tingkat lokal, nasional, dan internasional.</span>
            </div>

            <div className="stat-cards">
                <StatCard title="Total Prestasi" value={stats.totalPrestasi} icon="fas fa-trophy" color="warning" />
                <StatCard title="Akademik" value={stats.akademik} icon="fas fa-graduation-cap" color="primary" />
                <StatCard title="Non-Akademik" value={stats.nonAkademik} icon="fas fa-medal" color="success" />
                <StatCard title="Internasional" value={stats.internasional} icon="fas fa-globe" color="danger" />
            </div>

            <div className="row">
                <div className="col col-3">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-pie"></i> Jenis Prestasi</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '200px' }}>
                                <ChartComponent type="doughnut" data={jenisChartData} options={jenisChartOptions} id="tabel7JenisChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-3">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-layer-group"></i> Tingkat Prestasi</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '200px' }}>
                                <ChartComponent type="doughnut" data={tingkatChartData} options={tingkatChartOptions} id="tabel7TingkatChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-3">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-bar"></i> Per Tahun</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '200px' }}>
                                <ChartComponent type="bar" data={tahunChartData} options={tahunChartOptions} id="tabel7TahunChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-3">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-award"></i> Distribusi Capaian</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '200px' }}>
                                <ChartComponent type="bar" data={capaianChartData} options={capaianChartOptions} id="tabel7CapaianChart" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Daftar Prestasi Mahasiswa</h3>
                    <div className="box-tools" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)} style={selectStyle}>
                            {uniqueJenis.map(j => <option key={j} value={j}>{j}</option>)}
                        </select>
                        <select value={filterTingkat} onChange={(e) => setFilterTingkat(e.target.value)} style={selectStyle}>
                            {uniqueTingkat.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} style={selectStyle}>
                            {uniqueTahun.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Cari prestasi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '180px' }}
                            />
                        </div>
                    </div>
                </div>
                <div className="box-body">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px', cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('no')}>
                                        No {getSortIcon('no')}
                                    </th>
                                    <th style={{ cursor: 'pointer', minWidth: '280px', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('nama')}>
                                        Nama Prestasi {getSortIcon('nama')}
                                    </th>
                                    <th style={{ cursor: 'pointer', width: '130px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('jenis')}>
                                        Jenis {getSortIcon('jenis')}
                                    </th>
                                    <th style={{ cursor: 'pointer', width: '90px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('tahun')}>
                                        Tahun {getSortIcon('tahun')}
                                    </th>
                                    <th style={{ cursor: 'pointer', width: '130px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('tingkat')}>
                                        Tingkat {getSortIcon('tingkat')}
                                    </th>
                                    <th style={{ cursor: 'pointer', width: '150px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={() => requestSort('capaian')}>
                                        Capaian {getSortIcon('capaian')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((prestasi, index) => (
                                    <tr key={index}>
                                        <td style={{ textAlign: 'center' }}><strong>{prestasi.no}</strong></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '10px',
                                                    background: `linear-gradient(135deg, ${prestasi.jenis === 'Akademik' ? '#4e73df' : '#1cc88a'} 0%, ${prestasi.jenis === 'Akademik' ? '#224abe' : '#13855c'} 100%)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '0.9rem',
                                                    flexShrink: 0
                                                }}>
                                                    <i className={prestasi.jenis === 'Akademik' ? 'fas fa-book' : 'fas fa-trophy'}></i>
                                                </div>
                                                <span style={{ fontSize: '0.9rem' }}>{prestasi.nama}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`status-badge ${prestasi.jenis === 'Akademik' ? 'primary' : 'success'}`}>
                                                {prestasi.jenis}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: '600' }}>{prestasi.tahun}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`status-badge ${getTingkatBadgeClass(prestasi.tingkat)}`}>
                                                {prestasi.tingkat}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                background: prestasi.capaian.toLowerCase().includes('juara 1') || prestasi.capaian.toLowerCase().includes('gold') ? 'linear-gradient(135deg, #ffc107 0%, #ffca2c 100%)' :
                                                    prestasi.capaian.toLowerCase().includes('juara 2') || prestasi.capaian.toLowerCase().includes('silver') ? 'linear-gradient(135deg, #adb5bd 0%, #ced4da 100%)' :
                                                        prestasi.capaian.toLowerCase().includes('juara 3') || prestasi.capaian.toLowerCase().includes('bronze') ? 'linear-gradient(135deg, #cd7f32 0%, #daa520 100%)' :
                                                            'var(--light)',
                                                color: prestasi.capaian.toLowerCase().includes('juara 1') || prestasi.capaian.toLowerCase().includes('juara 2') || prestasi.capaian.toLowerCase().includes('juara 3') ||
                                                    prestasi.capaian.toLowerCase().includes('gold') || prestasi.capaian.toLowerCase().includes('silver') || prestasi.capaian.toLowerCase().includes('bronze') ? 'white' : 'var(--dark)',
                                                padding: '5px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '500',
                                                display: 'inline-block',
                                                textShadow: prestasi.capaian.toLowerCase().includes('juara') || prestasi.capaian.toLowerCase().includes('gold') ||
                                                    prestasi.capaian.toLowerCase().includes('silver') || prestasi.capaian.toLowerCase().includes('bronze') ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                                            }}>
                                                {prestasi.capaian}
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
                        Menampilkan {filteredData.length} dari {stats.totalPrestasi} data
                    </span>
                </div>
            </div>
        </div>
    );
};
