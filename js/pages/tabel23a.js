// Portal Component for Modal
const ModalPortal = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
};


// ========================================
// Tabel 23a Content - Layout Updated with Modal
// ========================================
const Tabel23aContent = () => {
    const [penelitianData, setPenelitianData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [isJudulWrapped, setIsJudulWrapped] = useState(true);

    // Column Resizing State
    const [colWidths, setColWidths] = useState({
        no: 50, judul: 340, tahun: 100, sumberDana: 150, jenisPublikasi: 150,
        mhs: 110
    });



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

    // Load JSON data
    useEffect(() => {
        fetch('Tabel_23a.json')
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    no: item["0"] || '',
                    luaranPenelitian: item["1"] || '',
                    tahun: item["2"] || '',
                    keterangan: item["3"] || '',
                    perguruanTinggi: item["4"] || 0,
                    mandiri: item["5"] || 0,
                    lembagaDalamNegeri: item["6"] || 0,
                    lembagaLuarNegeri: item["7"] || 0,
                    jurnalNasionalTidakTerakreditasi: item["8"] || 0,
                    jurnalNasionalTerakreditasi: item["9"] || 0,
                    jurnalInternasional: item["10"] || 0,
                    jurnalInternasionalBereputasi: item["11"] || 0,
                    seminarWilayah: item["12"] || 0,
                    seminarNasional: item["13"] || 0,
                    seminarInternasional: item["14"] || 0,
                    mediaMassaWilayah: item["15"] || 0,
                    mediaMassaNasional: item["16"] || 0,
                    mediaMassaInternasional: item["17"] || 0,
                    pagelaranWilayah: item["18"] || 0,
                    pagelaranNasional: item["19"] || 0,
                    pagelaranInternasional: item["20"] || 0,
                    pelibatanMahasiswa: item["21"] || 0
                }));
                // Filter out empty rows if any
                setPenelitianData(formattedData.filter(d => d.no));
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                setLoading(false);
            });
    }, []);

    // Statistics Calculation
    const stats = React.useMemo(() => {
        let counts = {
            jurnalNasionalTidakTerakreditasi: 0,
            jurnalNasionalTerakreditasi: 0,
            jurnalInternasional: 0,
            jurnalInternasionalBereputasi: 0,
            seminarWilayah: 0,
            seminarNasional: 0,
            seminarInternasional: 0,
            mediaMassaWilayah: 0,
            mediaMassaNasional: 0,
            mediaMassaInternasional: 0,
            pagelaranWilayah: 0,
            pagelaranNasional: 0,
            pagelaranInternasional: 0,
            pelibatanMahasiswa: 0
        };

        let totalJurnal = 0, totalSeminar = 0, totalMedia = 0, totalPagelaran = 0;
        let fundPT = 0, fundMandiri = 0, fundDN = 0, fundLN = 0;

        penelitianData.forEach(d => {
            if (d.jurnalNasionalTidakTerakreditasi > 0) { counts.jurnalNasionalTidakTerakreditasi++; totalJurnal++; }
            if (d.jurnalNasionalTerakreditasi > 0) { counts.jurnalNasionalTerakreditasi++; totalJurnal++; }
            if (d.jurnalInternasional > 0) { counts.jurnalInternasional++; totalJurnal++; }
            if (d.jurnalInternasionalBereputasi > 0) { counts.jurnalInternasionalBereputasi++; totalJurnal++; }

            if (d.seminarWilayah > 0) { counts.seminarWilayah++; totalSeminar++; }
            if (d.seminarNasional > 0) { counts.seminarNasional++; totalSeminar++; }
            if (d.seminarInternasional > 0) { counts.seminarInternasional++; totalSeminar++; }

            if (d.mediaMassaWilayah > 0) { counts.mediaMassaWilayah++; totalMedia++; }
            if (d.mediaMassaNasional > 0) { counts.mediaMassaNasional++; totalMedia++; }
            if (d.mediaMassaInternasional > 0) { counts.mediaMassaInternasional++; totalMedia++; }

            if (d.pagelaranWilayah > 0) { counts.pagelaranWilayah++; totalPagelaran++; }
            if (d.pagelaranNasional > 0) { counts.pagelaranNasional++; totalPagelaran++; }
            if (d.pagelaranInternasional > 0) { counts.pagelaranInternasional++; totalPagelaran++; }

            if (d.perguruanTinggi > 0) fundPT++;
            if (d.mandiri > 0) fundMandiri++;
            if (d.lembagaDalamNegeri > 0) fundDN++;
            if (d.lembagaLuarNegeri > 0) fundLN++;

            if (parseInt(d.pelibatanMahasiswa) === 1) counts.pelibatanMahasiswa++;
        });

        return {
            totalLuaran: penelitianData.length,
            totalPublikasi: totalJurnal + totalSeminar + totalMedia + totalPagelaran,
            ...counts,
            totalJurnal, totalSeminar, totalMedia, totalPagelaran,
            fundPT, fundMandiri, fundDN, fundLN
        };
    }, [penelitianData]);

    // Sorting
    const sortedData = React.useMemo(() => {
        let data = [...penelitianData];
        if (sortConfig.key) {
            data.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Smart sort for numbers (specifically 'no' column)
                if (sortConfig.key === 'no') {
                    const numA = parseInt(aValue);
                    const numB = parseInt(bValue);
                    if (!isNaN(numA) && !isNaN(numB)) {
                        aValue = numA;
                        bValue = numB;
                    }
                }

                // Custom Sort for 'Sumber Dana' (sumberDana)
                if (sortConfig.key === 'sumberDana') {
                    const getDanaLabel = (item) => {
                        if (item.mandiri > 0) return 'Mandiri';
                        if (item.perguruanTinggi > 0) return 'PT';
                        if (item.lembagaDalamNegeri > 0) return 'DN';
                        if (item.lembagaLuarNegeri > 0) return 'LN';
                        return '';
                    };
                    aValue = getDanaLabel(a);
                    bValue = getDanaLabel(b);
                }

                // Custom Sort for 'Jenis Publikasi' (jenisPublikasi)
                if (sortConfig.key === 'jenisPublikasi') {
                    const getPublikasiLabel = (item) => {
                        if (item.jurnalNasionalTidakTerakreditasi > 0) return 'J. Nas (Non)';
                        if (item.jurnalNasionalTerakreditasi > 0) return 'J. Nas (Acc)';
                        if (item.jurnalInternasional > 0) return 'J. Intl';
                        if (item.jurnalInternasionalBereputasi > 0) return 'J. Intl (Rep)';
                        if (item.seminarWilayah > 0) return 'Sem. Wil';
                        if (item.seminarNasional > 0) return 'Sem. Nas';
                        if (item.seminarInternasional > 0) return 'Sem. Intl';
                        if (item.mediaMassaWilayah > 0) return 'Med. Wil';
                        if (item.mediaMassaNasional > 0) return 'Med. Nas';
                        if (item.mediaMassaInternasional > 0) return 'Med. Intl';
                        if (item.pagelaranWilayah > 0) return 'Pag. Wil';
                        if (item.pagelaranNasional > 0) return 'Pag. Nas';
                        if (item.pagelaranInternasional > 0) return 'Pag. Intl';
                        return '';
                    };
                    aValue = getPublikasiLabel(a);
                    bValue = getPublikasiLabel(b);
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [penelitianData, sortConfig]);

    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, title: '', content: '' });

    // ... existing resize state ...

    // ... existing methods ...

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const definitions = {
        'J. Nas (Non)': 'Jurnal Nasional Tidak Terakreditasi',
        'J. Nas (Acc)': 'Jurnal Nasional Terakreditasi',
        'J. Intl': 'Jurnal Internasional',
        'J. Intl (Rep)': 'Jurnal Internasional Bereputasi',
        'Sem. Wil': 'Seminar Wilayah/Lokal',
        'Sem. Nas': 'Seminar Nasional',
        'Sem. Intl': 'Seminar Internasional',
        'Med. Wil': 'Tulisan di Media Massa Wilayah',
        'Med. Nas': 'Tulisan di Media Massa Nasional',
        'Med. Intl': 'Tulisan di Media Massa Internasional',
        'Pag. Wil': 'Pagelaran/Pameran/Presentasi Wilayah',
        'Pag. Nas': 'Pagelaran/Pameran/Presentasi Nasional',
        'Pag. Intl': 'Pagelaran/Pameran/Presentasi Internasional'
    };

    const handleBadgeHover = (e, label) => {
        const rect = e.target.getBoundingClientRect();
        const fullText = definitions[label] || label;

        // Calculate position (to the right of the element)
        let x = rect.right + 10;
        let y = rect.top + (rect.height / 2); // Center vertically

        // Adjust if too close to right edge
        if (x + 250 > window.innerWidth) {
            x = rect.left - 260; // Move to left side
        }

        setTooltip({
            show: true,
            x,
            y,
            title: label,
            content: fullText
        });
    };

    const handleBadgeLeave = () => {
        setTooltip(prev => ({ ...prev, show: false }));
    };

    // Chart Options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { borderDash: [2, 2] } },
            x: { grid: { display: false } }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: { position: 'right', labels: { boxWidth: 10, usePointStyle: true } }
        }
    };

    // Component Styles
    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: isTableModalOpen ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999, // Ensure it's on top of everything
        backdropFilter: 'blur(3px)'
    };

    const modalContentStyle = {
        backgroundColor: '#fff',
        width: '95%',
        height: '90%',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideIn 0.3s ease-out',
        position: 'relative', // Ensure relative positioning context
        zIndex: 100000 // Higher than overlay
    };

    const tooltipStyle = {
        position: 'fixed',
        left: tooltip.x,
        top: tooltip.y,
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
        zIndex: 100002,
        pointerEvents: 'none',
        borderLeft: '4px solid #4e73df',
        maxWidth: '250px',
        opacity: tooltip.show ? 1 : 0,
        visibility: tooltip.show ? 'visible' : 'hidden',
        transition: 'opacity 0.2s ease, visibility 0.2s',
        fontSize: '0.9rem',
        color: '#333'
    };

    const modalHeaderStyle = {
        padding: '15px 20px',
        borderBottom: '1px solid #e3e6f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8f9fc'
    };

    const modalBodyStyle = {
        flex: 1,
        overflow: 'hidden',
        padding: '0',
        position: 'relative'
    };

    const tableWrapperStyle = {
        width: '100%',
        height: '100%',
        overflowX: 'auto',
        overflowY: 'auto'
    };

    // Sticky column style helper
    const stickyStyle = (left, zIndex, extraStyles = {}) => ({
        position: 'sticky',
        left: left,
        zIndex: zIndex,
        background: '#fff',
        borderRight: '2px solid #e3e6f0',
        ...extraStyles
    });

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="content fade-in">
            <div className="breadcrumb-wrapper">
                <h1 className="page-title">DKPS - Tabel 23a</h1>
                <div className="breadcrumb">
                    <span>DKPS</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Tabel 23a</span>
                </div>
            </div>

            <div className="alert info">
                <i className="fas fa-info-circle"></i>
                <span>Visualisasi Data Luaran Penelitian & Pengabdian Masyarakat.</span>
            </div>

            {/* Grid for Charts */}
            <div className="tabel23a-charts-row">
                <div className="tabel23a-col-side" style={{ flex: '0 0 100%', maxWidth: '100%', marginBottom: '20px' }}>
                    <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                        {[
                            { title: 'Jurnal Nasional Tidak Terakreditasi', value: stats.jurnalNasionalTidakTerakreditasi, icon: 'fas fa-book', color: 'secondary' },
                            { title: 'Jurnal Nasional Terakreditasi', value: stats.jurnalNasionalTerakreditasi, icon: 'fas fa-check-circle', color: 'info' },
                            { title: 'Jurnal Internasional', value: stats.jurnalInternasional, icon: 'fas fa-globe-asia', color: 'primary' },
                            { title: 'Jurnal Internasional Bereputasi', value: stats.jurnalInternasionalBereputasi, icon: 'fas fa-star', color: 'success' },

                            { title: 'Seminar Wilayah/Lokal/Perguruan Tinggi', value: stats.seminarWilayah, icon: 'fas fa-map-marker-alt', color: 'warning' },
                            { title: 'Seminar Nasional', value: stats.seminarNasional, icon: 'fas fa-flag', color: 'warning' },
                            { title: 'Seminar Internasional', value: stats.seminarInternasional, icon: 'fas fa-globe', color: 'warning' },

                            { title: 'Tulisan di Media Massa Wilayah', value: stats.mediaMassaWilayah, icon: 'fas fa-newspaper', color: 'danger' },
                            { title: 'Tulisan di Media Massa Nasional', value: stats.mediaMassaNasional, icon: 'fas fa-newspaper', color: 'danger' },
                            { title: 'Tulisan di Media Massa Internasional', value: stats.mediaMassaInternasional, icon: 'fas fa-newspaper', color: 'danger' },

                            { title: 'Pagelaran/Pameran/Presentasi Wilayah', value: stats.pagelaranWilayah, icon: 'fas fa-theater-masks', color: 'secondary' },
                            { title: 'Pagelaran/Pameran/Presentasi Nasional', value: stats.pagelaranNasional, icon: 'fas fa-theater-masks', color: 'secondary' },
                            { title: 'Pagelaran/Pameran/Presentasi Internasional', value: stats.pagelaranInternasional, icon: 'fas fa-theater-masks', color: 'secondary' },

                            { title: 'Pelibatan Mahasiswa', value: stats.pelibatanMahasiswa, icon: 'fas fa-user-graduate', color: 'info' }
                        ].filter(item => item.value > 0).map((card, idx) => (
                            <StatCard key={idx} title={card.title} value={card.value} icon={card.icon} color={card.color} />
                        ))}

                        {/* Button to Open Table Modal */}
                        <div className="card fade-in" style={{ cursor: 'pointer', background: 'var(--primary)', color: '#fff' }} onClick={() => setIsTableModalOpen(true)}>
                            <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <i className="fas fa-table" style={{ fontSize: '1.5rem', marginBottom: '5px' }}></i>
                                    <div style={{ fontWeight: '600' }}>Lihat Tabel Lengkap</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tabel23a-col-main">
                    <div className="tabel23a-chart-box">
                        <h4 style={{ fontSize: '1rem', marginBottom: '15px' }}>Distribusi Jenis Publikasi</h4>
                        <div className="tabel23a-chart-container">
                            <ChartComponent
                                type="bar"
                                id="chartPublikasi"
                                data={{
                                    labels: ['Jurnal', 'Seminar', 'Media', 'Pagelaran'],
                                    datasets: [{
                                        label: 'Jumlah',
                                        data: [stats.totalJurnal, stats.totalSeminar, stats.totalMedia, stats.totalPagelaran],
                                        backgroundColor: ['#4e73df', '#36b9cc', '#f6c23e', '#e74a3b'],
                                        borderRadius: 5
                                    }]
                                }}
                                options={chartOptions}
                            />
                        </div>
                    </div>
                </div>

                <div className="tabel23a-col-side">
                    <div className="tabel23a-chart-box">
                        <h4 style={{ fontSize: '1rem', marginBottom: '15px' }}>Sumber Dana</h4>
                        <div className="tabel23a-chart-container" style={{ height: '250px' }}>
                            <ChartComponent
                                type="doughnut"
                                id="chartDana"
                                data={{
                                    labels: ['Mandiri', 'PT', 'DN', 'LN'],
                                    datasets: [{
                                        data: [stats.fundMandiri, stats.fundPT, stats.fundDN, stats.fundLN],
                                        backgroundColor: ['#1cc88a', '#4e73df', '#36b9cc', '#f6c23e'],
                                        borderWidth: 0
                                    }]
                                }}
                                options={doughnutOptions}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL PORTAL */}
            {isTableModalOpen && (
                <ModalPortal>
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <div style={modalHeaderStyle}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#4e73df' }}>
                                    <i className="fas fa-table"></i> Data Luaran Penelitian ({stats.totalLuaran})
                                </h3>
                                <button
                                    onClick={() => setIsTableModalOpen(false)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        color: '#aaa',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.target.style.background = '#eee'; e.target.style.color = '#333'; }}
                                    onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#aaa'; }}
                                >
                                    &times;
                                </button>
                            </div>
                            <div style={modalBodyStyle}>
                                <div style={tableWrapperStyle} className="custom-scrollbar">
                                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, whiteSpace: 'nowrap' }}>
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 50 }}>
                                            <tr style={{ background: '#f8f9fc', color: '#5a5c69', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', boxShadow: '0 2px 2px rgba(0,0,0,0.05)' }}>
                                                <th rowSpan="2" style={{ ...stickyStyle(0, 60, { background: '#eef2fd', verticalAlign: 'middle' }), width: `${colWidths.no}px`, minWidth: `${colWidths.no}px`, padding: '15px', borderBottom: '2px solid #e3e6f0', cursor: 'pointer' }} onClick={() => requestSort('no')}>
                                                    No <i className="fas fa-sort" style={{ marginLeft: '5px' }}></i>
                                                    {renderResizer('no')}
                                                </th>
                                                <th rowSpan="2" style={{ ...stickyStyle(`${colWidths.no}px`, 60, { background: '#eef2fd', verticalAlign: 'middle' }), width: `${colWidths.judul}px`, minWidth: `${colWidths.judul}px`, padding: '15px', borderBottom: '2px solid #e3e6f0' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <span onClick={() => requestSort('luaranPenelitian')} style={{ cursor: 'pointer' }}>
                                                            Judul Luaran <i className="fas fa-sort" style={{ marginLeft: '5px' }}></i>
                                                        </span>
                                                        <i
                                                            className={`fas fa-${isJudulWrapped ? 'align-justify' : 'align-left'}`}
                                                            onClick={(e) => { e.stopPropagation(); setIsJudulWrapped(!isJudulWrapped); }}
                                                            style={{ cursor: 'pointer', marginLeft: '10px', fontSize: '0.8rem', color: isJudulWrapped ? '#4e73df' : '#aaa' }}
                                                            title={isJudulWrapped ? "Matikan Wrap Text" : "Aktifkan Wrap Text"}
                                                        ></i>
                                                    </div>
                                                    {renderResizer('judul')}
                                                </th>
                                                <th rowSpan="2" style={{ width: `${colWidths.tahun}px`, minWidth: `${colWidths.tahun}px`, padding: '15px', textAlign: 'center', background: '#eef2fd', borderBottom: '2px solid #e3e6f0', position: 'relative', verticalAlign: 'middle' }}>
                                                    Tahun
                                                    {renderResizer('tahun')}
                                                </th>
                                                <th rowSpan="2" style={{ width: `${colWidths.sumberDana}px`, minWidth: `${colWidths.sumberDana}px`, textAlign: 'center', background: '#eef2fd', padding: '15px', borderBottom: '2px solid #e3e6f0', verticalAlign: 'middle', position: 'relative', cursor: 'pointer' }} onClick={() => requestSort('sumberDana')}>
                                                    Sumber Dana <i className="fas fa-sort" style={{ marginLeft: '5px' }}></i>
                                                    {renderResizer('sumberDana')}
                                                </th>
                                                <th rowSpan="2" style={{ width: `${colWidths.jenisPublikasi}px`, minWidth: `${colWidths.jenisPublikasi}px`, textAlign: 'center', background: '#e6fffa', padding: '15px', borderBottom: '2px solid #e3e6f0', verticalAlign: 'middle', position: 'relative', cursor: 'pointer' }} onClick={() => requestSort('jenisPublikasi')}>
                                                    Jenis Publikasi <i className="fas fa-sort" style={{ marginLeft: '5px' }}></i>
                                                    {renderResizer('jenisPublikasi')}
                                                </th>
                                                <th rowSpan="2" style={{ width: `${colWidths.mhs}px`, minWidth: `${colWidths.mhs}px`, padding: '15px', textAlign: 'center', background: 'rgba(246,194,62,0.1)', borderBottom: '2px solid #e3e6f0', verticalAlign: 'middle', position: 'relative' }}>
                                                    Melibatkan Mhs
                                                    {renderResizer('mhs')}
                                                </th>
                                            </tr>

                                        </thead>
                                        <tbody>
                                            {sortedData.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ ...stickyStyle(0, 40), width: `${colWidths.no}px`, minWidth: `${colWidths.no}px`, padding: '12px', textAlign: 'center', fontSize: '0.85rem' }}>{item.no}</td>
                                                    <td style={{ ...stickyStyle(`${colWidths.no}px`, 40), width: `${colWidths.judul}px`, minWidth: `${colWidths.judul}px`, padding: '12px', whiteSpace: isJudulWrapped ? 'normal' : 'nowrap', fontSize: '0.85rem' }}>
                                                        {item.luaranPenelitian}
                                                        {item.keterangan && <a href={item.keterangan} target="_blank" style={{ marginLeft: '5px' }}><i className="fas fa-external-link-alt"></i></a>}
                                                    </td>
                                                    <td style={{ textAlign: 'center', padding: '10px' }}>{item.tahun}</td>


                                                    {/* Dana - Combined Column */}
                                                    <td style={{ textAlign: 'center', padding: '10px' }}>
                                                        {item.mandiri > 0 ? <span className="status-badge success">Mandiri</span> :
                                                            item.perguruanTinggi > 0 ? <span className="status-badge primary">PT</span> :
                                                                item.lembagaDalamNegeri > 0 ? <span className="status-badge info">DN</span> :
                                                                    item.lembagaLuarNegeri > 0 ? <span className="status-badge warning">LN</span> :
                                                                        '-'}
                                                    </td>

                                                    {/* Jenis Publikasi - Combined Column */}
                                                    <td style={{ textAlign: 'center', padding: '10px' }}>
                                                        {item.jurnalNasionalTidakTerakreditasi > 0 ? <span className="status-badge secondary" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'J. Nas (Non)')} onMouseLeave={handleBadgeLeave}>J. Nas (Non)</span> :
                                                            item.jurnalNasionalTerakreditasi > 0 ? <span className="status-badge info" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'J. Nas (Acc)')} onMouseLeave={handleBadgeLeave}>J. Nas (Acc)</span> :
                                                                item.jurnalInternasional > 0 ? <span className="status-badge primary" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'J. Intl')} onMouseLeave={handleBadgeLeave}>J. Intl</span> :
                                                                    item.jurnalInternasionalBereputasi > 0 ? <span className="status-badge success" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'J. Intl (Rep)')} onMouseLeave={handleBadgeLeave}>J. Intl (Rep)</span> :
                                                                        item.seminarWilayah > 0 ? <span className="status-badge warning" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'Sem. Wil')} onMouseLeave={handleBadgeLeave}>Sem. Wil</span> :
                                                                            item.seminarNasional > 0 ? <span className="status-badge warning" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'Sem. Nas')} onMouseLeave={handleBadgeLeave}>Sem. Nas</span> :
                                                                                item.seminarInternasional > 0 ? <span className="status-badge warning" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'Sem. Intl')} onMouseLeave={handleBadgeLeave}>Sem. Intl</span> :
                                                                                    item.mediaMassaWilayah > 0 ? <span className="status-badge danger" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'Med. Wil')} onMouseLeave={handleBadgeLeave}>Med. Wil</span> :
                                                                                        item.mediaMassaNasional > 0 ? <span className="status-badge danger" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'Med. Nas')} onMouseLeave={handleBadgeLeave}>Med. Nas</span> :
                                                                                            item.mediaMassaInternasional > 0 ? <span className="status-badge danger" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'Med. Intl')} onMouseLeave={handleBadgeLeave}>Med. Intl</span> :
                                                                                                item.pagelaranWilayah > 0 ? <span className="status-badge secondary" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'Pag. Wil')} onMouseLeave={handleBadgeLeave}>Pag. Wil</span> :
                                                                                                    item.pagelaranNasional > 0 ? <span className="status-badge secondary" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'Pag. Nas')} onMouseLeave={handleBadgeLeave}>Pag. Nas</span> :
                                                                                                        item.pagelaranInternasional > 0 ? <span className="status-badge secondary" style={{ cursor: 'help' }} onMouseEnter={(e) => handleBadgeHover(e, 'Pag. Intl')} onMouseLeave={handleBadgeLeave}>Pag. Intl</span> :
                                                                                                            '-'}
                                                    </td>

                                                    <td style={{ textAlign: 'center', fontWeight: 'bold', padding: '10px' }}>
                                                        {item.pelibatanMahasiswa == '1' ? <i className="fas fa-check" style={{ color: '#1cc88a' }}></i> : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* HOVER TOOLTIP PORTAL */}
            <ModalPortal>
                <div style={tooltipStyle}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                        {tooltip.title}
                    </div>
                    <div>{tooltip.content}</div>
                </div>
            </ModalPortal>
        </div>
    );
};
