import React, { useEffect, useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import L from 'leaflet';

window.L = window.L || L;
try { require('leaflet.heat'); } catch (e) { import('leaflet.heat').catch(() => console.log('leaflet.heat fallback handled.')); }

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Map Themes
const THEMES = {
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
};

// Custom Pulsing Markers
const createPulseIcon = (color) => L.divIcon({
    className: 'custom-pulse-icon',
    html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 0 rgba(${color === '#10b981' ? '16, 185, 129' : color === '#f59e0b' ? '245, 158, 11' : '59, 130, 246'}, 0.4); animation: pulse 2s infinite;"></div>`,
    iconSize: [10, 10], iconAnchor: [5, 5]
});
const icons = { active: createPulseIcon('#10b981'), idle: createPulseIcon('#f59e0b'), charging: createPulseIcon('#3b82f6') };

// Heatmap Hook
function HeatmapLayer({ points }) {
    const map = useMap();
    useEffect(() => {
        if (!L.heatLayer) return;
        const heatPoints = points.map(p => [p.lat, p.lng, p.intensity]);
        const heat = L.heatLayer(heatPoints, { radius: 25, blur: 15, maxZoom: 14, gradient: {0.4: 'cyan', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red'} }).addTo(map);
        return () => map.removeLayer(heat);
    }, [map, points]);
    return null;
}

// Ease-out Value Counter
function AnimatedCounter({ value, duration = 1500 }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTimestamp = null;
        let reqId;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutExpo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(easeProgress * value));
            if (progress < 1) reqId = window.requestAnimationFrame(step);
            else setCount(value);
        };
        reqId = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(reqId);
    }, [value, duration]);
    return <>{new Intl.NumberFormat('en-US').format(count)}</>;
}

