// ========================================
// Sitasi Sulvariany Content Component
// ========================================
const SitasiSulvarianyContent = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCitations: 0,
        totalPapers: 0,
        hIndex: 0,
        maxCitationsYear: 0
    });
    const [processedTableData, setProcessedTableData] = useState([]);

    // Step 2: Add State for Sorting and Resizing
    const [sortConfig, setSortConfig] = useState({ key: 'total', direction: 'desc' });
    const [colWidths, setColWidths] = useState({
        no: 50,
        title: 500,
        y2025: 80,
        y2024: 80,
        y2023: 80,
        y2022: 80,
        y2021: 80,
        total: 100
    });

    useEffect(() => {
        fetch('Sitasi/13_Sulvariany.json')
            .then(response => response.json())
            .then(jsonData => {
                setData(jsonData);
                calculateStats(jsonData);
                processTableData(jsonData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                setLoading(false);
            });
    }, []);

    const calculateStats = (jsonData) => {
        const papersMap = {};
        const yearMap = {};

        jsonData.forEach(item => {
            if (!papersMap[item.title]) papersMap[item.title] = 0;
            papersMap[item.title] += item.citations;

            if (!yearMap[item.year]) yearMap[item.year] = 0;
            yearMap[item.year] += item.citations;
        });

        const papers = Object.keys(papersMap).map(title => ({
            title,
            count: papersMap[title]
        }));

        const sortedPapers = [...papers].sort((a, b) => b.count - a.count);
        let hIndex = 0;
        for (let i = 0; i < sortedPapers.length; i++) {
            if (sortedPapers[i].count >= i + 1) {
                hIndex = i + 1;
            } else {
                break;
            }
        }

        const totalCitations = jsonData.reduce((sum, item) => sum + item.citations, 0);
        const maxCitationsYear = Math.max(...Object.values(yearMap));

        setStats({
            totalCitations,
            totalPapers: papers.length,
            hIndex,
            maxCitationsYear
        });
    };

    const processTableData = (jsonData) => {
        const papersMap = {};

        jsonData.forEach(item => {
            if (!papersMap[item.title]) {
                papersMap[item.title] = {
                    title: item.title,
                    y2025: 0, y2024: 0, y2023: 0, y2022: 0, y2021: 0,
                    total: 0
                };
            }

            // Map specific years
            if (item.year === 2025) papersMap[item.title].y2025 += item.citations;
            if (item.year === 2024) papersMap[item.title].y2024 += item.citations;
            if (item.year === 2023) papersMap[item.title].y2023 += item.citations;
            if (item.year === 2022) papersMap[item.title].y2022 += item.citations;
            if (item.year === 2021) papersMap[item.title].y2021 += item.citations;

            // Accumulate Total (Only for 2021-2025)
            if (item.year >= 2021 && item.year <= 2025) {
                papersMap[item.title].total += item.citations;
            }
        });

        setProcessedTableData(Object.values(papersMap));
    };

    // Sorting Logic
    const sortedTableData = React.useMemo(() => {
        let sorted = [...processedTableData];
        if (sortConfig.key) {
            sorted.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Case insensitive string sort for title
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sorted;
    }, [processedTableData, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Resizing Logic
    const startResize = (e, key) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startWidth = colWidths[key];

        const onMouseMove = (moveEvent) => {
            const currentX = moveEvent.clientX;
            const diff = currentX - startX;
            setColWidths(prev => ({
                ...prev,
                [key]: Math.max(30, startWidth + diff)
            }));
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const renderResizer = (key) => (
        <div
            style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: '5px',
                cursor: 'col-resize', zIndex: 10, touchAction: 'none'
            }}
            onMouseDown={(e) => startResize(e, key)}
            onClick={(e) => e.stopPropagation()}
        />
    );

    const getChartData = () => {
        const yearMap = {};
        data.forEach(item => {
            if (!yearMap[item.year]) yearMap[item.year] = 0;
            yearMap[item.year] += item.citations;
        });

        const years = Object.keys(yearMap).sort();
        const yearCounts = years.map(y => yearMap[y]);

        const lineChartData = {
            labels: years,
            datasets: [{
                label: 'Jumlah Sitasi per Tahun',
                data: yearCounts,
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78, 115, 223, 0.1)',
                tension: 0.3,
                fill: true
            }]
        };

        const sortedPapers = [...processedTableData]
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        const barChartData = {
            labels: sortedPapers.map(p => p.title.length > 50 ? p.title.substring(0, 50) + '...' : p.title),
            datasets: [{
                label: 'Top 5 Publikasi',
                data: sortedPapers.map(p => p.total),
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
                borderRadius: 5
            }]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    display: true,
                    align: 'top',
                    anchor: 'start',
                    color: '#4e73df',
                    font: { weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [2, 2] },
                    suggestedMax: Math.max(...yearCounts) + 2 // Add space for labels
                },
                x: { grid: { display: false } }
            }
        };

        const barOptions = {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'end',
                    color: '#555',
                    font: { weight: 'bold' }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { display: false }
                }
            }
        }

        return { lineChartData, barChartData, chartOptions, barOptions };
    };

    if (loading) return <div className="spinner"></div>;

    const { lineChartData, barChartData, chartOptions, barOptions } = getChartData();

    // Sticky Header Style Helper
    const thStyle = (width, key) => ({
        width: `${width}px`,
        minWidth: `${width}px`,
        padding: '12px 15px',
        textAlign: key === 'title' ? 'left' : 'center',
        background: '#f8f9fc',
        color: '#5a5c69',
        fontWeight: 'bold',
        borderBottom: '2px solid #e3e6f0',
        cursor: 'pointer',
        position: 'relative',
        userSelect: 'none'
    });

    const tdStyle = (width, key) => ({
        width: `${width}px`,
        minWidth: `${width}px`,
        textAlign: key === 'title' ? 'left' : 'center',
        padding: '10px 15px',
        borderBottom: '1px solid #e3e6f0',
        whiteSpace: key === 'title' ? 'normal' : 'nowrap'
    });

    return (
        <div className="content fade-in">
            <div className="breadcrumb-wrapper">
                <h1 className="page-title">Sitasi - Sulvariany</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = 'dashboard'; }}>Dashboard</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Sitasi</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Sulvariany</span>
                </div>
            </div>

            <div className="stat-cards">
                <StatCard title="Total Sitasi" value={stats.totalCitations} icon="fas fa-quote-right" color="primary" />
                <StatCard title="Total Publikasi" value={stats.totalPapers} icon="fas fa-file-alt" color="success" />
                <StatCard title="H-Index" value={stats.hIndex} icon="fas fa-trophy" color="warning" />
                <StatCard title="Sitasi Tertinggi (Year)" value={stats.maxCitationsYear} icon="fas fa-chart-line" color="info" />
            </div>

            <div className="row">
                <div className="col col-8">
                    <div className="box">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-chart-area"></i> Tren Sitasi per Tahun</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container">
                                <ChartComponent type="line" data={lineChartData} options={chartOptions} id="lineChartSulvariany" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col col-4">
                    <div className="box">
                        <div className="box-header">
                            <h3 className="box-title"><i className="fas fa-list-ol"></i> Top Publikasi</h3>
                        </div>
                        <div className="box-body">
                            <div className="chart-container">
                                <ChartComponent type="bar" data={barChartData} options={barOptions} id="barChartSulvariany" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="box">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-table"></i> Daftar Publikasi & Sitasi</h3>
                </div>
                <div className="box-body">
                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                        <table style={{ minWidth: '1000px', width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle(colWidths.no, 'no')} onClick={() => requestSort('id')}>
                                        No <i className="fas fa-sort" style={{ marginLeft: '5px', opacity: 0.5 }}></i>
                                        {renderResizer('no')}
                                    </th>
                                    <th style={thStyle(colWidths.title, 'title')} onClick={() => requestSort('title')}>
                                        Judul Publikasi <i className="fas fa-sort" style={{ marginLeft: '5px', opacity: 0.5 }}></i>
                                        {renderResizer('title')}
                                    </th>
                                    <th style={thStyle(colWidths.y2025, 'y2025')} onClick={() => requestSort('y2025')}>
                                        2025 <i className="fas fa-sort" style={{ marginLeft: '5px', opacity: 0.5 }}></i>
                                        {renderResizer('y2025')}
                                    </th>
                                    <th style={thStyle(colWidths.y2024, 'y2024')} onClick={() => requestSort('y2024')}>
                                        2024 <i className="fas fa-sort" style={{ marginLeft: '5px', opacity: 0.5 }}></i>
                                        {renderResizer('y2024')}
                                    </th>
                                    <th style={thStyle(colWidths.y2023, 'y2023')} onClick={() => requestSort('y2023')}>
                                        2023 <i className="fas fa-sort" style={{ marginLeft: '5px', opacity: 0.5 }}></i>
                                        {renderResizer('y2023')}
                                    </th>
                                    <th style={thStyle(colWidths.y2022, 'y2022')} onClick={() => requestSort('y2022')}>
                                        2022 <i className="fas fa-sort" style={{ marginLeft: '5px', opacity: 0.5 }}></i>
                                        {renderResizer('y2022')}
                                    </th>
                                    <th style={thStyle(colWidths.y2021, 'y2021')} onClick={() => requestSort('y2021')}>
                                        2021 <i className="fas fa-sort" style={{ marginLeft: '5px', opacity: 0.5 }}></i>
                                        {renderResizer('y2021')}
                                    </th>
                                    <th style={thStyle(colWidths.total, 'total')} onClick={() => requestSort('total')}>
                                        Jumlah <i className="fas fa-sort" style={{ marginLeft: '5px', opacity: 0.5 }}></i>
                                        {renderResizer('total')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTableData.map((paper, index) => (
                                    <tr key={index} style={{ background: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <td style={tdStyle(colWidths.no, 'no')}>{index + 1}</td>
                                        <td style={tdStyle(colWidths.title, 'title')}>{paper.title}</td>
                                        <td style={tdStyle(colWidths.y2025, 'y2025')}>{paper.y2025 > 0 ? paper.y2025 : '-'}</td>
                                        <td style={tdStyle(colWidths.y2024, 'y2024')}>{paper.y2024 > 0 ? paper.y2024 : '-'}</td>
                                        <td style={tdStyle(colWidths.y2023, 'y2023')}>{paper.y2023 > 0 ? paper.y2023 : '-'}</td>
                                        <td style={tdStyle(colWidths.y2022, 'y2022')}>{paper.y2022 > 0 ? paper.y2022 : '-'}</td>
                                        <td style={tdStyle(colWidths.y2021, 'y2021')}>{paper.y2021 > 0 ? paper.y2021 : '-'}</td>
                                        <td style={tdStyle(colWidths.total, 'total')}>
                                            <span className="status-badge primary" style={{ fontSize: '0.9rem' }}>{paper.total}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
