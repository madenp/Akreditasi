// ========================================
// Sidebar Component
// ========================================
const Sidebar = ({ isCollapsed, toggleSidebar, activeMenu, setActiveMenu }) => {
    const [openSubmenu, setOpenSubmenu] = useState(null);

    const handleMenuClick = (item) => {
        if (item.submenu) {
            setOpenSubmenu(openSubmenu === item.id ? null : item.id);
        } else {
            setActiveMenu(item.id);
        }
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-brand">
                <h2>AKREDITASI</h2>
                <span className="logo-mini">📋</span>
            </div>
            <nav className="sidebar-nav">
                <div className="nav-section">
                    <span className="nav-section-title">Menu Utama</span>
                    {menuItems.slice(0, 6).map(item => (
                        <div key={item.id} className="nav-item">
                            <div
                                className={`nav-link ${activeMenu === item.id ? 'active' : ''}`}
                                onClick={() => handleMenuClick(item)}
                            >
                                <i className={item.icon}></i>
                                <span>{item.label}</span>
                                {item.badge && <span className="nav-badge">{item.badge}</span>}
                                {item.submenu && (
                                    <i className={`fas fa-chevron-${openSubmenu === item.id ? 'down' : 'right'}`}
                                        style={{ marginLeft: 'auto', fontSize: '0.7rem' }}></i>
                                )}
                            </div>
                            {item.submenu && (
                                <div className={`nav-submenu ${openSubmenu === item.id ? 'open' : ''}`}>
                                    {item.submenu.map(sub => (
                                        <div
                                            key={sub.id}
                                            className={`nav-link ${activeMenu === sub.id ? 'active' : ''}`}
                                            onClick={() => setActiveMenu(sub.id)}
                                        >
                                            <i className="fas fa-circle" style={{ fontSize: '0.4rem' }}></i>
                                            <span>{sub.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="nav-section">
                    <span className="nav-section-title">Lainnya</span>
                    {menuItems.slice(6).map(item => (
                        <div key={item.id} className="nav-item">
                            <div
                                className={`nav-link ${activeMenu === item.id ? 'active' : ''}`}
                                onClick={() => handleMenuClick(item)}
                            >
                                <i className={item.icon}></i>
                                <span>{item.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </nav>
        </aside>
    );
};

// ========================================
// Header Component
// ========================================
const Header = ({ toggleSidebar }) => {
    return (
        <header className="header">
            <div className="header-left">
                <button className="toggle-sidebar" onClick={toggleSidebar}>
                    <i className="fas fa-bars"></i>
                </button>
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Cari berita acara, dokumen..." />
                </div>
            </div>
            <div className="header-right">
                <div className="header-icon">
                    <i className="fas fa-bell"></i>
                    <span className="badge" style={{ display: 'none' }}></span>
                </div>
                <div className="header-icon">
                    <i className="fas fa-envelope"></i>
                    <span className="badge" style={{ display: 'none' }}></span>
                </div>
                <div className="user-profile">
                    <div className="user-avatar">AD</div>
                    <div className="user-info">
                        <div className="user-name">Admin</div>
                        <div className="user-role">Administrator</div>
                    </div>
                </div>
            </div>
        </header>
    );
};