function UrbanMobilityInsights() {
    const [heatmapData, setHeatmapData] = useState([]);
    const [liveVehicles, setLiveVehicles] = useState([]);
    const [liveRoutes, setLiveRoutes] = useState([]);
    const [mapViewType, setMapViewType] = useState('live'); // 'heatmap' or 'live'
    const [mapTheme, setMapTheme] = useState('dark');
    const [filterDate, setFilterDate] = useState('Today');
    
    // Core NY Coordinates
    const mapCenter = [40.730610, -73.9902];

    const surgeZones = useMemo(() => [
        { center: [40.7505, -73.9839], radius: 1200, color: '#ef4444', label: 'Midtown Surge' },
        { center: [40.7128, -74.0060], radius: 900, color: '#f59e0b', label: 'Financial Dist.' }
    ], []);

    useEffect(() => {
        // Heatmap gen
        const hPoints = Array.from({length: 600}).map(() => ({
            lat: mapCenter[0] + (Math.random() - 0.5) * 0.12,
            lng: mapCenter[1] + (Math.random() - 0.5) * 0.12,
            intensity: Math.random()
        }));
        setHeatmapData(hPoints);

        // Vehicles & Routes gen
        const vehicles = [];
        const routes = [];
        for(let i = 0; i < 40; i++) {
            const lat = mapCenter[0] + (Math.random() - 0.5) * 0.1;
            const lng = mapCenter[1] + (Math.random() - 0.5) * 0.1;
            const statusRand = Math.random();
            const status = statusRand > 0.7 ? 'idle' : statusRand > 0.9 ? 'charging' : 'active';
            
            vehicles.push({ id: `EV-${1000+i}`, lat, lng, status, battery: Math.floor(Math.random() * 80 + 20) });

            if (status === 'active') { // Draw path history for active vehicles
                const path = [[lat, lng]];
                let curLat = lat, curLng = lng;
                for(let step=0; step<5; step++){
                    curLat += (Math.random() - 0.5) * 0.01;
                    curLng += (Math.random() - 0.5) * 0.01;
                    path.push([curLat, curLng]);
                }
                routes.push({ positions: path, color: '#10b981' }); // Green trace
            }
        }
        setLiveVehicles(vehicles);
        setLiveRoutes(routes);
    }, []);

    const kpiData = {
        totalFleet: filterDate === 'Today' ? 1245 : filterDate === 'Last 7 Days' ? 1250 : 1260,
        tripsToday: filterDate === 'Today' ? 8432 : filterDate === 'Last 7 Days' ? 58900 : 252000,
        activeRoutes: 342,
        co2Saved: filterDate === 'Today' ? 2450 : filterDate === 'Last 7 Days' ? 16700 : 72000
    };

    const hourlyData = {
        labels: ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'],
        datasets: [{
            label: 'Rentals',
            data: filterDate === 'Today' ? [350, 1200, 850, 900, 780, 1400, 1600, 950] : [2400, 8400, 5900, 6300, 5400, 9800, 11200, 6600],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 6
        }]
    };

    const exportCSV = () => {
        const headers = ["Metric", "Value"];
        const rows = [
            ["Total Fleet Deployed", kpiData.totalFleet],
            ["Trips Processed", kpiData.tripsToday],
            ["Active Monitored Routes", kpiData.activeRoutes],
            ["CO2 Avoided (kg)", kpiData.co2Saved]
        ];
        
        const csvContent = headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `urban_mobility_report_${filterDate.replace(/\s+/g, '_').toLowerCase()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Urban Mobility Control Center Report", 14, 22);
        
        doc.setFontSize(12);
        doc.text(`Filter Date: ${filterDate}`, 14, 32);
        
        const tableColumn = ["Metric", "Value"];
        const tableRows = [
            ["Total Fleet Deployed", String(kpiData.totalFleet)],
            ["Trips Processed", String(kpiData.tripsToday)],
            ["Active Monitored Routes", String(kpiData.activeRoutes)],
            ["CO2 Avoided (kg)", String(kpiData.co2Saved)]
        ];
        
        autoTable(doc, {
            startY: 40,
            head: [tableColumn],
            body: tableRows,
        });
        
        doc.save(`urban_mobility_report_${filterDate.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(inherit, 0.6); } 70% { box-shadow: 0 0 0 12px rgba(inherit, 0); } 100% { box-shadow: 0 0 0 0 rgba(inherit, 0); } }
                @keyframes pulseZone { 0% { opacity: 0.2; } 50% { opacity: 0.5; } 100% { opacity: 0.2; } }
                .custom-pulse-icon div { transition: all 0.3s; }
                
                /* Premium Glass UI for Urban Mobility */
                .um-glass-panel {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
                    transition: all 0.3s ease;
                }
                .um-glass-panel:hover {
                    box-shadow: 0 15px 50px rgba(0,0,0,0.08);
                    transform: translateY(-2px);
                    background: rgba(255, 255, 255, 0.85);
                }
                .um-kpi-card {
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .um-kpi-card:hover {
                    transform: translateY(-8px) scale(1.02);
                }
                .um-kpi-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%);
                    z-index: 0;
                    pointer-events: none;
                }
                .um-btn {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .um-btn:hover {
                    transform: translateY(-2px) scale(1.02);
                }
            `}</style>
            
            {/* Header Toolbar */}
            <div className="um-glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#0f172a', fontSize: '24px', letterSpacing: '-0.5px', fontWeight: '800' }}>Urban Mobility Control Center</h2>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Real-time geospatial intelligence & anomaly tracking.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ padding: '10px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600', color: '#0f172a', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <option value="Today">View: Today</option>
                        <option value="Last 7 Days">View: Last 7 Days</option>
                        <option value="Last 30 Days">View: Last 30 Days</option>
                    </select>
                    <button className="um-btn" onClick={exportCSV} style={{ padding: '10px 16px', background: 'white', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '14px', color: '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}><span>📊</span> Export CSV</button>
                    <button className="um-btn" onClick={exportPDF} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}><span>📄</span> Export PDF</button>
                </div>
            </div>

            {/* Premium Animated KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Fleet Deployed', val: kpiData.totalFleet, diff: '+2.4%', icon: '🚛', colors: ['#4facfe', '#00f2fe'] },
                    { label: `${filterDate} Trips Processed`, val: kpiData.tripsToday, diff: '+12.5%', icon: '📍', colors: ['#43e97b', '#38f9d7'] },
                    { label: 'Active Monitored Routes', val: kpiData.activeRoutes, diff: 'Optimal', icon: '🛣️', colors: ['#fa709a', '#fee140'] },
                    { label: 'CO₂ Avoided (kg)', val: kpiData.co2Saved, diff: '+450kg Trend', icon: '🌱', colors: ['#10b981', '#047857'] }
                ].map((kpi, idx) => (
                    <div key={idx} className="um-kpi-card" style={{ background: `linear-gradient(135deg, ${kpi.colors[0]} 0%, ${kpi.colors[1]} 100%)`, borderRadius: '24px', padding: '28px', color: 'white', boxShadow: `0 15px 35px ${kpi.colors[0]}40`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', fontSize: '100px', opacity: 0.1, transform: 'rotate(15deg)' }}>{kpi.icon}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                            <div>
                                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9, marginBottom: '8px', fontWeight: '700' }}>{kpi.label}</div>
                                <div style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px' }}><AnimatedCounter value={kpi.val} /></div>
                                <div style={{ fontSize: '13px', marginTop: '12px', fontWeight: '600', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '4px 10px', borderRadius: '20px' }}>
                                    {kpi.diff.includes('+') ? '↗' : ''} {kpi.diff}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sub-grid (Map + Weather + AI Sidebar) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '24px' }}>
                
                {/* Hollywood Map Controller */}
                <div className={mapTheme === 'dark' ? '' : 'um-glass-panel'} style={{ background: mapTheme === 'dark' ? '#0f172a' : undefined, borderRadius: '20px', padding: mapTheme === 'dark' ? '24px' : undefined, boxShadow: mapTheme === 'dark' ? '0 10px 40px rgba(0,0,0,0.3)': undefined, display: 'flex', flexDirection: 'column', transition: 'background 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: mapTheme === 'dark' ? 'white' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ display: 'flex', height: '10px', width: '10px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 8px #ef4444' }}></span> Real-Time Matrix
                        </h3>
                        
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', background: mapTheme === 'dark' ? '#1e293b' : '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
                                <button onClick={() => setMapViewType('heatmap')} style={{ padding: '6px 12px', border: 'none', background: mapViewType === 'heatmap' ? (mapTheme === 'dark' ? '#334155' : 'white') : 'transparent', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: mapViewType === 'heatmap' ? '#3b82f6' : '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}>Density Layer</button>
                                <button onClick={() => setMapViewType('live')} style={{ padding: '6px 12px', border: 'none', background: mapViewType === 'live' ? (mapTheme === 'dark' ? '#334155' : 'white') : 'transparent', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: mapViewType === 'live' ? '#10b981' : '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}>Artery Routes</button>
                            </div>
                            
                            <select value={mapTheme} onChange={(e) => setMapTheme(e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', background: mapTheme === 'dark' ? '#1e293b' : '#f1f5f9', color: mapTheme === 'dark' ? '#e2e8f0' : '#475569', fontSize: '12px', fontWeight: '600', outline: 'none' }}>
                                <option value="dark">Cyber Dark</option>
                                <option value="light">Street Light</option>
                                <option value="satellite">Satellite</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', minHeight: '480px', border: `1px solid ${mapTheme === 'dark' ? '#1e293b' : '#e2e8f0'}`, position: 'relative' }}>
                        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', background: mapTheme === 'dark' ? '#0f172a' : '#f8fafc' }} zoomControl={false}>
                            <TileLayer attribution='&copy; OpenStreetMap' url={THEMES[mapTheme]} opacity={mapTheme === 'satellite' ? 0.9 : 1} />
                            
                            {/* Demand Geofences */}
                            {mapViewType === 'heatmap' && surgeZones.map((zone, i) => (
                                <Circle key={`zone-${i}`} center={zone.center} radius={zone.radius} pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.15, weight: 1, dashArray: '5, 5' }}>
                                    <Popup><div style={{textAlign:'center', fontWeight:'bold', color: zone.color}}>{zone.label} <br/> <small>High Capacity Expected</small></div></Popup>
                                </Circle>
                            ))}
                            {mapViewType === 'heatmap' && heatmapData.length > 0 && <HeatmapLayer points={heatmapData} />}
                            
                            {/* Live Vehicle Tracks & Markers */}
                            {mapViewType === 'live' && liveRoutes.map((route, i) => (
                                <Polyline key={`route-${i}`} positions={route.positions} pathOptions={{ color: route.color, weight: 3, opacity: 0.6, dashArray: '4, 8' }} />
                            ))}
                            {mapViewType === 'live' && liveVehicles.map((v, i) => (
                                <Marker key={`veh-${i}`} position={[v.lat, v.lng]} icon={icons[v.status]}>
                                    <Popup className="custom-dark-popup">
                                        <div style={{ textAlign: 'center' }}>
                                            <strong style={{ display: 'block', fontSize: '14px' }}>{v.id}</strong>
                                            <span style={{ fontSize: '11px', fontWeight:'bold', color: v.status === 'active' ? '#10b981' : '#f59e0b', textTransform:'uppercase' }}>{v.status}</span>
                                            <div style={{ fontSize: '12px', marginTop: '6px' }}>🔋 {v.battery}%</div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                        
                        {/* Map Overlay Stats */}
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, display: 'flex', gap: '10px' }}>
                            <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Fleet Connectivity</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>99.8%</div>
                            </div>
                            <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Incidents</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>0</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="um-glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '28px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🌦️</span> Atmospheric Context
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px' }}>72°F</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>Partly Cloudy, NYC</div>
                            </div>
                            <div style={{ fontSize: '40px' }}>🌤️</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{color: '#64748b'}}>Air Quality:</span><span style={{fontWeight:'600', color: '#10b981'}}>Excellent (AQI 32)</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#64748b'}}>Wind:</span><span style={{fontWeight:'600', color: '#0f172a'}}>12.4 SW mph</span></div>
                        </div>
                    </div>

                    <div className="um-glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🧠</span> DeepSight AI Alerts
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                            <div style={{ padding: '14px', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '6px' }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#b45309' }}>Midtown Surge Prediction</div>
                                <div style={{ fontSize: '12px', color: '#d97706', marginTop: '4px', lineHeight:'1.4' }}>Mass transit delays escalating. Recommend un-idling 15 vehicles to midtown radius.</div>
                            </div>
                            <div style={{ padding: '14px', background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '6px' }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1d4ed8' }}>Charging Bay Reallocations</div>
                                <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '4px', lineHeight:'1.4' }}>Sector 4 bays currently at 100% capacity. Diverting returning EVs to Sector 2.</div>
                            </div>
                        </div>
                        <button style={{ width: '100%', marginTop: '16px', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='#f8fafc'}>View AI Audit Log</button>
                    </div>
                </div>
            </div>

            {/* Bottom Chart Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="um-glass-panel" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>Hourly Rental Velocity</h3>
                        <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '600', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px' }}>Peak at 6 PM</div>
                    </div>
                    <div style={{ height: '300px' }}>
                        <Bar options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#f1f5f9' }, border: { dash: [4, 4] } }, x: { grid: { display: false } } } }} data={hourlyData} />
                    </div>
                </div>

                <div className="um-glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '28px' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>Live Fleet State</h3>
                    <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '260px' }}>
                        <Doughnut 
                            options={{ responsive: true, maintainAspectRatio: false, cutout: '78%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true, padding: 20 } } } }} 
                            data={{ labels: ['Active', 'Idle', 'Charging', 'Maint.'], datasets: [{ data: [65, 20, 10, 5], backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'], borderWidth: 0, hoverOffset: 4 }] }} 
                        />
                        <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>65%</div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Active</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UrbanMobilityInsights;
