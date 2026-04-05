import React, { useState, useEffect } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Bar
} from "recharts";
import DashboardLayout from "./DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";
import "./PredictiveMaintenance.css";

// --- Mock Data & Simulation ---
const COLORS = {
    Healthy: "#22c55e", 
    Due: "#f59e0b",     
    Critical: "#ef4444" 
};

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

const generateFleetHealth = () => {
    const fleet = [];
    for (let i = 1; i <= 20; i++) {
        const type = i % 3 === 0 ? "EV" : i % 2 === 0 ? "Van" : "Truck";
        const engineHealth = Math.floor(Math.random() * (100 - 40) + 40);
        const tirePressure = Math.floor(Math.random() * (40 - 25) + 25); // psi
        const batteryLife = Math.floor(Math.random() * (100 - 30) + 30);
        const fuelLevel = Math.floor(Math.random() * (100 - 10) + 10); // %
        const mileage = Math.floor(Math.random() * 150000);

        let status = "Healthy";
        let issue = "None";
        let action = "No Action Required";
        let nextServiceDays = Math.floor(Math.random() * 60) + 20; // default healthy next service

        // Rule-based logic
        if (engineHealth < 50) {
            status = "Critical";
            issue = "Engine performance critically low";
            action = "Immediate Service";
            nextServiceDays = Math.floor(Math.random() * 3);
        } else if (batteryLife < 40 && type === "EV") {
            status = "Critical";
            issue = "Battery degradation warning";
            action = "Replace Battery";
            nextServiceDays = Math.floor(Math.random() * 3);
        } else if (tirePressure < 30) {
            status = "Due";
            issue = "Tire pressure below optimal levels";
            action = "Check Tires";
            nextServiceDays = Math.floor(Math.random() * 7) + 1;
        } else if (fuelLevel < 15 && type !== "EV") {
            status = "Due";
            issue = "Low fuel warning";
            action = "Refuel Required";
            nextServiceDays = Math.floor(Math.random() * 3) + 1;
        } else if (mileage > 100000 && Math.random() > 0.5) {
            status = "Due";
            issue = "High mileage scheduled maintenance";
            action = "Schedule Maintenance";
            nextServiceDays = Math.floor(Math.random() * 10) + 1;
        }

        // Generate Last Service Date (past 1-6 months)
        const lastServiceDate = new Date();
        lastServiceDate.setMonth(lastServiceDate.getMonth() - (Math.floor(Math.random() * 5) + 1));
        
        // Generate Next Service Date based on nextServiceDays
        const nextServiceDate = new Date();
        nextServiceDate.setDate(nextServiceDate.getDate() + nextServiceDays);

        // Generate Mock Service History
        const serviceHistory = [
            { date: lastServiceDate.toISOString().split('T')[0], task: "Full System Diagnostic", tech: "AI AutoBot #4" },
            { date: new Date(lastServiceDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], task: "Interior Sanitization & Polish", tech: "CleanTeam #12" },
            { date: new Date(lastServiceDate.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], task: "Tire Pressure Calibration", tech: "MobileService #2" }
        ];

        fleet.push({
            id: `VHL-${1000 + i}`,
            type: type,
            engineHealth,
            tirePressure,
            batteryLife,
            fuelLevel,
            status,
            issue,
            actionNeeded: action,
            nextMaintenance: `In ${nextServiceDays} days`,
            lastServiceDate: lastServiceDate.toISOString().split('T')[0],
            predictedNextDate: nextServiceDate.toISOString().split('T')[0],
            mileage,
            serviceHistory,
            ecoImpact: {
                co2Saved: (Math.random() * 40 + 10).toFixed(1), // kg
                ecoScore: Math.floor(Math.random() * 15 + 85) // 85-100
            }
        });
    }
    return fleet;
};

