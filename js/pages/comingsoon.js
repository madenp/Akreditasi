// ========================================
// Coming Soon Component
// ========================================
const ComingSoonContent = ({ menuName }) => {
    return (
        <div className="content">
            <div className="coming-soon-container">
                <div className="coming-soon-icon">
                    <i className="fas fa-rocket"></i>
                </div>
                <h1 className="coming-soon-title">Coming Soon</h1>
                <p className="coming-soon-subtitle">
                    Halaman <strong>{menuName}</strong> sedang dalam pengembangan
                </p>
                <div className="coming-soon-features">
                    <div className="feature-item">
                        <i className="fas fa-cog fa-spin"></i>
                        <span>Dalam Proses</span>
                    </div>
                    <div className="feature-item">
                        <i className="fas fa-clock"></i>
                        <span>Segera Hadir</span>
                    </div>
                    <div className="feature-item">
                        <i className="fas fa-star"></i>
                        <span>Fitur Lengkap</span>
                    </div>
                </div>
                <p className="coming-soon-message">
                    Kami sedang bekerja keras untuk menghadirkan fitur terbaik untuk Anda.
                    Terima kasih atas kesabarannya!
                </p>
            </div>
        </div>
    );
};
