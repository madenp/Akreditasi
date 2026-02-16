// ========================================
// Tabel 2 Content - DKPS Profil Dosen Keahlian
// ========================================
const Tabel2Content = () => {
    const [dosenData, setDosenData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterKeahlian, setFilterKeahlian] = useState('');

    // Load CSV data
    useEffect(() => {
        fetch('Tabel 2.csv')
            .then(response => response.text())
            .then(text => {
                const rows = parseCSV(text);
                const data = rows.map(values => ({
                    no: values[0] || '',
                    nama: values[1] || '',
                    s2: values[2] || '-',
                    s3: values[3] || '-',
                    keahlian: values[4] || '-',
                    noSertifikasi: values[5] || '-',
                    sertifikasiProfesi: values[6] || '-'
                }));
                setDosenData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading CSV:', error);
                setLoading(false);
            });
    }, []);

    // Calculate statistics
    const stats = React.useMemo(() => {
        const keahlianCount = {};
        let hasSertifikasi = 0;
        let hasS3 = 0;

        dosenData.forEach(d => {
            const keahlian = d.keahlian || 'Lainnya';
            keahlianCount[keahlian] = (keahlianCount[keahlian] || 0) + 1;
            if (d.s3 && d.s3 !== '-' && !d.s3.startsWith('http')) hasS3++;
            if (d.sertifikasiProfesi && d.sertifikasiProfesi !== '-') hasSertifikasi++;
        });

        return { total: dosenData.length, hasS3, hasSertifikasi, keahlianCount, uniqueKeahlian: Object.keys(keahlianCount).length };
    }, [dosenData]);

    const keahlianOptions = React.useMemo(() => [...new Set(dosenData.map(d => d.keahlian).filter(k => k && k !== '-'))], [dosenData]);

    const filteredData = React.useMemo(() => {
        return dosenData.filter(d => {
            const matchSearch = d.nama.toLowerCase().includes(searchTerm.toLowerCase());
            const matchKeahlian = filterKeahlian ? d.keahlian === filterKeahlian : true;
            return matchSearch && matchKeahlian;
        });
    }, [dosenData, searchTerm, filterKeahlian]);

    const keahlianChartData = {
        labels: Object.keys(stats.keahlianCount),
        datasets: [{ data: Object.values(stats.keahlianCount), backgroundColor: ['#667eea', '#11998e', '#00c6fb', '#f093fb', '#f5576c', '#ffc107', '#6c757d', '#28a745', '#17a2b8', '#dc3545'], borderWidth: 0 }]
    };

    const keahlianChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { padding: 10, usePointStyle: true, font: { size: 10 } } } } };

    const overviewChartData = {
        labels: ['Total Dosen', 'Memiliki S3', 'Memiliki Sertifikasi'],
        datasets: [{ label: 'Jumlah', data: [stats.total, stats.hasS3, stats.hasSertifikasi], backgroundColor: ['rgba(102, 126, 234, 0.8)', 'rgba(17, 153, 142, 0.8)', 'rgba(243, 156, 18, 0.8)'], borderColor: ['#667eea', '#11998e', '#f39c12'], borderWidth: 2, borderRadius: 8 }]
    };

    const overviewChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } };

    const truncateText = (text, maxLength = 50) => {
        if (!text || text === '-') return '-';
        if (text.startsWith('http')) return <a href={text} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><i className="fas fa-external-link-alt"></i> Link</a>;
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    if (loading) {
        return (<div className="content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><div className="spinner"></div></div>);
    }

    return (
        <div className="content">
            <div className="breadcrumb-wrapper">
                <h1 className="page-title">DKPS - Tabel 2</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>DKPS</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Tabel 2</span>
                </div>
            </div>

            <div className="alert info fade-in">
                <i className="fas fa-info-circle"></i>
                <span><strong>Tabel 2:</strong> Profil Dosen Berdasarkan Latar Belakang Keahlian. Data ini mencakup informasi pendidikan S2/S3, bidang keahlian, dan sertifikasi profesional.</span>
            </div>

            <div className="stat-cards">
                <StatCard title="Total Dosen" value={stats.total} icon="fas fa-users" color="primary" />
                <StatCard title="Memiliki S3" value={stats.hasS3} icon="fas fa-graduation-cap" color="success" />
                <StatCard title="Memiliki Sertifikasi" value={stats.hasSertifikasi} icon="fas fa-certificate" color="warning" />
                <StatCard title="Bidang Keahlian" value={stats.uniqueKeahlian} icon="fas fa-book" color="info" />
            </div>

            <div className="row">
                <div className="col col-5">
                    <div className="box fade-in">
                        <div className="box-header"><h3 className="box-title"><i className="fas fa-chart-pie"></i> Distribusi Bidang Keahlian</h3></div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '280px' }}>
                                <ChartComponent type="doughnut" data={keahlianChartData} options={keahlianChartOptions} id="keahlianChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-7">
                    <div className="box fade-in">
                        <div className="box-header"><h3 className="box-title"><i className="fas fa-chart-bar"></i> Ringkasan Kualifikasi Dosen</h3></div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '280px' }}>
                                <ChartComponent type="bar" data={overviewChartData} options={overviewChartOptions} id="overviewChart" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header"><h3 className="box-title"><i className="fas fa-tasks"></i> Distribusi Bidang Keahlian (Detail)</h3></div>
                <div className="box-body">
                    <div className="row">
                        {Object.entries(stats.keahlianCount).map(([keahlian, count], index) => (
                            <div className="col col-6" key={index}>
                                <ProgressBar label={`${keahlian} (${count} orang)`} progress={Math.round((count / stats.total) * 100)} status={['primary', 'success', 'info', 'warning', 'danger'][index % 5]} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Daftar Profil Dosen</h3>
                    <div className="box-tools">
                        <div className="search-box" style={{ marginRight: '10px' }}>
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Cari nama dosen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '200px' }} />
                        </div>
                        <select className="form-control form-select" value={filterKeahlian} onChange={(e) => setFilterKeahlian(e.target.value)} style={{ width: '180px', padding: '8px 12px' }}>
                            <option value="">Semua Keahlian</option>
                            {keahlianOptions.map((k, i) => (<option key={i} value={k}>{k}</option>))}
                        </select>
                    </div>
                </div>
                <div className="box-body">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>No</th>
                                    <th style={{ width: '250px' }}>Nama Dosen</th>
                                    <th>Pendidikan S2</th>
                                    <th>Pendidikan S3</th>
                                    <th style={{ width: '150px' }}>Bidang Keahlian</th>
                                    <th>Sertifikasi Profesi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((dosen, index) => (
                                    <tr key={index}>
                                        <td><strong>{dosen.no}</strong></td>
                                        <td>{dosen.nama}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{truncateText(dosen.s2, 40)}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{truncateText(dosen.s3, 40)}</td>
                                        <td><span className="status-badge primary">{dosen.keahlian}</span></td>
                                        <td style={{ fontSize: '0.8rem', maxWidth: '200px' }}>
                                            {dosen.sertifikasiProfesi && dosen.sertifikasiProfesi !== '-' ? (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {dosen.sertifikasiProfesi.split(',').slice(0, 3).map((s, i) => (
                                                        <span key={i} className="status-badge success" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{s.trim().length > 20 ? s.trim().substring(0, 20) + '...' : s.trim()}</span>
                                                    ))}
                                                    {dosen.sertifikasiProfesi.split(',').length > 3 && (<span className="status-badge info" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>+{dosen.sertifikasiProfesi.split(',').length - 3} lainnya</span>)}
                                                </div>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="box-footer">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>Menampilkan {filteredData.length} dari {stats.total} data</span>
                        <button className="btn btn-primary"><i className="fas fa-download"></i> Export Data</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
