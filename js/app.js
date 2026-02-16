// ========================================
// Main App Component
// ========================================
const App = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Initialize activeMenu from URL hash or default to 'dashboard'
    const getInitialMenu = () => {
        const hash = window.location.hash.replace('#', '');
        return hash || 'dashboard';
    };

    const [activeMenu, setActiveMenu] = useState(getInitialMenu);

    // Update URL hash when activeMenu changes
    useEffect(() => {
        window.location.hash = activeMenu;
    }, [activeMenu]);

    // Listen for browser back/forward navigation
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && hash !== activeMenu) {
                setActiveMenu(hash);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [activeMenu]);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Render content based on active menu
    const renderContent = () => {
        // Menu name mapping untuk Coming Soon page
        const menuNameMap = {
            'dashboard': 'Dashboard',
            'berita-acara': 'Berita Acara',
            'led': 'LED',
            'lkps': 'LKPS',
            'dokumen': 'Dokumen Pendukung',
            'report': 'Laporan',
            'calendar': 'Kalender',
            'users': 'Tim Akreditasi',
            'settings': 'Pengaturan',
            'orientasi-strategis': 'Orientasi Strategis',
            'standar-2': 'Standar 2 - Tata Kelola',
            'standar-3': 'Standar 3 - Mahasiswa',
            'standar-4': 'Standar 4 - SDM',
            'standar-5': 'Standar 5 - Keuangan',
            'standar-6': 'Standar 6 - Pendidikan',
            'standar-7': 'Standar 7 - Penelitian',
            'standar-8': 'Standar 8 - PkM',
            'standar-9': 'Standar 9 - Luaran'
        };

        switch (activeMenu) {
            case 'tabel-1':
                return <Tabel1Content />;
            case 'tabel-2':
                return <Tabel2Content />;
            case 'tabel-3a':
                return <Tabel3aContent />;
            case 'tabel-4':
                return <Tabel4Content />;
            case 'tabel-5':
                return <Tabel5Content />;
            case 'tabel-7':
                return <Tabel7Content />;
            case 'tabel-9':
                return <Tabel9Content />;
            case 'tabel-13':
                return <Tabel13Content />;
            case 'tabel-15':
                return <Tabel15Content />;
            case 'tabel-16':
                return <Tabel16Content />;
            case 'tabel-17':
                return <Tabel17Content />;
            case 'sitasi-hasbudin':
                return <SitasiHasbudinContent />;
            case 'sitasi-arifuddin':
                return <SitasiArifuddinContent />;
            case 'sitasi-ishak':
                return <SitasiIshakContent />;
            case 'sitasi-laode':
                return <SitasiLaOdeContent />;
            case 'sitasi-nasrullah':
                return <SitasiNasrullahContent />;
            case 'sitasi-husin':
                return <SitasiHusinContent />;
            case 'sitasi-mulyati':
                return <SitasiMulyatiContent />;
            case 'sitasi-muntu':
                return <SitasiMuntuContent />;
            case 'sitasi-emillia':
                return <SitasiEmilliaContent />;
            case 'sitasi-erwin':
                return <SitasiErwinContent />;
            case 'sitasi-nitri':
                return <SitasiNitriContent />;
            case 'sitasi-tuti':
                return <SitasiTutiContent />;
            case 'sitasi-sulvariany':
                return <SitasiSulvarianyContent />;
            case 'sitasi-nurasni':
                return <SitasiNurAsniContent />;
            case 'sitasi-aswati':
                return <SitasiAswatiContent />;
            case 'sitasi-ika':
                return <SitasiIkaContent />;
            case 'sitasi-safaruddin':
                return <SitasiSafaruddinContent />;
            case 'sitasi-santiadji':
                return <SitasiSantiadjiContent />;
            case 'sitasi-yuli':
                return <SitasiYuliContent />;
            case 'sitasi-andi-muh-fuad':
                return <SitasiAndiMuhFuadContent />;
            case 'sitasi-made':
                return <SitasiMadeContent />;
            case 'sitasi-syaiah':
                return <SitasiSyaiahContent />;
            case 'sitasi-hasnidar':
                return <SitasiHasnidarContent />;
            case 'tabel-23a':
                return <Tabel23aContent />;
            case 'tabel-23b':
                return <Tabel23bContent />;
            case 'orientasi-strategis':
                return <OrientasiStrategisContent />;
            case 'dashboard':
                return <DashboardContent />;
            case 'sitasi':
                return <SitasiContent />;
            default:
                // Jika menu tidak ditemukan, tampilkan Coming Soon
                const menuName = menuNameMap[activeMenu] || activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1).replace(/-/g, ' ');
                return <ComingSoonContent menuName={menuName} />;
        }
    };

    return (
        <div className="wrapper">
            <Sidebar
                isCollapsed={sidebarCollapsed}
                toggleSidebar={toggleSidebar}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
            />
            <div className="main-content" style={{ marginLeft: sidebarCollapsed ? '70px' : '260px' }}>
                <Header toggleSidebar={toggleSidebar} />
                {renderContent()}
            </div>
        </div>
    );
};

// ========================================
// Render the App
// ========================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
