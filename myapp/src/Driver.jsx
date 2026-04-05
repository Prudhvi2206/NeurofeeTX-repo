import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "./DashboardLayout.jsx";

function Driver() {
    const navigate = useNavigate();
    const [data, setData] = useState({});
    const [activeTab, setActiveTab] = useState("dashboard");
    const [tripInput, setTripInput] = useState({ distance: "", rate: "" });
    const [tripEarnings, setTripEarnings] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recentTrips, setRecentTrips] = useState([]);
    const [performance, setPerformance] = useState({
        totalTrips: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalDistance: 0,
        fuelEfficiency: 0,
        onTimeRate: 0
    });

    // Authentication check
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        
        if (!token) {
            navigate("/login");
            return;
        }
        
        if (role !== "DRIVER") {
            // Redirect based on role
            if (role === "ADMIN") navigate("/admin");
            else if (role === "MANAGER") navigate("/manager");
            else if (role === "CUSTOMER") navigate("/customer");
            else navigate("/login");
            return;
        }

        loadDashboardData();
    }, [navigate]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8080/driver/dashboard", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setData(res.data);
            loadRecentTrips();
            calculatePerformance(res.data);
        } catch (error) {
            console.error("Dashboard error:", error);
            // Fallback demo data
            const fallbackData = {
                "Assigned Trips": 8,
                "Trip Status": "Active",
                "EarningsDay": 2500,
                "EarningsWeek": 15000,
                "EarningsMonth": 45000,
                totalTrips: 156,
                totalEarnings: 125000,
                averageRating: 4.6,
                totalDistance: 12500,
                fuelEfficiency: 8.5,
                onTimeRate: 92
            };
            setData(fallbackData);
            calculatePerformance(fallbackData);
            loadRecentTrips();
        } finally {
            setLoading(false);
        }
    };

    const loadRecentTrips = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8080/driver/recent-trips", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRecentTrips(res.data);
        } catch (error) {
            console.error("Trips error:", error);
            // Fallback demo data
            setRecentTrips([
                { id: 1, destination: "Electronic City", distance: 25, earnings: 750, status: "completed", time: "2 hours ago", rating: 5 },
                { id: 2, destination: "Whitefield", distance: 18, earnings: 540, status: "completed", time: "4 hours ago", rating: 4 },
                { id: 3, destination: "Koramangala", distance: 12, earnings: 360, status: "in-progress", time: "Started 30 mins ago", rating: null },
                { id: 4, destination: "Indiranagar", distance: 15, earnings: 450, status: "completed", time: "6 hours ago", rating: 5 },
                { id: 5, destination: "HSR Layout", distance: 20, earnings: 600, status: "completed", time: "8 hours ago", rating: 4 },
            ]);
        }
    };

    const calculatePerformance = (dashboardData) => {
        setPerformance({
            totalTrips: dashboardData.totalTrips || 156,
            totalEarnings: dashboardData.totalEarnings || 125000,
            averageRating: dashboardData.averageRating || 4.6,
            totalDistance: dashboardData.totalDistance || 12500,
            fuelEfficiency: dashboardData.fuelEfficiency || 8.5,
            onTimeRate: dashboardData.onTimeRate || 92
        });
    };

    const assignedTrips = data["Assigned Trips"] ?? 8;
    const tripStatus = data["Trip Status"] ?? "Active";
    const earningsDay = data["EarningsDay"] ?? 2500;
    const earningsWeek = data["EarningsWeek"] ?? 15000;
    const earningsMonth = data["EarningsMonth"] ?? 45000;

    const menuItems = [
        { key: "dashboard", label: "Dashboard", icon: "📊" },
        { key: "trips", label: "My Trips", icon: "🧭" },
        { key: "vehicle", label: "Assigned Vehicle", icon: "🚚" },
        { key: "maintenance", label: "Predictive Maint.", icon: "🔧", path: "/predictive-maintenance" },
        { key: "earnings", label: "Earnings", icon: "💰" },
    ];

    const handleTripCalc = (e) => {
        e.preventDefault();
        const distance = parseFloat(tripInput.distance || "0");
        const rate = parseFloat(tripInput.rate || "0");
        setTripEarnings(distance * rate);
    };

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(num);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num);
    };

    const renderDashboard = () => (
        <>
            {/* Driver Overview Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={{ 
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white", 
                    position: "relative", 
                    overflow: "hidden",
                    boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)"
                }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>🧭</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Assigned Trips</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{assignedTrips}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Today's schedule</div>
                    </div>
                </div>
                
                <div style={{ 
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white", 
                    position: "relative", 
                    overflow: "hidden",
                    boxShadow: "0 8px 20px rgba(34, 197, 94, 0.3)"
                }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>🚗</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Current Status</div>
                        <div style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "4px" }}>{tripStatus}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Trip activity</div>
                    </div>
                </div>

                <div style={{ 
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white", 
                    position: "relative", 
                    overflow: "hidden",
                    boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)"
                }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>💰</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Today's Earnings</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{formatCurrency(earningsDay)}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Daily income</div>
                    </div>
                </div>

                <div style={{ 
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white", 
                    position: "relative", 
                    overflow: "hidden",
                    boxShadow: "0 8px 20px rgba(239, 68, 68, 0.3)"
                }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>⭐</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Average Rating</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{performance.averageRating}/5</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Customer satisfaction</div>
                    </div>
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
                    📊 Performance Overview
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>
                            {formatNumber(performance.totalTrips)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Total Trips</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>
                            {formatNumber(performance.totalDistance)} km
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Total Distance</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#8b5cf6" }}>
                            {performance.fuelEfficiency} km/l
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Fuel Efficiency</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>
                            {performance.onTimeRate}%
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>On-Time Rate</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    🔄 Recent Trips
                </h3>
                
                <div style={{ display: "grid", gap: "15px" }}>
                    {recentTrips.slice(0, 5).map((trip) => (
                        <div key={trip.id} style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            padding: "16px",
                            background: "#f9fafb",
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                <div style={{ 
                                    width: "40px", 
                                    height: "40px", 
                                    borderRadius: "50%",
                                    background: trip.status === "completed" ? "#dcfce7" : 
                                                   trip.status === "in-progress" ? "#dbeafe" : "#fee2e2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "20px"
                                }}>
                                    {trip.status === "completed" ? "✅" : 
                                     trip.status === "in-progress" ? "🚗" : "⏳"}
                                </div>
                                <div>
                                    <div style={{ fontWeight: "600", color: "#1f2937" }}>
                                        {trip.destination}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                        {trip.distance} km • {trip.time}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: "bold", color: "#10b981" }}>
                                    {formatCurrency(trip.earnings)}
                                </div>
                                {trip.rating && (
                                    <div style={{ fontSize: "12px", color: "#f59e0b" }}>
                                        ⭐ {trip.rating}/5
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );

    const renderTrips = () => (
        <div>
            <h2 style={{ margin: "0 0 30px 0", fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>
                🧭 Trip Management
            </h2>

            {/* Trip Calculator */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                marginBottom: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    💰 Trip Earnings Calculator
                </h3>
                
                <form onSubmit={handleTripCalc} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                            Distance (km)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={tripInput.distance}
                            onChange={(e) => setTripInput((p) => ({ ...p, distance: e.target.value }))}
                            style={{ 
                                width: "100%", 
                                padding: "12px", 
                                border: "1px solid #d1d5db", 
                                borderRadius: "8px",
                                fontSize: "14px"
                            }}
                            placeholder="Enter distance"
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                            Rate (₹ per km)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={tripInput.rate}
                            onChange={(e) => setTripInput((p) => ({ ...p, rate: e.target.value }))}
                            style={{ 
                                width: "100%", 
                                padding: "12px", 
                                border: "1px solid #d1d5db", 
                                borderRadius: "8px",
                                fontSize: "14px"
                            }}
                            placeholder="Enter rate"
                        />
                    </div>
                    <div style={{ alignSelf: "end" }}>
                        <button 
                            type="submit" 
                            style={{
                                padding: "12px 24px",
                                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
                            }}
                        >
                            Calculate Earnings
                        </button>
                    </div>
                </form>
                
                {tripEarnings != null && (
                    <div style={{ 
                        marginTop: "20px", 
                        padding: "20px", 
                        background: "#f0fdf4", 
                        borderRadius: "12px", 
                        border: "1px solid #bbf7d0"
                    }}>
                        <div style={{ fontSize: "16px", color: "#166534", textAlign: "center" }}>
                            <div style={{ fontSize: "14px", marginBottom: "8px" }}>Estimated Trip Earnings</div>
                            <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                                {formatCurrency(tripEarnings)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Trips List */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    📋 Trip History
                </h3>
                
                <div style={{ display: "grid", gap: "15px" }}>
                    {recentTrips.map((trip) => (
                        <div key={trip.id} style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            padding: "20px",
                            background: "#f9fafb",
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                <div style={{ 
                                    width: "50px", 
                                    height: "50px", 
                                    borderRadius: "50%",
                                    background: trip.status === "completed" ? "#dcfce7" : 
                                                   trip.status === "in-progress" ? "#dbeafe" : "#fee2e2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px"
                                }}>
                                    {trip.status === "completed" ? "✅" : 
                                     trip.status === "in-progress" ? "🚗" : "⏳"}
                                </div>
                                <div>
                                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                                        {trip.destination}
                                    </div>
                                    <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                                        {trip.distance} km • {trip.time}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                                        Status: <span style={{
                                            fontWeight: "500",
                                            color: trip.status === "completed" ? "#059669" : 
                                                  trip.status === "in-progress" ? "#2563eb" : "#d97706"
                                        }}>{trip.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#10b981" }}>
                                    {formatCurrency(trip.earnings)}
                                </div>
                                {trip.rating && (
                                    <div style={{ fontSize: "14px", color: "#f59e0b", marginTop: "4px" }}>
                                        ⭐ {trip.rating}/5
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderVehicle = () => (
        <div>
            <h2 style={{ margin: "0 0 30px 0", fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>
                🚚 Assigned Vehicle
            </h2>

            {!vehicle ? (
                <div style={{ 
                    background: "white", 
                    borderRadius: "16px", 
                    padding: "60px", 
                    textAlign: "center",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
                }}>
                    <div style={{ fontSize: "48px", marginBottom: "20px" }}>🚚</div>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
                        Load Assigned Vehicle
                    </h3>
                    <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#6b7280" }}>
                        Click the button below to load your assigned vehicle details
                    </p>
                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem("token");
                                const res = await axios.get(
                                    "http://localhost:8080/driver/assigned-vehicle",
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                );
                                setVehicle(res.data);
                            } catch (e) {
                                // Fallback demo data
                                setVehicle({
                                    name: "EV Truck 001",
                                    registration: "KA-01-AB-1234",
                                    type: "EV",
                                    status: "AVAILABLE",
                                    batteryPercent: 85,
                                    lastServiceKm: 15000,
                                    nextServiceKm: 20000,
                                    mileage: 25000,
                                    fuelType: "Electric",
                                    capacity: "5 tons"
                                });
                            }
                        }}
                        style={{
                            padding: "12px 24px",
                            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
                        }}
                    >
                        Load Assigned Vehicle
                    </button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                    {/* Vehicle Details */}
                    <div style={{ 
                        background: "white", 
                        borderRadius: "16px", 
                        padding: "30px", 
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
                    }}>
                        <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                            🚛 Vehicle Information
                        </h3>
                        
                        <div style={{ display: "grid", gap: "15px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                                <span style={{ fontSize: "14px", color: "#6b7280" }}>Vehicle Name</span>
                                <span style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{vehicle.name}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                                <span style={{ fontSize: "14px", color: "#6b7280" }}>Registration</span>
                                <span style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{vehicle.registration}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                                <span style={{ fontSize: "14px", color: "#6b7280" }}>Type</span>
                                <span style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{vehicle.type}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                                <span style={{ fontSize: "14px", color: "#6b7280" }}>Status</span>
                                <span style={{ 
                                    fontSize: "14px", 
                                    fontWeight: "600", 
                                    padding: "4px 8px",
                                    borderRadius: "12px",
                                    background: vehicle.status === "AVAILABLE" ? "#dcfce7" : 
                                                   vehicle.status === "IN_USE" ? "#dbeafe" : "#fee2e2",
                                    color: vehicle.status === "AVAILABLE" ? "#166534" : 
                                          vehicle.status === "IN_USE" ? "#1e40af" : "#991b1b"
                                }}>{vehicle.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Performance */}
                    <div style={{ 
                        background: "white", 
                        borderRadius: "16px", 
                        padding: "30px", 
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
                    }}>
                        <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                            📊 Performance Metrics
                        </h3>
                        
                        <div style={{ display: "grid", gap: "20px" }}>
                            <div>
                                <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                                    🔋 Battery Level
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <div style={{ fontSize: "24px", fontWeight: "bold", color: vehicle.batteryPercent > 50 ? "#10b981" : "#f59e0b" }}>
                                        {vehicle.batteryPercent}%
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ 
                                            height: "8px", 
                                            background: "#e5e7eb", 
                                            borderRadius: "4px",
                                            overflow: "hidden"
                                        }}>
                                            <div style={{ 
                                                height: "100%", 
                                                width: `${vehicle.batteryPercent}%`,
                                                background: vehicle.batteryPercent > 50 ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                                                borderRadius: "4px"
                                            }}/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px" }}>
                                <div style={{ textAlign: "center", padding: "15px", background: "#f9fafb", borderRadius: "8px" }}>
                                    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#3b82f6" }}>
                                        {formatNumber(vehicle.mileage || 25000)}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Total Mileage</div>
                                </div>
                                <div style={{ textAlign: "center", padding: "15px", background: "#f9fafb", borderRadius: "8px" }}>
                                    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#8b5cf6" }}>
                                        {vehicle.capacity || "5 tons"}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Capacity</div>
                                </div>
                            </div>

                            <div style={{ padding: "15px", background: "#f9fafb", borderRadius: "8px" }}>
                                <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                                    🔧 Service Information
                                </div>
                                <div style={{ fontSize: "13px", color: "#374151" }}>
                                    Last service: {vehicle.lastServiceKm || 15000} km<br/>
                                    Next service: {vehicle.nextServiceKm || 20000} km
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderEarnings = () => (
        <div>
            <h2 style={{ margin: "0 0 30px 0", fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>
                💰 Earnings Overview
            </h2>

            {/* Earnings Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={{ 
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white",
                    boxShadow: "0 8px 20px rgba(34, 197, 94, 0.3)"
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>📅 Today</div>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>{formatCurrency(earningsDay)}</div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>Daily earnings</div>
                </div>

                <div style={{ 
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white",
                    boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)"
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>📆 This Week</div>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>{formatCurrency(earningsWeek)}</div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>Weekly total</div>
                </div>

                <div style={{ 
                    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white",
                    boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)"
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>📊 This Month</div>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>{formatCurrency(earningsMonth)}</div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>Monthly earnings</div>
                </div>

                <div style={{ 
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white",
                    boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)"
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>🎯 Total Earnings</div>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>{formatCurrency(performance.totalEarnings)}</div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>All time</div>
                </div>
            </div>

            {/* Earnings Analysis */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                marginBottom: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    📈 Earnings Analysis
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>
                            {formatCurrency(earningsDay / (assignedTrips || 1))}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Average per Trip</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>
                            {formatCurrency(earningsWeek / 7)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Daily Average</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#8b5cf6" }}>
                            {formatCurrency(earningsMonth / 30)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Monthly Daily Avg</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>
                            {((earningsMonth / performance.totalEarnings) * 100).toFixed(1)}%
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Monthly Contribution</div>
                    </div>
                </div>
            </div>

            {/* Performance vs Earnings */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    🎯 Performance Metrics
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                    <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>🧭 Total Trips</div>
                        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#3b82f6", marginBottom: "8px" }}>{performance.totalTrips}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Completed deliveries</div>
                    </div>

                    <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>💰 Avg per Trip</div>
                        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#10b981", marginBottom: "8px" }}>
                            {formatCurrency(performance.totalEarnings / performance.totalTrips)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Average earnings</div>
                    </div>

                    <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>⭐ Average Rating</div>
                        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#f59e0b", marginBottom: "8px" }}>{performance.averageRating}/5</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Customer satisfaction</div>
                    </div>

                    <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>📈 Total Distance</div>
                        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#8b5cf6", marginBottom: "8px" }}>{formatNumber(performance.totalDistance)} km</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Kilometers driven</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout
            title="Driver Dashboard Overview"
            menuItems={menuItems}
            activeKey={activeTab}
            onMenuChange={setActiveTab}
        >
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px" }}>
                    <div style={{ 
                        width: "40px", 
                        height: "40px", 
                        margin: "0 auto 20px", 
                        border: "4px solid #e5e7eb", 
                        borderTop: "4px solid #3b82f6", 
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }}></div>
                    <p style={{ margin: 0, fontSize: "16px", color: "#6b7280", fontWeight: "600" }}>Loading dashboard...</p>
                </div>
            ) : (
                <>
                    {activeTab === "dashboard" && renderDashboard()}
                    {activeTab === "trips" && renderTrips()}
                    {activeTab === "vehicle" && renderVehicle()}
                    {activeTab === "earnings" && renderEarnings()}
                </>
            )}
        </DashboardLayout>
    );
}

export default Driver;