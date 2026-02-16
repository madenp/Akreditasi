// ========================================
// Tabel 1 Content - DKPS Data Dosen
// ========================================
const Tabel1Content = () => {
    const [dosenData, setDosenData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterJabatan, setFilterJabatan] = useState('');

    // Load CSV data
    useEffect(() => {
        fetch('Tabel 1.csv')
            .then(response => response.text())
            .then(text => {
                const rows = parseCSV(text);
                const data = rows.map(values => ({
                    no: values[0] || '',
                    nama: values[1] || '',
                    status: values[2] || '',
                    nip: values[3] || '-',
                    jabatan: values[4] || '',
                    kategori: values[5] || ''
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
        const jabatanCount = {};
        dosenData.forEach(d => {
            const jabatan = d.jabatan || 'Lainnya';
            jabatanCount[jabatan] = (jabatanCount[jabatan] || 0) + 1;
        });
        return {
            total: dosenData.length,
            guruBesar: jabatanCount['Guru Besar'] || 0,
            lektorKepala: jabatanCount['Lektor Kepala'] || 0,
            lektor: jabatanCount['Lektor'] || 0,
            asistenAhli: jabatanCount['Asisten Ahli'] || 0,
            tenagaPengajar: jabatanCount['Tenaga Pengajar'] || 0,
            jabatanCount
        };
    }, [dosenData]);

    // Filter data
    const filteredData = React.useMemo(() => {
        return dosenData.filter(d => {
            const matchSearch = d.nama.toLowerCase().includes(searchTerm.toLowerCase()) || d.nip.includes(searchTerm);
            const matchJabatan = filterJabatan ? d.jabatan === filterJabatan : true;
            return matchSearch && matchJabatan;
        });
    }, [dosenData, searchTerm, filterJabatan]);

    // Chart data
    const jabatanChartData = {
        labels: Object.keys(stats.jabatanCount),
        datasets: [{
            data: Object.values(stats.jabatanCount),
            backgroundColor: ['#667eea', '#11998e', '#00c6fb', '#f093fb', '#f5576c', '#6c757d'],
            borderWidth: 0
        }]
    };

    const jabatanChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { padding: 15, usePointStyle: true, font: { size: 11 } } } }
    };

    const getJabatanColor = (jabatan) => {
        switch (jabatan) {
            case 'Guru Besar': return 'primary';
            case 'Lektor Kepala': return 'success';
            case 'Lektor': return 'info';
            case 'Asisten Ahli': return 'warning';
            case 'Tenaga Pengajar': return 'danger';
            default: return 'secondary';
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
                <h1 className="page-title">DKPS - Tabel 1</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>DKPS</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Tabel 1</span>
                </div>
            </div>

            <div className="alert info fade-in">
                <i className="fas fa-info-circle"></i>
                <span><strong>Tabel 1:</strong> Profil Dosen Tetap Program Studi. Data ini digunakan untuk keperluan akreditasi program studi.</span>
            </div>

            <div className="stat-cards">
                <StatCard title="Total Dosen" value={stats.total} icon="fas fa-users" color="primary" />
                <StatCard title="Guru Besar" value={stats.guruBesar} icon="fas fa-user-graduate" color="success" />
                <StatCard title="Lektor Kepala" value={stats.lektorKepala} icon="fas fa-user-tie" color="info" />
                <StatCard title="Lektor" value={stats.lektor} icon="fas fa-chalkboard-teacher" color="warning" />
            </div>

            <div className="row">
                <div className="col col-4">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-pie"></i> Distribusi Jabatan</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '250px' }}>
                                <ChartComponent type="pie" data={jabatanChartData} options={jabatanChartOptions} id="jabatanChart" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-8">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-bar"></i> Ringkasan Jabatan Fungsional</h3>
                        </div>
                        <div className="box-body">
                            <ProgressBar label={`Guru Besar (${stats.guruBesar} orang)`} progress={Math.round((stats.guruBesar / stats.total) * 100)} status="primary" />
                            <ProgressBar label={`Lektor Kepala (${stats.lektorKepala} orang)`} progress={Math.round((stats.lektorKepala / stats.total) * 100)} status="success" />
                            <ProgressBar label={`Lektor (${stats.lektor} orang)`} progress={Math.round((stats.lektor / stats.total) * 100)} status="info" />
                            <ProgressBar label={`Asisten Ahli (${stats.asistenAhli} orang)`} progress={Math.round((stats.asistenAhli / stats.total) * 100)} status="warning" />
                            <ProgressBar label={`Tenaga Pengajar (${stats.tenagaPengajar} orang)`} progress={Math.round((stats.tenagaPengajar / stats.total) * 100)} status="danger" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Daftar Dosen Tetap</h3>
                    <div className="box-tools">
                        <div className="search-box" style={{ marginRight: '10px' }}>
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Cari nama atau NIP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '200px' }} />
                        </div>
                        <select className="form-control form-select" value={filterJabatan} onChange={(e) => setFilterJabatan(e.target.value)} style={{ width: '180px', padding: '8px 12px' }}>
                            <option value="">Semua Jabatan</option>
                            <option value="Guru Besar">Guru Besar</option>
                            <option value="Lektor Kepala">Lektor Kepala</option>
                            <option value="Lektor">Lektor</option>
                            <option value="Asisten Ahli">Asisten Ahli</option>
                            <option value="Tenaga Pengajar">Tenaga Pengajar</option>
                        </select>
                    </div>
                </div>
                <div className="box-body">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>No</th>
                                    <th>Nama Dosen</th>
                                    <th style={{ width: '100px' }}>Status</th>
                                    <th style={{ width: '130px' }}>NIP/NIDN</th>
                                    <th style={{ width: '150px' }}>Jabatan Fungsional</th>
                                    <th style={{ width: '120px' }}>Kategori</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((dosen, index) => (
                                    <tr key={index}>
                                        <td><strong>{dosen.no}</strong></td>
                                        <td>{dosen.nama}</td>
                                        <td><span className="status-badge success">{dosen.status}</span></td>
                                        <td>{dosen.nip}</td>
                                        <td><span className={`status-badge ${getJabatanColor(dosen.jabatan)}`}>{dosen.jabatan}</span></td>
                                        <td>{dosen.kategori}</td>
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
