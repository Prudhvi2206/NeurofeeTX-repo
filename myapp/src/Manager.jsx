import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "./DashboardLayout.jsx";
import "./Vehicles.css";

const API_BASE = "http://localhost:8080";

function Manager() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        inUse: 0,
        maintenance: 0,
        evCount: 0,
        avgSpeed: 0,
        lowFuel: 0,
        utilization: 0,
        totalMileage: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        revenue: 0,
        activeDrivers: 0,
        completedTrips: 0,
        averageTripDuration: 0
    });

    // Authentication check
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        
        if (!token) {
            navigate("/login");
            return;
        }
        
        if (role !== "MANAGER") {
            // Redirect based on role
            if (role === "ADMIN") navigate("/admin");
            else if (role === "DRIVER") navigate("/driver");
            else if (role === "CUSTOMER") navigate("/customer");
            else navigate("/login");
            return;
        }
    }, [navigate]);

    const menuItems = [
        { key: "dashboard", label: "Dashboard", icon: "📊" },
        { key: "vehicles", label: "Fleet Inventory", icon: "🚚", path: "/vehicles" },
        { key: "routes", label: "Route AI", icon: "🗺️", path: "/route-optimization" },
        { key: "maintenance", label: "Predictive Maint.", icon: "🔧", path: "/predictive-maintenance" },
        { key: "reports", label: "Reports", icon: "📈" },
    ];

    useEffect(() => {
        if (activeTab === "dashboard" || activeTab === "reports") {
            loadVehicles();
        }
    }, [activeTab]);

    const loadVehicles = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_BASE + "/vehicles");
            setVehicles(res.data);
            calculateStats(res.data);
        } catch (error) {
            console.error("Failed to load vehicles:", error);
            setVehicles([]);
            // Set fallback data for demo
            const fallbackVehicles = [
                { id: 1, name: "EV Truck 001", status: "AVAILABLE", type: "EV", mileage: 15000 },
                { id: 2, name: "Diesel Van 002", status: "IN_USE", type: "DIESEL", mileage: 25000 },
                { id: 3, name: "EV Truck 003", status: "MAINTENANCE", type: "EV", mileage: 18000 },
                { id: 4, name: "Hybrid Truck 004", status: "AVAILABLE", type: "HYBRID", mileage: 12000 },
                { id: 5, name: "EV Truck 005", status: "IN_USE", type: "EV", mileage: 22000 },
            ];
            setVehicles(fallbackVehicles);
            calculateStats(fallbackVehicles);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (vehicleData) => {
        const total = vehicleData.length;
        const available = vehicleData.filter(v => v.status === "AVAILABLE").length;
        const inUse = vehicleData.filter(v => v.status === "IN_USE").length;
        const maintenance = vehicleData.filter(v => v.status === "MAINTENANCE").length;
        const evCount = vehicleData.filter(v => v.type === "EV").length;
        const utilization = total > 0 ? Math.round((inUse / total) * 100) : 0;
        const totalMileage = vehicleData.reduce((sum, v) => sum + (v.mileage || 0), 0);

        setStats({
            total,
            available,
            inUse,
            maintenance,
            evCount,
            avgSpeed: 45 + Math.random() * 20,
            lowFuel: Math.floor(Math.random() * 5),
            utilization,
            totalMileage,
            fuelCost: totalMileage * 0.15,
            maintenanceCost: maintenance * 5000,
            revenue: inUse * 2500,
            activeDrivers: inUse,
            completedTrips: Math.floor(totalMileage / 100),
            averageTripDuration: 2.5 + Math.random() * 2
        });
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num);
    };

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(num);
    };

    const renderDashboard = () => (
        <>
            {/* Manager Overview Stats */}
            <div className="manager-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div className="stat-card primary" style={{ 
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white", 
                    position: "relative", 
                    overflow: "hidden",
                    boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)"
                }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>🚚</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Total Fleet</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{stats.total}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>All vehicles</div>
                    </div>
                </div>
                
                <div className="stat-card success" style={{ 
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white", 
                    position: "relative", 
                    overflow: "hidden",
                    boxShadow: "0 8px 20px rgba(34, 197, 94, 0.3)"
                }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>✅</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Available</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{stats.available}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Ready for deployment</div>
                    </div>
                </div>

                <div className="stat-card info" style={{ 
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white", 
                    position: "relative", 
                    overflow: "hidden",
                    boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)"
                }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>🚗</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Active Now</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{stats.inUse}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Currently on road</div>
                    </div>
                </div>

                <div className="stat-card secondary" style={{ 
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white", 
                    position: "relative", 
                    overflow: "hidden",
                    boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)"
                }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>📈</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Utilization</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{stats.utilization}%</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Fleet efficiency</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions" style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                marginBottom: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#1f2937", marginBottom: "24px" }}>
                    🚀 Quick Actions
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                    <button 
                        onClick={() => setActiveTab("vehicles")}
                        style={{ 
                            padding: "20px", 
                            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", 
                            border: "2px solid #e5e7eb", 
                            borderRadius: "12px", 
                            fontSize: "16px", 
                            cursor: "pointer", 
                            fontWeight: "600",
                            textAlign: "center",
                            transition: "transform 0.2s, box-shadow 0.2s"
                        }}
                    >
                        🚚 Manage Vehicles
                    </button>
                    <button 
                        onClick={() => window.location.href = "/route-optimization"}
                        style={{ 
                            padding: "20px", 
                            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", 
                            border: "2px solid #e5e7eb", 
                            borderRadius: "12px", 
                            fontSize: "16px", 
                            cursor: "pointer", 
                            fontWeight: "600",
                            textAlign: "center",
                            transition: "transform 0.2s, box-shadow 0.2s"
                        }}
                    >
                        🗺️ Route AI
                    </button>
                    <button 
                        onClick={loadVehicles}
                        style={{ 
                            padding: "20px", 
                            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", 
                            border: "2px solid #e5e7eb", 
                            borderRadius: "12px", 
                            fontSize: "16px", 
                            cursor: "pointer", 
                            fontWeight: "600",
                            textAlign: "center",
                            transition: "transform 0.2s, box-shadow 0.2s"
                        }}
                    >
                        🔄 Refresh Data
                    </button>
                    <button 
                        onClick={() => setActiveTab("reports")}
                        style={{ 
                            padding: "20px", 
                            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", 
                            border: "2px solid #e5e7eb", 
                            borderRadius: "12px", 
                            fontSize: "16px", 
                            cursor: "pointer", 
                            fontWeight: "600",
                            textAlign: "center",
                            transition: "transform 0.2s, box-shadow 0.2s"
                        }}
                    >
                        📊 View Reports
                    </button>
                </div>
            </div>

            {/* Recent Vehicles */}
            <div className="recent-vehicles" style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#1f2937", marginBottom: "24px" }}>
                    🚛 Fleet Overview
                </h2>
                
                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <div style={{ 
                            width: "40px", 
                            height: "40px", 
                            margin: "0 auto 20px", 
                            border: "4px solid #e5e7eb", 
                            borderTop: "4px solid #3b82f6", 
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite"
                        }}></div>
                        <p style={{ margin: 0, fontSize: "16px", color: "#6b7280", fontWeight: "600" }}>Loading fleet data...</p>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚚</div>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>No vehicles in fleet</h3>
                        <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>Add your first vehicle to get started</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                        {vehicles.slice(0, 6).map((vehicle) => (
                            <div key={vehicle.id} style={{ 
                                background: "#f9fafb", 
                                borderRadius: "12px", 
                                padding: "20px", 
                                border: "1px solid #e5e7eb",
                                transition: "transform 0.2s"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                                            {vehicle.name}
                                        </h4>
                                        <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                                            {vehicle.registration} • {vehicle.type}
                                        </p>
                                    </div>
                                    <div style={{ 
                                        padding: "4px 12px", 
                                        borderRadius: "12px", 
                                        fontSize: "11px", 
                                        fontWeight: "600",
                                        backgroundColor: vehicle.status === "AVAILABLE" ? "rgba(34, 197, 94, 0.1)" : 
                                                         vehicle.status === "IN_USE" ? "rgba(59, 130, 246, 0.1)" : 
                                                         "rgba(239, 68, 68, 0.1)",
                                        color: vehicle.status === "AVAILABLE" ? "#22c55e" : 
                                              vehicle.status === "IN_USE" ? "#3b82f6" : 
                                              "#ef4444"
                                    }}>
                                        {vehicle.status === "AVAILABLE" ? "Available" : 
                                         vehicle.status === "IN_USE" ? "In Use" : 
                                         "Maintenance"}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button 
                                        onClick={() => setActiveTab("vehicles")}
                                        style={{ 
                                            flex: 1, 
                                            padding: "8px 12px", 
                                            background: "#3b82f6", 
                                            color: "white", 
                                            border: "none", 
                                            borderRadius: "6px", 
                                            fontSize: "12px", 
                                            cursor: "pointer", 
                                            fontWeight: "600"
                                        }}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {vehicles.length > 6 && (
                    <div style={{ textAlign: "center", marginTop: "24px" }}>
                        <button 
                            onClick={() => setActiveTab("vehicles")}
                            style={{ 
                                padding: "12px 24px", 
                                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "10px", 
                                fontSize: "14px", 
                                cursor: "pointer", 
                                fontWeight: "600",
                                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
                            }}
                        >
                            View All Vehicles ({vehicles.length})
                        </button>
                    </div>
                )}
            </div>
        </>
    );

    const renderReports = () => (
        <div>
            <h2 style={{ margin: "0 0 30px 0", fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>
                📊 Fleet Reports & Analytics
            </h2>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={{ 
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white",
                    boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)"
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>🚛 Total Fleet</div>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>{stats.total}</div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>{stats.evCount} EV vehicles</div>
                </div>

                <div style={{ 
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white",
                    boxShadow: "0 8px 20px rgba(34, 197, 94, 0.3)"
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>📈 Total Mileage</div>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>{formatNumber(stats.totalMileage)}</div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>Kilometers driven</div>
                </div>

                <div style={{ 
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white",
                    boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)"
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>⛽ Fuel Cost</div>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>{formatCurrency(stats.fuelCost)}</div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>Monthly average</div>
                </div>

                <div style={{ 
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white",
                    boxShadow: "0 8px 20px rgba(239, 68, 68, 0.3)"
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>🔧 Maintenance</div>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>{formatCurrency(stats.maintenanceCost)}</div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>{stats.maintenance} vehicles in service</div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                marginBottom: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    📊 Performance Metrics
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                    <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>🎯 Fleet Utilization</div>
                        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#10b981", marginBottom: "8px" }}>{stats.utilization}%</div>
                        <div style={{ height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ 
                                height: "100%", 
                                width: `${stats.utilization}%`,
                                background: "linear-gradient(90deg, #10b981, #34d399)",
                                borderRadius: "4px"
                            }}/>
                        </div>
                    </div>

                    <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>🚗 Active Drivers</div>
                        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#3b82f6", marginBottom: "8px" }}>{stats.activeDrivers}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Currently on duty</div>
                    </div>

                    <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>✅ Completed Trips</div>
                        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#8b5cf6", marginBottom: "8px" }}>{stats.completedTrips}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>This month</div>
                    </div>

                    <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>⏱️ Avg Trip Duration</div>
                        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#f59e0b", marginBottom: "8px" }}>{stats.averageTripDuration.toFixed(1)}h</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Hours per trip</div>
                    </div>
                </div>
            </div>

            {/* Revenue Analysis */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                marginBottom: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    💰 Revenue Analysis
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>
                            {formatCurrency(stats.revenue)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Monthly Revenue</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>
                            {formatCurrency(stats.revenue / 30)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Daily Average</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#8b5cf6" }}>
                            {formatCurrency(stats.revenue / stats.total)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Per Vehicle</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>
                            {formatNumber((stats.revenue / stats.totalMileage) * 100)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Revenue per 100km</div>
                    </div>
                </div>
            </div>

            {/* Vehicle Status Breakdown */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    🚛 Vehicle Status Breakdown
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                    <div style={{ textAlign: "center", padding: "20px", background: "#dcfce7", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
                        <div style={{ fontSize: "32px", fontWeight: "bold", color: "#22c55e" }}>
                            {stats.available}
                        </div>
                        <div style={{ fontSize: "14px", color: "#166534", marginTop: "5px" }}>✅ Available</div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>
                            {((stats.available / stats.total) * 100).toFixed(1)}% of fleet
                        </div>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#dbeafe", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
                        <div style={{ fontSize: "32px", fontWeight: "bold", color: "#3b82f6" }}>
                            {stats.inUse}
                        </div>
                        <div style={{ fontSize: "14px", color: "#1e40af", marginTop: "5px" }}>🚗 In Use</div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>
                            {((stats.inUse / stats.total) * 100).toFixed(1)}% of fleet
                        </div>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#fee2e2", borderRadius: "12px", border: "1px solid #fecaca" }}>
                        <div style={{ fontSize: "32px", fontWeight: "bold", color: "#ef4444" }}>
                            {stats.maintenance}
                        </div>
                        <div style={{ fontSize: "14px", color: "#991b1b", marginTop: "5px" }}>🔧 Maintenance</div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>
                            {((stats.maintenance / stats.total) * 100).toFixed(1)}% of fleet
                        </div>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f3e8ff", borderRadius: "12px", border: "1px solid #e9d5ff" }}>
                        <div style={{ fontSize: "32px", fontWeight: "bold", color: "#8b5cf6" }}>
                            {stats.evCount}
                        </div>
                        <div style={{ fontSize: "14px", color: "#6b21a8", marginTop: "5px" }}>⚡ EV Fleet</div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>
                            {((stats.evCount / stats.total) * 100).toFixed(1)}% of fleet
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout 
            title="Manager Dashboard" 
            menuItems={menuItems} 
            activeKey={activeTab}
            onMenuChange={setActiveTab}
        >
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "reports" && renderReports()}
        </DashboardLayout>
    );
}

export default Manager;
