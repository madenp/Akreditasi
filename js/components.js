// ========================================
// Reusable Components
// ========================================
const { useState, useEffect, useRef } = React;

// Configure Chart.js - Register and disable datalabels globally
if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
    // Register the plugin
    Chart.register(ChartDataLabels);

    // Disable by default for all charts
    Chart.defaults.set('plugins.datalabels', {
        display: false
    });
}

// Stat Card Component
const StatCard = ({ title, value, icon, color, trend, trendValue }) => {
    return (
        <div className={`stat-card ${color}`}>
            <div className="stat-content">
                <h3>{value}</h3>
                <p>{title}</p>
                {trend && (
                    <div className={`trend ${trend}`}>
                        <i className={`fas fa-arrow-${trend}`}></i>
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
            <div className={`stat-icon ${color}`}>
                <i className={icon}></i>
            </div>
        </div>
    );
};

// Progress Bar Component
const ProgressBar = ({ label, progress, status }) => {
    return (
        <div className="progress-wrapper">
            <div className="progress-label">
                <span>{label}</span>
                <span>{progress}%</span>
            </div>
            <div className="progress-bar">
                <div
                    className={`progress-fill ${status}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

// Chart Component
const ChartComponent = ({ type, data, options, id, plugins }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');

            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const chartConfig = {
                type: type,
                data: data,
                options: options
            };

            // Add plugins if provided
            if (plugins && plugins.length > 0) {
                chartConfig.plugins = plugins;
            }

            chartInstance.current = new Chart(ctx, chartConfig);
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [type, data, options, plugins]);

    return <canvas ref={chartRef} id={id}></canvas>;
};

// Timeline Component
const Timeline = ({ activities }) => {
    return (
        <div className="timeline">
            {activities.map((activity, index) => (
                <div key={index} className={`timeline-item ${activity.status}`}>
                    <div className="timeline-time">{activity.time}</div>
                    <div className="timeline-content">
                        <h4>{activity.title}</h4>
                        <p>{activity.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Data Table Component
const DataTable = ({ data }) => {
    const getStatusClass = (status) => {
        switch (status) {
            case 'Selesai': return 'success';
            case 'Proses': return 'warning';
            case 'Pending': return 'danger';
            default: return 'info';
        }
    };

    return (
        <div className="table-responsive">
            <table className="table">
                <thead>
                    <tr>
                        <th>No. BA</th>
                        <th>Judul</th>
                        <th>Tanggal</th>
                        <th>Kategori</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td><strong>{item.id}</strong></td>
                            <td>{item.judul}</td>
                            <td>{item.tanggal}</td>
                            <td>
                                <span className="status-badge primary">{item.kategori}</span>
                            </td>
                            <td>
                                <span className={`status-badge ${getStatusClass(item.status)}`}>
                                    {item.status}
                                </span>
                            </td>
                            <td>
                                <div className="action-btns">
                                    <button className="action-btn view">
                                        <i className="fas fa-eye"></i>
                                    </button>
                                    <button className="action-btn edit">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="action-btn delete">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
