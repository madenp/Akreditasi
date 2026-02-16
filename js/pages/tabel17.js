// ========================================
// Tabel 17 Content - Tingkat Kepuasan Pengguna terhadap Kemampuan Lulusan
// ========================================
const Tabel17Content = () => {
    const [kepuasanData, setKepuasanData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Load JSON data
    useEffect(() => {
        fetch('Tabel_17.json')
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    no: item["0"] || '',
                    jenisKemampuan: item["1"] || '',
                    sangatBaik: item["2"] || 0,
                    baik: item["3"] || 0,
                    cukup: item["4"] || 0,
                    kurang: item["5"] || 0,
                    rencana: item["6"] || ''
                }));
                setKepuasanData(formattedData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                setLoading(false);
            });
    }, []);

    // Calculate statistics
    const stats = React.useMemo(() => {
        // Sum all competencies for overall distribution
        const totalSangatBaik = kepuasanData.reduce((sum, d) => sum + (d.sangatBaik || 0), 0);
        const totalBaik = kepuasanData.reduce((sum, d) => sum + (d.baik || 0), 0);
        const totalCukup = kepuasanData.reduce((sum, d) => sum + (d.cukup || 0), 0);
        const totalKurang = kepuasanData.reduce((sum, d) => sum + (d.kurang || 0), 0);

        // Sample size per competency (all should be 100)
        const sampleSize = kepuasanData.length > 0
            ? kepuasanData[0].sangatBaik + kepuasanData[0].baik + kepuasanData[0].cukup + kepuasanData[0].kurang
            : 0;

        // Total responses across all competencies
        const totalResponses = totalSangatBaik + totalBaik + totalCukup + totalKurang;

        // Weighted satisfaction score using Likert scale
        // Sangat Baik = 4, Baik = 3, Cukup = 2, Kurang = 1
        const totalScore = totalResponses > 0
            ? ((totalSangatBaik * 4) + (totalBaik * 3) + (totalCukup * 2) + (totalKurang * 1)) / totalResponses
            : 0;

        // Get category based on score
        const getCategory = (score) => {
            if (score >= 3.26) return 'Sangat Baik';
            if (score >= 2.51) return 'Baik';
            if (score >= 1.76) return 'Cukup';
            return 'Kurang';
        };

        const satisfactionScore = totalScore.toFixed(2);
        const satisfactionCategory = getCategory(totalScore);

        // Calculate average satisfaction per competency
        const avgSatisfactionPerCompetency = kepuasanData.length > 0
            ? (totalScore * totalResponses) / (kepuasanData.length * sampleSize)
            : 0;

        return {
            sampleSize,
            totalResponses,
            totalSangatBaik,
            totalBaik,
            totalCukup,
            totalKurang,
            satisfactionScore,
            satisfactionCategory,
            avgSatisfactionPerCompetency: avgSatisfactionPerCompetency.toFixed(2),
            kompetensiCount: kepuasanData.length
        };
    }, [kepuasanData]);

    // Sort data
    const sortedData = React.useMemo(() => {
        let data = [...kepuasanData];
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
    }, [kepuasanData, sortConfig]);

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

    // Chart data - Horizontal Bar Chart for Satisfaction per Competency
    const competencyChartData = {
        labels: kepuasanData.map(d => d.jenisKemampuan),
        datasets: [
            {
                label: 'Sangat Baik',
                data: kepuasanData.map(d => d.sangatBaik),
                backgroundColor: '#1cc88a',
                borderRadius: 4
            },
            {
                label: 'Baik',
                data: kepuasanData.map(d => d.baik),
                backgroundColor: '#36b9cc',
                borderRadius: 4
            },
            {
                label: 'Cukup',
                data: kepuasanData.map(d => d.cukup),
                backgroundColor: '#f6c23e',
                borderRadius: 4
            },
            {
                label: 'Kurang',
                data: kepuasanData.map(d => d.kurang),
                backgroundColor: '#e74a3b',
                borderRadius: 4
            }
        ]
    };

    const competencyChartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { usePointStyle: true, padding: 15 }
            }
        },
        scales: {
            x: { stacked: true, beginAtZero: true, grid: { display: false } },
            y: { stacked: true, grid: { display: false } }
        }
    };

    // Chart data - Overall Distribution (Doughnut)
    const overallDistributionChartData = {
        labels: ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'],
        datasets: [{
            data: [stats.totalSangatBaik, stats.totalBaik, stats.totalCukup, stats.totalKurang],
            backgroundColor: ['#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
            borderWidth: 0
        }]
    };

    const overallDistributionChartOptions = {
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

    // Chart data - Satisfaction Score per Competency (Bar) - Using Likert Scale
    const satisfactionRateChartData = {
        labels: kepuasanData.map(d => {
            // Shorten label for better display
            const label = d.jenisKemampuan;
            return label.length > 30 ? label.substring(0, 27) + '...' : label;
        }),
        datasets: [{
            label: 'Skor Kepuasan (Likert)',
            data: kepuasanData.map(d => {
                const total = d.sangatBaik + d.baik + d.cukup + d.kurang;
                return total > 0 ? (((d.sangatBaik * 4) + (d.baik * 3) + (d.cukup * 2) + (d.kurang * 1)) / total).toFixed(2) : 0;
            }),
            backgroundColor: kepuasanData.map(d => {
                const total = d.sangatBaik + d.baik + d.cukup + d.kurang;
                const score = total > 0 ? ((d.sangatBaik * 4) + (d.baik * 3) + (d.cukup * 2) + (d.kurang * 1)) / total : 0;
                if (score >= 3.26) return '#1cc88a'; // Sangat Baik
                if (score >= 2.51) return '#36b9cc'; // Baik
                if (score >= 1.76) return '#f6c23e'; // Cukup
                return '#e74a3b'; // Kurang
            }),
            borderRadius: 8
        }]
    };

    const satisfactionRateChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const score = parseFloat(context.parsed.y);
                        let category = 'Kurang';
                        if (score >= 3.26) category = 'Sangat Baik';
                        else if (score >= 2.51) category = 'Baik';
                        else if (score >= 1.76) category = 'Cukup';
                        return 'Skor: ' + score.toFixed(2) + ' (' + category + ')';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 4,
                grid: { display: false },
                ticks: {
                    callback: (value) => value.toFixed(1),
                    stepSize: 0.5
                }
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
                <h1 className="page-title">DKPS - Tabel 17</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>DKPS</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Tabel 17</span>
                </div>
            </div>

            <div className="alert info fade-in">
                <i className="fas fa-info-circle"></i>
                <span><strong>Tabel 17:</strong> Tingkat Kepuasan Pengguna terhadap Kemampuan Lulusan - Data kepuasan pengguna lulusan berdasarkan berbagai jenis kemampuan.</span>
            </div>

            <div className="stat-cards">
                <StatCard title="Sample Size" value={stats.sampleSize} icon="fas fa-users" color="primary" />
                <StatCard title="Jenis Kemampuan" value={stats.kompetensiCount} icon="fas fa-list" color="success" />
                <StatCard title="Skor Kepuasan" value={stats.satisfactionScore} icon="fas fa-chart-line" color="info" />
                <StatCard title="Kategori" value={stats.satisfactionCategory} icon="fas fa-trophy" color="warning" />
            </div>

            <div className="row">
                <div className="col col-8">
                    <div className="box fade-in">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-bar"></i> Distribusi Kepuasan per Jenis Kemampuan</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container" style={{ height: '350px' }}>
                                <ChartComponent type="bar" data={competencyChartData} options={competencyChartOptions} id="tabel17CompetencyChart" />
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
                            <div className="chart-container" style={{ height: '320px', position: 'relative' }}>
                                <ChartComponent type="doughnut" data={overallDistributionChartData} options={overallDistributionChartOptions} id="tabel17OverallChart" />
                                <div style={{
                                    position: 'absolute',
                                    top: '38%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--dark)' }}>{stats.sampleSize}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Sample Size</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-star"></i> Skor Kepuasan per Jenis Kemampuan (Skala Likert)</h3>
                </div>
                <div className="box-body">
                    <div className="chart-container" style={{ height: '280px' }}>
                        <ChartComponent type="bar" data={satisfactionRateChartData} options={satisfactionRateChartOptions} id="tabel17SatisfactionRateChart" />
                    </div>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Data Tingkat Kepuasan Pengguna</h3>
                </div>
                <div className="box-body">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', width: '50px' }} onClick={() => requestSort('no')}>
                                        No {getSortIcon('no')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'left', verticalAlign: 'middle' }} onClick={() => requestSort('jenisKemampuan')}>
                                        Jenis Kemampuan {getSortIcon('jenisKemampuan')}
                                    </th>
                                    <th colSpan="4" style={{ textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(78,115,223,0.1)' }}>
                                        Tingkat Kepuasan Pengguna (%)
                                    </th>
                                    <th style={{ textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        Kepuasan
                                    </th>
                                </tr>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(28,200,138,0.1)' }} onClick={() => requestSort('sangatBaik')}>
                                        Sangat Baik {getSortIcon('sangatBaik')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(54,185,204,0.1)' }} onClick={() => requestSort('baik')}>
                                        Baik {getSortIcon('baik')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(246,194,62,0.1)' }} onClick={() => requestSort('cukup')}>
                                        Cukup {getSortIcon('cukup')}
                                    </th>
                                    <th style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', background: 'rgba(231,74,59,0.1)' }} onClick={() => requestSort('kurang')}>
                                        Kurang {getSortIcon('kurang')}
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((item, index) => {
                                    const total = item.sangatBaik + item.baik + item.cukup + item.kurang;

                                    // Calculate Likert score
                                    const likertScore = total > 0
                                        ? ((item.sangatBaik * 4) + (item.baik * 3) + (item.cukup * 2) + (item.kurang * 1)) / total
                                        : 0;

                                    // Get category
                                    let category = 'Kurang';
                                    if (likertScore >= 3.26) category = 'Sangat Baik';
                                    else if (likertScore >= 2.51) category = 'Baik';
                                    else if (likertScore >= 1.76) category = 'Cukup';

                                    const sangatBaikPct = total > 0 ? ((item.sangatBaik / total) * 100).toFixed(0) : 0;
                                    const baikPct = total > 0 ? ((item.baik / total) * 100).toFixed(0) : 0;
                                    const cukupPct = total > 0 ? ((item.cukup / total) * 100).toFixed(0) : 0;
                                    const kurangPct = total > 0 ? ((item.kurang / total) * 100).toFixed(0) : 0;

                                    return (
                                        <tr key={index}>
                                            <td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                {item.no}
                                            </td>
                                            <td style={{ fontWeight: '500' }}>
                                                {item.jenisKemampuan}
                                            </td>
                                            <td style={{ textAlign: 'center', background: 'rgba(28,200,138,0.05)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span className="status-badge success" style={{ minWidth: '50px' }}>
                                                        {item.sangatBaik}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#1cc88a' }}>{sangatBaikPct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', background: 'rgba(54,185,204,0.05)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span className="status-badge info" style={{ minWidth: '50px' }}>
                                                        {item.baik}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#36b9cc' }}>{baikPct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', background: 'rgba(246,194,62,0.05)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span className="status-badge warning" style={{ minWidth: '50px' }}>
                                                        {item.cukup}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#f6c23e' }}>{cukupPct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', background: 'rgba(231,74,59,0.05)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span className="status-badge danger" style={{ minWidth: '50px' }}>
                                                        {item.kurang}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#e74a3b' }}>{kurangPct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{
                                                        background: likertScore >= 3.26 ? 'linear-gradient(135deg, #1cc88a 0%, #13855c 100%)' :
                                                            likertScore >= 2.51 ? 'linear-gradient(135deg, #36b9cc 0%, #258391 100%)' :
                                                                likertScore >= 1.76 ? 'linear-gradient(135deg, #f6c23e 0%, #dda20a 100%)' :
                                                                    'linear-gradient(135deg, #e74a3b 0%, #be2617 100%)',
                                                        color: 'white',
                                                        padding: '6px 14px',
                                                        borderRadius: '20px',
                                                        fontWeight: '700',
                                                        display: 'inline-block',
                                                        minWidth: '65px',
                                                        fontSize: '1rem'
                                                    }}>
                                                        {likertScore.toFixed(2)}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--secondary)' }}>
                                                        {category}
                                                    </span>
                                                </div>
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
                            Menampilkan {sortedData.length} jenis kemampuan | Sample Size: {stats.sampleSize}
                        </span>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                            <span><span className="status-badge success" style={{ padding: '3px 8px' }}>Sangat Baik</span> Kepuasan sangat tinggi</span>
                            <span><span className="status-badge info" style={{ padding: '3px 8px' }}>Baik</span> Kepuasan tinggi</span>
                            <span><span className="status-badge warning" style={{ padding: '3px 8px' }}>Cukup</span> Kepuasan sedang</span>
                            <span><span className="status-badge danger" style={{ padding: '3px 8px' }}>Kurang</span> Perlu perbaikan</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