const generateVehicleHealthTrend = () => {
    const data = [];
    const days = ["6d ago", "5d ago", "4d ago", "3d ago", "2d ago", "Yesterday", "Today"];
    let baseHealth = 92;
    for(let i=0; i<days.length; i++) {
        baseHealth += (Math.random() * 4 - 2); 
        data.push({
            name: days[i],
            health: Math.min(100, Math.max(80, baseHealth.toFixed(1)))
        });
    }
    return data;
};

const generateWearTrend = () => {
    const data = [];
    let avgWear = 10;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    
    for (let i = 0; i < months.length; i++) {
        avgWear += Math.random() * 8 + 2; 
        data.push({
            name: months[i],
            Wear: Math.min(100, Math.round(avgWear)),
            Optimum: 30
        });
    }
    return data;
};

const generateSpeedAnalytics = () => {
    const data = [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for(let i=0; i<days.length; i++) {
        data.push({
            day: days[i],
            avgSpeed: Math.floor(Math.random() * 20 + 45), // 45 to 65 km/h
            maxSpeed: Math.floor(Math.random() * 30 + 75),  // 75 to 105 km/h
            efficiency: Math.floor(Math.random() * 15 + 85) // 85-100%
        });
    }
    return data;
};

const generateDetailedHealth = (v) => {
    return {
        ...v,
        sensors: {
            brakePads: Math.floor(Math.random() * 40 + 60), // %
            oilLife: Math.floor(Math.random() * 50 + 50),   // %
            coolantTemp: Math.floor(Math.random() * 20 + 85), // Celsius
            tireTread: Math.floor(Math.random() * 5 + 3),     // mm (3-8mm)
            airFilter: Math.floor(Math.random() * 30 + 70),  // %
            transmission: Math.floor(Math.random() * 20 + 80) // % health
        }
    };
};

function PredictiveMaintenance() {
    const navigate = useNavigate();
    const [fleetData, setFleetData] = useState([]);
    const [wearTrend, setWearTrend] = useState([]);
    const [speedData, setSpeedData] = useState([]);
    const [activeMenu, setActiveMenu] = useState("maintenance");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [userRole, setUserRole] = useState("MANAGER");
    const [assignedVehicle, setAssignedVehicle] = useState(null);
    const [healthTrend, setHealthTrend] = useState([]);

    useEffect(() => {
        const fleet = generateFleetHealth().map(v => generateDetailedHealth(v));
        setFleetData(fleet);
        setWearTrend(generateWearTrend());
        setSpeedData(generateSpeedAnalytics());
        setHealthTrend(generateVehicleHealthTrend());
        
        const role = localStorage.getItem("role") || "MANAGER";
        setUserRole(role);
        
        if (role === "DRIVER") {
            // Assign a vehicle to the driver (mock logic: first vehicle)
            setAssignedVehicle(fleet[0]);
        } else if (role === "CUSTOMER") {
            // Assign a vehicle to the customer's active booking (mock logic: second vehicle)
            setAssignedVehicle(fleet[1]);
        }
    }, []);

    const handleResolveTask = (vehicleId) => {
        setFleetData(prevData => prevData.map(v => {
            if (v.id === vehicleId) {
                const today = new Date();
                const nextDate = new Date();
                nextDate.setDate(today.getDate() + 90);
                return {
                    ...v,
                    status: "Healthy",
                    issue: "None",
                    actionNeeded: "No Action Required",
                    engineHealth: Math.max(v.engineHealth, 95),
                    batteryLife: Math.max(v.batteryLife, 100),
                    tirePressure: Math.max(v.tirePressure, 35),
                    fuelLevel: Math.max(v.fuelLevel, 100),
                    lastServiceDate: today.toISOString().split('T')[0],
                    predictedNextDate: nextDate.toISOString().split('T')[0],
                    nextMaintenance: `In 90 days`
                };
            }
            return v;
        }));
    };

    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        const role = localStorage.getItem("role") || "MANAGER";
        let items = [];
        
        if (role === "ADMIN") {
            items = [
                { key: "dashboard", label: "Dashboard", icon: "📊", path: "/admin" },
                { key: "users", label: "Manage Users", icon: "👤" },
                { key: "vehicles", label: "Manage Vehicles", icon: "🚚", path: "/vehicles" },
                { key: "maintenance", label: "Predictive Maint.", icon: "🔧", path: "/predictive-maintenance" },
                { key: "reports", label: "Reports", icon: "📈" },
            ];
        } else if (role === "DRIVER") {
            items = [
                { key: "dashboard", label: "Dashboard", icon: "📊", path: "/driver" },
                { key: "trips", label: "My Trips", icon: "🧭" },
                { key: "vehicle", label: "Assigned Vehicle", icon: "🚚" },
                { key: "maintenance", label: "Predictive Maint.", icon: "🔧", path: "/predictive-maintenance" },
                { key: "earnings", label: "Earnings", icon: "💰" },
            ];
        } else if (role === "CUSTOMER") {
            items = [
                { key: "dashboard", label: "Dashboard", icon: "📊", path: "/customer" },
                { key: "bookings", label: "My Bookings", icon: "📅" },
                { key: "tracking", label: "Live Tracking", icon: "🧭" },
                { key: "maintenance", label: "Predictive Maint.", icon: "🔧", path: "/predictive-maintenance" },
                { key: "payments", label: "Payments", icon: "💳" },
            ];
        } else {
            // Default MANAGER
            items = [
                { key: "dashboard", label: "Dashboard", icon: "📊", path: "/manager" },
                { key: "vehicles", label: "Fleet Inventory", icon: "🚚", path: "/vehicles" },
                { key: "routes", label: "Route AI", icon: "🗺️", path: "/route-optimization" },
                { key: "maintenance", label: "Predictive Maint.", icon: "🔧", path: "/predictive-maintenance" },
                { key: "reports", label: "Reports", icon: "📈" },
            ];
        }
        setMenuItems(items);
    }, []);

    // Aggregations
    const statusCounts = fleetData.reduce((acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
    }, {});
    
    const pieData = Object.keys(COLORS).map(status => ({
        name: status,
        value: statusCounts[status] || 0
    }));

    const filteredFleet = fleetData.filter(v => {
        const matchesSearch = v.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              v.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "All" || v.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const alerts = filteredFleet.filter(v => v.status !== "Healthy").sort((a, b) => {
        if (a.status === "Critical" && b.status !== "Critical") return -1;
        if (b.status === "Critical" && a.status !== "Critical") return 1;
        return 0;
    });

    const getHealthColor = (value, invert = false) => {
        if (invert) { // For things where lower is better, like wear
            return value > 80 ? "#ef4444" : value > 60 ? "#f59e0b" : "#22c55e"; 
        }
        return value < 30 ? "#ef4444" : value < 60 ? "#f59e0b" : "#22c55e";
    };

    return (
        <DashboardLayout 
            title="Predictive Maintenance & Health Analytics" 
            menuItems={menuItems} 
            activeKey={activeMenu}
            onMenuChange={setActiveMenu}
        >
            <div className="pm-container">
                {userRole === "MANAGER" || userRole === "ADMIN" ? renderManagerView() : 
                 userRole === "DRIVER" ? renderDriverView() : 
                 renderCustomerView()}
            </div>
        </DashboardLayout>
    );

    function renderManagerView() {
        return (
            <>
                {/* Top Metrics Header */}
                <div className="pm-metrics-row">
                    <div className="pm-metric-card healthy">
                        <div className="pm-metric-icon">🟢</div>
                        <div className="pm-metric-info">
                            <h3>{statusCounts["Healthy"] || 0}</h3>
                            <p>Healthy Vehicles</p>
                        </div>
                    </div>
                    <div className="pm-metric-card due">
                        <div className="pm-metric-icon">🟡</div>
                        <div className="pm-metric-info">
                            <h3>{statusCounts["Due"] || 0}</h3>
                            <p>Maintenance Due</p>
                        </div>
                    </div>
                    <div className="pm-metric-card critical">
                        <div className="pm-metric-icon">🔴</div>
                        <div className="pm-metric-info">
                            <h3>{statusCounts["Critical"] || 0}</h3>
                            <p>Critical Alerts</p>
                        </div>
                    </div>
                    <div className="pm-metric-card total">
                        <div className="pm-metric-icon">🚚</div>
                        <div className="pm-metric-info">
                            <h3>{fleetData.length}</h3>
                            <p>Total Fleet Tracked</p>
                        </div>
                    </div>
                </div>

                {/* Analytical Charts Row */}
                <div className="pm-charts-row">
                    <div className="pm-chart-widget">
                        <h3>📈 Speed Analytics</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={280}>
                                <ComposedChart data={speedData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}/>
                                    <Legend />
                                    <Bar dataKey="avgSpeed" name="Avg Speed (km/h)" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" dataKey="maxSpeed" name="Max Speed (km/h)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="pm-chart-widget">
                        <h3>📉 Fleet Wear Over Time</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={wearTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorWear" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}/>
                                    <Legend />
                                    <Area type="monotone" dataKey="Wear" stroke="#ef4444" fillOpacity={1} fill="url(#colorWear)" />
                                    <Line type="monotone" dataKey="Optimum" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="pm-chart-widget pie-widget">
                        <h3>📊 Maintenance Status</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationBegin={100}
                                        animationDuration={800}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}/>
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Tables Section Header */}
                <div className="pm-tables-controls">
                    <h2>Fleet Maintenance Hub</h2>
                    <div className="pm-filters">
                        <input 
                            type="text" 
                            placeholder="🔍 Search Vehicle ID or Type..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pm-search-input"
                        />
                        <select 
                            value={filterStatus} 
                            onChange={e => setFilterStatus(e.target.value)}
                            className="pm-status-filter"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Healthy">Healthy</option>
                            <option value="Due">Due</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                </div>

                {/* Bottom Main Content Panel */}
                <div className="pm-tables-stack" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Alert Table */}
                    <div className="pm-vehicle-table-widget">
                        <div className="pm-table-header">
                            <h3>🚨 Alert Table & Required Actions</h3>
                            <span>Issues requiring immediate attention</span>
                        </div>
                        <div className="table-responsive">
                            <table className="pm-alert-table">
                                <thead>
                                    <tr>
                                        <th>Vehicle</th>
                                        <th>Severity</th>
                                        <th>Detected Issue</th>
                                        <th>Required Action</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alerts.length === 0 ? (
                                        <tr><td colSpan="5" style={{textAlign: "center", padding: "20px", color: "#64748b"}}>All clear! No alerts.</td></tr>
                                    ) : alerts.map((alert, idx) => (
                                        <tr key={idx}>
                                            <td className="font-bold">{alert.id} <span className="veh-type">({alert.type})</span></td>
                                            <td><span className={`status-badge badge-${alert.status.toLowerCase()}`}>{alert.status}</span></td>
                                            <td style={{ color: alert.status === "Critical" ? "#ef4444" : "#b45309", fontWeight: "600" }}>{alert.issue}</td>
                                            <td style={{ color: "#475569", fontWeight: "500" }}>{alert.actionNeeded}</td>
                                            <td>
                                                <button 
                                                    className={`action-btn btn-${alert.status.toLowerCase()}`}
                                                    onClick={() => handleResolveTask(alert.id)}
                                                >
                                                    Resolve Task
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Maintenance Prediction Table */}
                    <div className="pm-vehicle-table-widget">
                        <div className="pm-table-header">
                            <h3>📅 Maintenance Prediction</h3>
                            <span>Service Timelines & Scheduling Forecasts</span>
                        </div>
                        <div className="table-responsive">
                            <table className="pm-alert-table">
                                <thead>
                                    <tr>
                                        <th>Vehicle</th>
                                        <th>Current Status</th>
                                        <th>Last Service Date</th>
                                        <th>Predicted Next Service</th>
                                        <th>Remaining Timeline</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fleetData.map((v, idx) => (
                                        <tr key={idx}>
                                            <td className="font-bold">{v.id} <span className="veh-type">({v.type})</span></td>
                                            <td><span className={`status-badge badge-${v.status.toLowerCase()}`}>{v.status}</span></td>
                                            <td>{v.lastServiceDate}</td>
                                            <td className="font-bold" style={{ color: v.status === "Critical" ? "#ef4444" : v.status === "Due" ? "#f59e0b" : "#475569" }}>
                                                {v.predictedNextDate}
                                            </td>
                                            <td><span style={{background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600"}}>{v.nextMaintenance}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Fleet Vehicle Health Table */}
                    <div className="pm-vehicle-table-widget">
                        <div className="pm-table-header">
                            <h3>🚛 Fleet Vehicle Parameters</h3>
                            <span>Comprehensive live telematics</span>
                        </div>
                        <div className="table-responsive">
                            <table className="pm-alert-table health-table">
                                <thead>
                                    <tr>
                                        <th>Vehicle</th>
                                        <th>Status</th>
                                        <th>Engine Health</th>
                                        <th>Tire PSI</th>
                                        <th>Battery %</th>
                                        <th>Fuel %</th>
                                        <th>Mileage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fleetData.map((v, idx) => (
                                        <tr key={idx}>
                                            <td className="font-bold">{v.id} <span className="veh-type">({v.type})</span></td>
                                            <td>
                                                <span className={`status-badge badge-${v.status.toLowerCase()}`}>
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="health-bar-container">
                                                    <div className="health-val">{v.engineHealth}%</div>
                                                    <div className="bar-bg"><div className="bar-fill" style={{ width: `${v.engineHealth}%`, background: getHealthColor(v.engineHealth) }}></div></div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="health-bar-container">
                                                    <div className="health-val">{v.tirePressure} psi</div>
                                                    <div className="bar-bg"><div className="bar-fill" style={{ width: `${(v.tirePressure/40)*100}%`, background: v.tirePressure < 30 ? "#f59e0b" : "#22c55e" }}></div></div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="health-bar-container">
                                                    <div className="health-val">{v.batteryLife}%</div>
                                                    <div className="bar-bg"><div className="bar-fill" style={{ width: `${v.batteryLife}%`, background: getHealthColor(v.batteryLife) }}></div></div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="health-bar-container">
                                                    <div className="health-val">{v.fuelLevel}%</div>
                                                    <div className="bar-bg"><div className="bar-fill" style={{ width: `${v.fuelLevel}%`, background: getHealthColor(v.fuelLevel) }}></div></div>
                                                </div>
                                            </td>
                                            <td className="veh-mileage">
                                                {new Intl.NumberFormat().format(v.mileage)} km
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </>
        );
    }

    function renderDriverView() {
        if (!assignedVehicle) return <div className="loading-state">Loading Vehicle Health...</div>;
        
        const s = assignedVehicle.sensors;
        
        return (
            <div className="pm-role-view driver-view">
                <div className="pm-header-section">
                    <h2>📦 My Assigned Vehicle Health</h2>
                    <p>Daily pre-trip diagnostics for {assignedVehicle.id} ({assignedVehicle.type})</p>
                </div>

                <div className="pm-metrics-row">
                    <div className={`pm-metric-card ${assignedVehicle.status.toLowerCase()}`}>
                        <div className="pm-metric-icon">🛠️</div>
                        <div className="pm-metric-info">
                            <h3>{assignedVehicle.status}</h3>
                            <p>Status: {assignedVehicle.issue}</p>
                        </div>
                    </div>
                    <div className="pm-metric-card">
                        <div className="pm-metric-icon">⛽</div>
                        <div className="pm-metric-info">
                            <h3>{assignedVehicle.fuelLevel}%</h3>
                            <p>{assignedVehicle.type === "EV" ? "Battery Charge" : "Fuel Level"}</p>
                        </div>
                    </div>
                    <div className="pm-metric-card">
                        <div className="pm-metric-icon">🔘</div>
                        <div className="pm-metric-info">
                            <h3>{assignedVehicle.tirePressure} PSI</h3>
                            <p>Tire Pressure</p>
                        </div>
                    </div>
                    <div className="pm-metric-card">
                        <div className="pm-metric-icon">📟</div>
                        <div className="pm-metric-info">
                            <h3>{new Intl.NumberFormat().format(assignedVehicle.mileage)} km</h3>
                            <p>Current Odometer</p>
                        </div>
                    </div>
                </div>

                <div className="pm-role-content-grid">
                    <div className="pm-section-card sensor-analysis">
                        <h3>🩺 Live Sensor Health Analysis</h3>
                        <div className="sensor-grid">
                            {[
                                { name: "Brake Pads", val: s.brakePads, icon: "🛑" },
                                { name: "Oil Quality", val: s.oilLife, icon: "🛢️" },
                                { name: "Coolant Temp", val: s.coolantTemp, suffix: "°C", icon: "🌡️", invert: true },
                                { name: "Tire Tread", val: (s.tireTread/8)*100, label: `${s.tireTread}mm`, icon: "🛞" },
                                { name: "Air Filter", val: s.airFilter, icon: "💨" },
                                { name: "Transmission", val: s.transmission, icon: "⚙️" }
                            ].map((sens, idx) => (
                                <div key={idx} className="sensor-item">
                                    <div className="sensor-header">
                                        <span>{sens.icon} {sens.name}</span>
                                        <strong>{sens.label || `${sens.val}%`}{sens.suffix || ""}</strong>
                                    </div>
                                    <div className="sensor-bar-bg">
                                        <div className="sensor-bar-fill" style={{ 
                                            width: `${sens.invert ? (100 - sens.val) : sens.val}%`,
                                            background: getHealthColor(sens.invert ? (100 - sens.val) : sens.val) 
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pm-section-card checklist-card">
                        <h3>📋 Pre-Trip Safety Checklist</h3>
                        <div className="checklist-items">
                            <label><input type="checkbox" defaultChecked /> Brakes & Fluid levels Checked</label>
                            <label><input type="checkbox" defaultChecked /> Tire Pressure & Tread Inspected</label>
                            <label><input type="checkbox" /> Lights, Signals & Reflectors Working</label>
                            <label><input type="checkbox" /> Mirrors & Windshield Clean</label>
                            <label><input type="checkbox" /> Cargo Secured & Doors Locked</label>
                        </div>
                        <button className="confirm-checklist-btn">Confirm Safety Check</button>
                    </div>

                    <div className="pm-section-card chart-card">
                        <h3>📈 Weekly Efficiency Trend</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={speedData}>
                                <defs>
                                    <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" hide />
                                <Tooltip />
                                <Area type="monotone" dataKey="efficiency" stroke="#22c55e" fillOpacity={1} fill="url(#colorEff)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    }

    function renderCustomerView() {
        if (!assignedVehicle) return <div className="loading-state">Connecting to Vehicle...</div>;

        return (
            <div className="pm-role-view customer-view">
                <div className="pm-header-section text-center">
                    <span className="pm-badge animated">🛡️ Advanced AI Safety Verified</span>
                    <h2>Your Ride's Health & Safety</h2>
                    <p>Real-time technical transparency for your journey</p>
                </div>

                <div className="customer-main-card glass-panel-premium">
                    <div className="vehicle-profile">
                        <div className="vehicle-avatar">🚙</div>
                        <div className="vehicle-meta">
                            <h3>{assignedVehicle.type} Performance Pro</h3>
                            <p>Assigned: <span className="highlight-text">{assignedVehicle.id}</span></p>
                            <div className="status-indicator">
                                <div className={`dot ${assignedVehicle.status === 'Healthy' ? 'pulse-green' : 'pulse-amber'}`}></div>
                                <span>{assignedVehicle.status === 'Healthy' ? 'Fully Operational' : 'Non-Critical Maint. Due'}</span>
                            </div>
                        </div>
                        <div className="safety-score-blob">
                            <div className="score-val">9.8</div>
                            <div className="score-label">Safety Rating</div>
                        </div>
                    </div>

                    <div className="customer-dashboard-grid">
                        <div className="panel-left">
                            <div className="safety-summary-grid">
                                <div className="safety-item-mini" title="Engine Diagnostics">
                                    <div className="s-icon-small">⚙️</div>
                                    <div className="s-info">
                                        <label>Engine</label>
                                        <div className="mini-bar">
                                            <div className="mini-fill healthy" style={{ width: `${assignedVehicle.engineHealth}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="safety-item-mini" title="Tire Pressure">
                                    <div className="s-icon-small">🛞</div>
                                    <div className="s-info">
                                        <label>Tires</label>
                                        <div className="mini-bar">
                                            <div className="mini-fill" style={{ width: `${(assignedVehicle.tirePressure/40)*100}%`, background: '#22c55e' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="safety-item-mini" title="Battery Status">
                                    <div className="s-icon-small">🔋</div>
                                    <div className="s-info">
                                        <label>Energy</label>
                                        <div className="mini-bar">
                                            <div className="mini-fill" style={{ width: `${assignedVehicle.fuelLevel}%`, background: '#3b82f6' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="safety-item-mini" title="Hygiene Level">
                                    <div className="s-icon-small">✨</div>
                                    <div className="s-info">
                                        <label>Hygiene</label>
                                        <div className="mini-bar">
                                            <div className="mini-fill" style={{ width: '95%', background: '#8b5cf6' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="health-trend-section">
                                <div className="section-header">
                                    <h4>📈 Intelligence Health Index</h4>
                                    <span>Last 7 Days</span>
                                </div>
                                <div style={{ height: '180px', width: '100%', marginTop: '10px' }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={healthTrend}>
                                            <defs>
                                                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" hide />
                                            <YAxis domain={['dataMin - 5', 100]} hide />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="health" stroke="#10b981" strokeWidth={3} fill="url(#colorHealth)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="panel-right">
                            <div className="maintenance-card">
                                <h4>📅 Service Forecast</h4>
                                <div className="forecast-badge">
                                    <span className="lbl">Predicted Next:</span>
                                    <span className="val">{assignedVehicle.predictedNextDate}</span>
                                </div>
                                <div className="forecast-desc">
                                    Scheduled for routine {assignedVehicle.type === 'EV' ? 'Electric Powertrain' : 'Oil & Filter'} check.
                                </div>
                            </div>

                            <div className="eco-impact-card">
                                <div className="eco-header">
                                    <span>Sustainability</span>
                                    <div className="eco-score">🌱 {assignedVehicle.ecoImpact.ecoScore}%</div>
                                </div>
                                <div className="eco-metric">
                                    <div className="val">{assignedVehicle.ecoImpact.co2Saved} kg</div>
                                    <div className="lbl">CO₂ Emissions Saved</div>
                                </div>
                                <p>This trip contributes to our net-zero goal.</p>
                            </div>
                        </div>
                    </div>

                    <div className="service-history-section">
                        <h4>🕒 Verified Service History</h4>
                        <div className="history-list">
                            {assignedVehicle.serviceHistory?.map((item, idx) => (
                                <div key={idx} className="history-item">
                                    <div className="h-date">{item.date}</div>
                                    <div className="h-content">
                                        <div className="h-task">{item.task}</div>
                                        <div className="h-tech">Agent: {item.tech}</div>
                                    </div>
                                    <div className="h-verify">Verified ✅</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="performance-footer">
                        <p>🛡️ Powered by <strong>Neurofeetx AI</strong>. We've performed 150+ automated pre-trip safety scans in the last hour.</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default PredictiveMaintenance;
