// ========================================
// Sitasi Content Component
// ========================================
const SitasiContent = () => {
    return (
        <div className="content fade-in">
            <div className="breadcrumb-wrapper">
                <h1 className="page-title">Sitasi</h1>
                <div className="breadcrumb">
                    <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = 'dashboard'; }}>Dashboard</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Sitasi</span>
                </div>
            </div>

            <div className="box">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-quote-right"></i> Data Sitasi</h3>
                </div>
                <div className="box-body">
                    <div className="coming-soon-container" style={{ padding: '80px 0', textAlign: 'center' }}>
                        <div className="coming-soon-icon" style={{ fontSize: '4rem', color: 'var(--secondary)', opacity: '0.5', marginBottom: '20px' }}>
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <h2 style={{ color: 'var(--dark)' }}>Analisis Sitasi Segera Hadir</h2>
                        <p style={{ color: 'var(--secondary)', maxWidth: '600px', margin: '10px auto' }}>
                            Modul ini akan menampilkan metrik sitasi dari Scopus, Google Scholar, dan WoS untuk Dosen dan Mahasiswa.
                            Data sedang dalam tahap integrasi.
                        </p>
                        <div style={{ marginTop: '30px' }}>
                            <span className="status-badge warning" style={{ fontSize: '0.9rem', padding: '8px 15px' }}>
                                <i className="fas fa-tools"></i> Dalam Pengembangan
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
