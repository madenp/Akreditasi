// ========================================
// Orientasi Strategis / Standar 1 Page
// ========================================

const OrientasiStrategisContent = () => {
    // State untuk Modal
    const [modal, setModal] = useState({
        show: false,
        file: null
    });

    // State untuk Files
    const [files, setFiles] = useState([]);
    // State untuk Search
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetch file list from JSON
        fetch('DED/Orientasi Strategis/file_list.json')
            .then(res => res.json())
            .then(data => setFiles(data))
            .catch(err => {
                console.error('Error loading file list:', err);
                // Fallback or empty if error
                setFiles([]);
            });
    }, []);

    // Handle View Click
    const handleView = (file) => {
        setModal({
            show: true,
            file: file
        });
    };

    // Handle Close Modal
    const handleClose = () => {
        setModal({
            show: false,
            file: null
        });
    };

    // Handle Open New Tab
    const handleOpenNewTab = () => {
        if (modal.file) {
            window.open(modal.file.path, '_blank');
        }
    };

    // Filter files based on search term
    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="content">
            <div className="breadcrumb-wrapper">
                <h1 className="page-title">Orientasi Strategis</h1>
                <div className="breadcrumb">
                    <a href="#dashboard">Home</a>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                    <span>Orientasi Strategis</span>
                </div>
            </div>

            <div className="box fade-in">
                <div className="box-header">
                    <h3 className="box-title"><i className="fas fa-folder-open"></i> Dokumen Bukti</h3>
                    <div className="box-tools">
                        <div className="search-box">
                            <i className="fas fa-search" style={{ position: 'absolute', top: '10px', left: '10px', color: '#6c757d' }}></i>
                            <input
                                type="text"
                                placeholder="Cari file..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    paddingLeft: '30px',
                                    borderRadius: '5px',
                                    border: '1px solid #ddd',
                                    padding: '5px 10px 5px 30px'
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="box-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>No</th>
                                    <th>Nama File</th>
                                    <th style={{ width: '100px' }}>Tipe</th>
                                    <th style={{ width: '100px' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFiles.map((file, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <i className="fas fa-file-pdf" style={{ color: '#F40F02', fontSize: '1.2rem' }}></i>
                                                <span>{file.name}</span>
                                            </div>
                                        </td>
                                        <td>{file.type.toUpperCase()}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-info"
                                                onClick={() => handleView(file)}
                                                title="Lihat Dokumen"
                                            >
                                                <i className="fas fa-eye"></i> Lihat
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredFiles.length === 0 && (
                            <div className="text-center p-4 text-muted">
                                Tidak ada dokumen ditemukan.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Viewer */}
            {modal.show && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1050,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.3s'
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        width: '90%',
                        height: '90%',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        animation: 'slideUp 0.3s'
                    }}>
                        <div className="modal-header" style={{
                            padding: '15px 20px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h4 style={{ margin: 0, color: '#333' }}>
                                <i className="fas fa-file-pdf" style={{ marginRight: '10px', color: '#F40F02' }}></i>
                                {modal.file.name}
                            </h4>
                            <button
                                onClick={handleClose}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
                            <iframe
                                src={modal.file.path}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                title="Document Viewer"
                            ></iframe>
                        </div>
                        <div className="modal-footer" style={{
                            padding: '15px 20px',
                            borderTop: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px'
                        }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleOpenNewTab}
                            >
                                <i className="fas fa-external-link-alt"></i> Buka di New Tab
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleClose}
                                style={{ backgroundColor: '#6c757d', color: 'white' }}
                            >
                                <i className="fas fa-times"></i> Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
