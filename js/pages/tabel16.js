// ========================================
// Tabel 16 Content - Tingkat/Ukuran Tempat Kerja Lulusan
// ========================================
const Tabel16Content = () => {
    const [tingkatTempatKerjaData, setTingkatTempatKerjaData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [selectedTrend, setSelectedTrend] = useState('all'); // 'all', 'lokal', 'nasional', 'multinasional'

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
        fetch('Tabel_16.json')
            .then(response => response.json())
            .then(data => {
                // Filter out the "Jumlah" row (summary row)
                const filteredData = data.filter(item => item["1"] !== "Jumlah");

                const formattedData = filteredData.map(item => ({
                    tahunLulus: item["1"] || '',
                    tahunActual: getYearFromTS(item["1"]),
                    jumlahLulusan: item["2"] || 0,
                    jumlahTerlacak: item["3"] || 0,
                    lokal: item["4"] || 0,           // Lokal/Wilayah/Berwirausaha tidak Berizin
                    nasional: item["5"] || 0,        // Nasional/Berwirausaha Berizin
                    multinasional: item["6"] || 0    // Multinasional/Internasional
                }));
                setTingkatTempatKerjaData(formattedData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                setLoading(false);
            });
    }, []);

    // Calculate statistics
    const stats = React.useMemo(() => {
        const totalLulusan = tingkatTempatKerjaData.reduce((sum, d) => sum + (d.jumlahLulusan || 0), 0);
        const totalTerlacak = tingkatTempatKerjaData.reduce((sum, d) => sum + (d.jumlahTerlacak || 0), 0);
        const totalLokal = tingkatTempatKerjaData.reduce((sum, d) => sum + (d.lokal || 0), 0);
        const totalNasional = tingkatTempatKerjaData.reduce((sum, d) => sum + (d.nasional || 0), 0);
        const totalMultinasional = tingkatTempatKerjaData.reduce((sum, d) => sum + (d.multinasional || 0), 0);

        // Track rate
        const trackRate = totalLulusan > 0 ? ((totalTerlacak / totalLulusan) * 100).toFixed(1) : 0;

        // International rate (Multinasional dari yang bekerja)
        const totalBekerja = totalLokal + totalNasional + totalMultinasional;
        const internationalRate = totalBekerja > 0 ? ((totalMultinasional / totalBekerja) * 100).toFixed(1) : 0;

        return {
            totalLulusan,
            totalTerlacak,
            totalLokal,
            totalNasional,
            totalMultinasional,
            totalBekerja,
            trackRate,
            internationalRate,
            periodCount: tingkatTempatKerjaData.length
        };
    }, [tingkatTempatKerjaData]);

    // Sort data
    const sortedData = React.useMemo(() => {
        let data = [...tingkatTempatKerjaData];
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
    }, [tingkatTempatKerjaData, sortConfig]);

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

    // Chart data - Trend Tingkat Tempat Kerja (Line Chart with Filter)
    const tingkatTrendChartData = React.useMemo(() => {
        const labels = tingkatTempatKerjaData.map(d => `${d.tahunLulus} (${d.tahunActual})`);

        let datasets = [];

        if (selectedTrend === 'all') {
            datasets = [
                {
                    label: 'Lokal/Wilayah',
                    data: tingkatTempatKerjaData.map(d => d.lokal),
                    borderColor: '#f6c23e',
                    backgroundColor: 'rgba(246,194,62,0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Nasional',
                    data: tingkatTempatKerjaData.map(d => d.nasional),
                    borderColor: '#1cc88a',
                    backgroundColor: 'rgba(28,200,138,0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Multinasional/Internasional',
                    data: tingkatTempatKerjaData.map(d => d.multinasional),
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78,115,223,0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ];
        } else if (selectedTrend === 'lokal') {
            datasets = [{
                label: 'Lokal/Wilayah',
                data: tingkatTempatKerjaData.map(d => d.lokal),
                borderColor: '#f6c23e',
                backgroundColor: 'rgba(246,194,62,0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                borderWidth: 3
            }];
        } else if (selectedTrend === 'nasional') {
            datasets = [{
                label: 'Nasional',
                data: tingkatTempatKerjaData.map(d => d.nasional),
                borderColor: '#1cc88a',
                backgroundColor: 'rgba(28,200,138,0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                borderWidth: 3
            }];
        } else if (selectedTrend === 'multinasional') {
            datasets = [{
                label: 'Multinasional/Internasional',
                data: tingkatTempatKerjaData.map(d => d.multinasional),
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78,115,223,0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                borderWidth: 3
            }];
        }

        return { labels, datasets };
    }, [tingkatTempatKerjaData, selectedTrend]);

    const tingkatTrendChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { usePointStyle: true, padding: 15 }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.dataset.label + ': ' + context.parsed.y + ' lulusan';
                    }
                }
            },
            datalabels: {
                display: true,
                align: 'top',
                anchor: 'end',
                offset: 4,
                font: {
                    size: 11,
                    weight: 'bold'
                },
                color: function (context) {
                    // Match color with line color
                    return context.dataset.borderColor;
                },
                formatter: function (value) {
                    return value;
                },
                backgroundColor: function (context) {
                    // Semi-transparent background for better readability
                    const color = context.dataset.borderColor;
                    if (color === '#f6c23e') return 'rgba(246,194,62,0.9)';
                    if (color === '#1cc88a') return 'rgba(28,200,138,0.9)';
                    if (color === '#4e73df') return 'rgba(78,115,223,0.9)';
                    return 'rgba(255,255,255,0.9)';
                },
                borderRadius: 4,
                padding: {
                    top: 4,
                    bottom: 4,
                    left: 6,
                    right: 6
                },
                color: 'white'
            }
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: {
                    callback: (value) => value
                }
            }
        }
    };

    // Chart data - Lulusan vs Terlacak (Bar Chart)
    const comparisonChartData = {
        labels: tingkatTempatKerjaData.map(d => `${d.tahunLulus} (${d.tahunActual})`),
        datasets: [
            {
                label: 'Jumlah Lulusan',
                data: tingkatTempatKerjaData.map(d => d.jumlahLulusan),
                backgroundColor: '#4e73df',
                borderRadius: 8
            },
            {
                label: 'Jumlah Terlacak',
                data: tingkatTempatKerjaData.map(d => d.jumlahTerlacak),
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

    // Chart data - Overall Tingkat Distribution (Doughnut)
    const overallTingkatChartData = {
        labels: ['Lokal/Wilayah', 'Nasional', 'Multinasional/Internasional'],
        datasets: [{
            data: [stats.totalLokal, stats.totalNasional, stats.totalMultinasional],
            backgroundColor: ['#f6c23e', '#1cc88a', '#4e73df'],
            borderWidth: 0
        }]
    };

    const overallTingkatChartOptions = {
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
        labels: tingkatTempatKerjaData.map(d => `${d.tahunLulus} (${d.tahunActual})`),
        datasets: [{
            label: 'Track Rate (%)',
            data: tingkatTempatKerjaData.map(d => d.jumlahLulusan > 0 ? ((d.jumlahTerlacak / d.jumlahLulusan) * 100).toFixed(1) : 0),
            backgroundColor: tingkatTempatKerjaData.map(d => {
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
                <h1 className="page-title">DKPS - Tabel 16</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>DKPS</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Tabel 16</span>
                </div>
            </div>

            <div className="alert info fade-in">
                <i className="fas fa-info-circle"></i>
                <span><strong>Tabel 16:</strong> Tingkat/Ukuran Tempat Kerja Lulusan - Data distribusi lulusan yang bekerja berdasarkan tingkat/ukuran tempat kerja dan berwirausaha. TS = {TS}.</span>
            </div>

            <div className="stat-cards">
                <StatCard title="Total Lulusan" value={stats.totalLulusan} icon="fas fa-user-graduate" color="primary" />
                <StatCard title="Lulusan Terlacak" value={stats.totalTerlacak} icon="fas fa-search" color="success" />
                <StatCard title="Track Rate" value={`${stats.trackRate}%`} icon="fas fa-chart-pie" color="info" />
                <StatCard title="Multinasional Rate" value={`${stats.internationalRate}%`} icon="fas fa-globe" color="warning" />
            </div>

            <div className="row">
                <div className="col col-8">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-line"></i> Trend Tingkat/Ukuran Tempat Kerja/Berwirausaha</h3>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                <button
                                    onClick={() => setSelectedTrend('all')}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        border: selectedTrend === 'all' ? '2px solid #4e73df' : '1px solid #ddd',
                                        background: selectedTrend === 'all' ? 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)' : 'white',
                                        color: selectedTrend === 'all' ? 'white' : '#333',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: selectedTrend === 'all' ? '600' : '400',
                                        transition: 'all 0.3s ease',
                                        boxShadow: selectedTrend === 'all' ? '0 2px 8px rgba(78,115,223,0.3)' : 'none'
                                    }}
                                >
                                    <i className="fas fa-layer-group" style={{ marginRight: '5px' }}></i> Semua
                                </button>
                                <button
                                    onClick={() => setSelectedTrend('lokal')}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        border: selectedTrend === 'lokal' ? '2px solid #f6c23e' : '1px solid #ddd',
                                        background: selectedTrend === 'lokal' ? 'linear-gradient(135deg, #f6c23e 0%, #dda20a 100%)' : 'white',
                                        color: selectedTrend === 'lokal' ? 'white' : '#333',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: selectedTrend === 'lokal' ? '600' : '400',
                                        transition: 'all 0.3s ease',
                                        boxShadow: selectedTrend === 'lokal' ? '0 2px 8px rgba(246,194,62,0.3)' : 'none'
                                    }}
                                >
                                    <i className="fas fa-map-marker-alt" style={{ marginRight: '5px' }}></i> Lokal
                                </button>
                                <button
                                    onClick={() => setSelectedTrend('nasional')}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        border: selectedTrend === 'nasional' ? '2px solid #1cc88a' : '1px solid #ddd',
                                        background: selectedTrend === 'nasional' ? 'linear-gradient(135deg, #1cc88a 0%, #13855c 100%)' : 'white',
                                        color: selectedTrend === 'nasional' ? 'white' : '#333',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: selectedTrend === 'nasional' ? '600' : '400',
                                        transition: 'all 0.3s ease',
                                        boxShadow: selectedTrend === 'nasional' ? '0 2px 8px rgba(28,200,138,0.3)' : 'none'
                                    }}
                                >
                                    <i className="fas fa-flag" style={{ marginRight: '5px' }}></i> Nasional
                                </button>
                                <button
                                    onClick={() => setSelectedTrend('multinasional')}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        border: selectedTrend === 'multinasional' ? '2px solid #4e73df' : '1px solid #ddd',
                                        background: selectedTrend === 'multinasional' ? 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)' : 'white',
                                        color: selectedTrend === 'multinasional' ? 'white' : '#333',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: selectedTrend === 'multinasional' ? '600' : '400',
                                        transition: 'all 0.3s ease',
                                        boxShadow: selectedTrend === 'multinasional' ? '0 2px 8px rgba(78,115,223,0.3)' : 'none'
                                    }}
                                >
                                    <i className="fas fa-globe" style={{ marginRight: '5px' }}></i> Multinasional
                                </button>
                            </div>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '280px' }}>
                                <ChartComponent
                                    type="line"
                                    data={tingkatTrendChartData}
                                    options={tingkatTrendChartOptions}
                                    id="tabel16TrendChart"
                                    plugins={typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []}
                                />
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
                                <ChartComponent type="doughnut" data={overallTingkatChartData} options={overallTingkatChartOptions} id="tabel16OverallChart" />
                                <div style={{
                                    position: 'absolute',
                                    top: '38%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--dark)' }}>{stats.totalBekerja}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Bekerja</div>
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
                                <ChartComponent type="bar" data={comparisonChartData} options={comparisonChartOptions} id="tabel16ComparisonChart" />
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
                                <ChartComponent type="bar" data={trackRateChartData} options={trackRateChartOptions} id="tabel16TrackRateChart" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Data Tingkat/Ukuran Tempat Kerja Lulusan</h3>
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
                                    <th colSpan="3" style={{ textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(78,115,223,0.1)' }}>
                                        Tingkat/Ukuran Tempat Kerja/Berwirausaha
                                    </th>
                                    <th style={{ textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        Track Rate
                                    </th>
                                </tr>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(246,194,62,0.1)' }} onClick={() => requestSort('lokal')}>
                                        Lokal/Wilayah {getSortIcon('lokal')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(28,200,138,0.1)' }} onClick={() => requestSort('nasional')}>
                                        Nasional {getSortIcon('nasional')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(78,115,223,0.1)' }} onClick={() => requestSort('multinasional')}>
                                        Multinasional {getSortIcon('multinasional')}
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((item, index) => {
                                    const trackRate = item.jumlahLulusan > 0
                                        ? ((item.jumlahTerlacak / item.jumlahLulusan) * 100).toFixed(1)
                                        : 0;
                                    const totalTingkat = item.lokal + item.nasional + item.multinasional;
                                    const lokalPct = totalTingkat > 0 ? ((item.lokal / totalTingkat) * 100).toFixed(0) : 0;
                                    const nasionalPct = totalTingkat > 0 ? ((item.nasional / totalTingkat) * 100).toFixed(0) : 0;
                                    const multinasionalPct = totalTingkat > 0 ? ((item.multinasional / totalTingkat) * 100).toFixed(0) : 0;

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
                                            <td style={{ textAlign: 'center', background: 'rgba(246,194,62,0.05)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span className="status-badge warning" style={{ minWidth: '50px' }}>
                                                        {item.lokal}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#f6c23e' }}>{lokalPct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', background: 'rgba(28,200,138,0.05)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span className="status-badge success" style={{ minWidth: '50px' }}>
                                                        {item.nasional}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#1cc88a' }}>{nasionalPct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', background: 'rgba(78,115,223,0.05)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span className="status-badge primary" style={{ minWidth: '50px' }}>
                                                        {item.multinasional}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#4e73df' }}>{multinasionalPct}%</span>
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
                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                            <span><span className="status-badge warning" style={{ padding: '3px 8px' }}>Lokal</span> Lokal/Wilayah/Wirausaha tidak berizin</span>
                            <span><span className="status-badge success" style={{ padding: '3px 8px' }}>Nasional</span> Nasional/Wirausaha berizin</span>
                            <span><span className="status-badge primary" style={{ padding: '3px 8px' }}>Multinasional</span> Multinasional/Internasional</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
