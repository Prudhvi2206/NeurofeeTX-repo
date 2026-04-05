import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import DashboardLayout from "./DashboardLayout.jsx";
import "./Vehicles.css";

const API_BASE = "http://localhost:8080";
const TELEMETRY_STORAGE_KEY = "nf_vehicleTelemetry_v1";

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)) }
function randomBetween(min, max) { return min + Math.random() * (max - min) }
function roundCoord(n) { return Math.round(n * 100000) / 100000 }

function statusLabel(status) {
    if (status === "IN_USE") return "In Use"
    if (status === "MAINTENANCE") return "Needs Service"
    return "Available"
}

function statusColor(status) {
    if (status === "IN_USE") return "#3b82f6"
    if (status === "MAINTENANCE") return "#ef4444"
    return "#22c55e"
}

function statusBgColor(status) {
    if (status === "IN_USE") return "rgba(59, 130, 246, 0.1)"
    if (status === "MAINTENANCE") return "rgba(239, 68, 68, 0.1)"
    return "rgba(34, 197, 94, 0.1)"
}

function levelColor(pct) {
    if (pct <= 15) return "#ef4444"
    if (pct <= 35) return "#f59e0b"
    return "#22c55e"
}

function createInitialTelemetry(vehicle) {
    const baseLat = 12.9716
    const baseLng = 77.5946
    return {
        lat: baseLat + randomBetween(-0.04, 0.04),
        lng: baseLng + randomBetween(-0.04, 0.04),
        speedKph: 0,
        batteryPct: vehicle.type === "EV" ? randomBetween(55, 100) : null,
        fuelPct: vehicle.type === "EV" ? null : randomBetween(45, 100),
        updatedAt: Date.now(),
    }
}

function computeEffectiveStatus(vehicle, telemetry) {
    if (!telemetry) return vehicle.status
    const level = vehicle.type === "EV" ? telemetry.batteryPct : telemetry.fuelPct
    if (typeof level === "number" && level <= 15) return "MAINTENANCE"
    return vehicle.status
}

function simulateTick(prevTelemetry, vehicles) {
    const next = { ...prevTelemetry }
    for (const v of vehicles) {
        const id = String(v.id)
        const t = next[id]
        if (!t) continue
        const status = computeEffectiveStatus(v, t)
        const inUse = status === "IN_USE"
        const maintenance = status === "MAINTENANCE"
        let speedKph = t.speedKph ?? 0
        if (maintenance) speedKph = 0
        else if (inUse) speedKph = clamp(speedKph + randomBetween(-10, 10), 18, 92)
        else speedKph = 0
        let lat = t.lat
        let lng = t.lng
        if (inUse && speedKph > 0) {
            const step = speedKph / 140000
            lat = lat + randomBetween(-step, step)
            lng = lng + randomBetween(-step, step)
        }
        let batteryPct = t.batteryPct
        let fuelPct = t.fuelPct
        if (v.type === "EV") {
            const drain = inUse ? randomBetween(0.25, 0.8) : randomBetween(0, 0.05)
            const charge = maintenance ? randomBetween(0.35, 0.9) : 0
            batteryPct = clamp((batteryPct ?? 80) - drain + charge, 0, 100)
        } else {
            const burn = inUse ? randomBetween(0.18, 0.6) : randomBetween(0, 0.03)
            const refill = maintenance ? randomBetween(0.25, 0.8) : 0
            fuelPct = clamp((fuelPct ?? 70) - burn + refill, 0, 100)
        }
        next[id] = { ...t, lat, lng, speedKph, batteryPct, fuelPct, updatedAt: Date.now() }
    }
    return next
}

function Vehicles() {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(false)
    const [editId, setEditId] = useState(null)
    const [form, setForm] = useState({ name: "", registration: "", type: "EV", status: "AVAILABLE" })
    const [telemetry, setTelemetry] = useState(() => {
        try {
            const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY)
            return raw ? JSON.parse(raw) : {}
        } catch { return {} }
    })
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState("grid")
    const [statusFilter, setStatusFilter] = useState("all")

    const menuItems = useMemo(() => [
        { key: "dashboard", label: "Dashboard", icon: "📊", path: "/admin" },
        { key: "vehicles", label: "Fleet Inventory", icon: "🚚", path: "/vehicles" },
        { key: "maintenance", label: "Predictive Maint.", icon: "🔧", path: "/predictive-maintenance" },
        { key: "reports", label: "Reports", icon: "📈", path: "/admin" },
    ], [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const resetForm = () => {
        setEditId(null)
        setForm({ name: "", registration: "", type: "EV", status: "AVAILABLE" })
    }

    const loadVehicles = async () => {
        setLoading(true)
        try {
            const res = await axios.get(API_BASE + "/vehicles")
            setVehicles(res.data)
        } catch (e) {
            console.error("Failed to load vehicles", e)
            setVehicles([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadVehicles() }, [])

    useEffect(() => {
        if (vehicles.length === 0) {
            setTelemetry((prev) => (Object.keys(prev).length === 0 ? prev : {}))
            return
        }
        setTelemetry((prev) => {
            let changed = false
            const next = { ...prev }
            const ids = new Set(vehicles.map((v) => String(v.id)))
            for (const v of vehicles) {
                const id = String(v.id)
                if (!next[id]) { next[id] = createInitialTelemetry(v); changed = true }
                else if (v.type === "EV" && next[id].batteryPct == null) { next[id] = { ...next[id], batteryPct: randomBetween(55, 100), fuelPct: null }; changed = true }
                else if (v.type !== "EV" && next[id].fuelPct == null) { next[id] = { ...next[id], fuelPct: randomBetween(45, 100), batteryPct: null }; changed = true }
            }
            for (const existingId of Object.keys(next)) {
                if (!ids.has(existingId)) { delete next[existingId]; changed = true }
            }
            return changed ? next : prev
        })
    }, [vehicles])

    useEffect(() => {
        try { localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(telemetry)) } catch {}
    }, [telemetry])

    useEffect(() => {
        if (vehicles.length === 0) return
        const interval = setInterval(() => { setTelemetry((prev) => simulateTick(prev, vehicles)) }, 1000)
        return () => clearInterval(interval)
    }, [vehicles])

    const beginEdit = (v) => {
        setEditId(v.id)
        setForm({ name: v.name ?? "", registration: v.registration ?? "", type: v.type ?? "EV", status: v.status ?? "AVAILABLE" })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editId == null) {
                await axios.post(API_BASE + "/vehicles", { name: form.name, registration: form.registration, type: form.type, status: form.status })
            } else {
                await axios.put(API_BASE + "/vehicles/" + editId, { id: editId, name: form.name, registration: form.registration, type: form.type, status: form.status })
            }
            resetForm()
            await loadVehicles()
            alert("Vehicle saved!")
        } catch (e2) { alert("Failed: " + e2.message) }
    }

    const handleDelete = async (id) => {
        try { await axios.delete(API_BASE + "/vehicles/" + id); await loadVehicles() } catch (e) { alert("Failed to delete") }
    }

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.type.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || v.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const stats = useMemo(() => {
        const total = vehicles.length
        const available = vehicles.filter(v => v.status === "AVAILABLE").length
        const inUse = vehicles.filter(v => v.status === "IN_USE").length
        const maintenance = vehicles.filter(v => v.status === "MAINTENANCE").length
        const evCount = vehicles.filter(v => v.type === "EV").length
        const activeVehicles = vehicles.filter(v => v.status === "IN_USE").length
        const avgSpeed = vehicles.reduce((acc, v) => {
            const t = telemetry[String(v.id)]
            return acc + (t?.speedKph || 0)
        }, 0) / (vehicles.length || 1)
        const lowFuel = vehicles.filter(v => {
            const t = telemetry[String(v.id)]
            const level = v.type === "EV" ? t?.batteryPct : t?.fuelPct
            return typeof level === "number" && level <= 20
        }).length
        return { total, available, inUse, maintenance, evCount, activeVehicles, avgSpeed, lowFuel }
    }, [vehicles, telemetry])

    return (
        <DashboardLayout title="Fleet Management Dashboard" menuItems={menuItems} activeKey="vehicles">
            {/* Enhanced Statistics Cards */}
            <div className="enhanced-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div className="stat-card primary" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "24px", borderRadius: "16px", color: "white", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>🚚</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Total Fleet</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{stats.total}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>All vehicles</div>
                    </div>
                </div>
                
                <div className="stat-card success" style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", padding: "24px", borderRadius: "16px", color: "white", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>✅</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Available</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{stats.available}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Ready for deployment</div>
                    </div>
                </div>

                <div className="stat-card info" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", padding: "24px", borderRadius: "16px", color: "white", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>🚗</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Active Now</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{stats.inUse}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Currently on road</div>
                    </div>
                </div>

                <div className="stat-card warning" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", padding: "24px", borderRadius: "16px", color: "white", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>⚡</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>EV Fleet</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{stats.evCount}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Electric vehicles</div>
                    </div>
                </div>

                <div className="stat-card danger" style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", padding: "24px", borderRadius: "16px", color: "white", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>🔧</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Maintenance</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{stats.maintenance}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Needs service</div>
                    </div>
                </div>

                <div className="stat-card secondary" style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", padding: "24px", borderRadius: "16px", color: "white", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>⚠️</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Low Fuel</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{stats.lowFuel}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Need refuel/charge</div>
                    </div>
                </div>

                <div className="stat-card secondary" style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", padding: "24px", borderRadius: "16px", color: "white", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>📊</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Avg Speed</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{Math.round(stats.avgSpeed)}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>km/h</div>
                    </div>
                </div>

                <div className="stat-card secondary" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", padding: "24px", borderRadius: "16px", color: "white", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>📈</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Utilization</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{Math.round((stats.inUse / stats.total) * 100)}%</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Fleet efficiency</div>
                    </div>
                </div>
            </div>

            {/* Enhanced Control Panel */}
            <div className="enhanced-control-panel" style={{ background: "white", borderRadius: "16px", padding: "30px", marginBottom: "30px", boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                    <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>🚛 Fleet Control Center</h2>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <div className="search-container" style={{ position: "relative" }}>
                            <input
                                className="search-input"
                                type="text"
                                placeholder="🔍 Search vehicles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: "12px 16px 12px 40px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", width: "250px", transition: "border-color 0.3s" }}
                            />
                            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>🔍</span>
                        </div>
                        
                        <select
                            className="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", background: "white" }}
                        >
                            <option value="all">All Status</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="IN_USE">In Use</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                        
                        <select
                            className="view-selector"
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            style={{ padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", background: "white" }}
                        >
                            <option value="grid">Grid View</option>
                            <option value="list">List View</option>
                        </select>
                        
                        <button
                            onClick={loadVehicles}
                            style={{ padding: "12px 20px", background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", cursor: "pointer", fontWeight: "600" }}
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="enhanced-form" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", padding: "24px", background: "#f9fafb", borderRadius: "12px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>🚛 Vehicle Name</label>
                        <input className="modern-input" name="name" value={form.name} onChange={handleChange} required style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", transition: "border-color 0.3s" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>📝 Registration</label>
                        <input className="modern-input" name="registration" value={form.registration} onChange={handleChange} required style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", transition: "border-color 0.3s" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>⚙️ Type</label>
                        <select className="modern-input" name="type" value={form.type} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", background: "white" }}>
                            <option value="EV">🔋 Electric</option>
                            <option value="Diesel">⛽ Diesel</option>
                            <option value="Petrol">🛢️ Petrol</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>🚦 Status</label>
                        <select className="modern-input" name="status" value={form.status} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", background: "white" }}>
                            <option value="AVAILABLE">✅ Available</option>
                            <option value="IN_USE">🚗 In Use</option>
                            <option value="MAINTENANCE">🔧 Needs Service</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                        <button type="submit" className="btn-primary" style={{ padding: "12px 24px", background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)" }}>
                            {editId == null ? "➕ Add Vehicle" : "✏️ Update"}
                        </button>
                        {editId != null && (
                            <button type="button" onClick={resetForm} style={{ padding: "12px 24px", background: "#f3f4f6", color: "#374151", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", cursor: "pointer", fontWeight: "600" }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Enhanced Vehicle Cards */}
            {viewMode === "grid" ? (
                <div className="enhanced-vehicle-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
                    {filteredVehicles.map((v) => {
                        const t = telemetry[String(v.id)]
                        const effectiveStatus = computeEffectiveStatus(v, t)
                        const pctRaw = v.type === "EV" ? t?.batteryPct : t?.fuelPct
                        const pct = typeof pctRaw === "number" ? Math.round(pctRaw) : null
                        const mapsHref = t && typeof t.lat === "number" && typeof t.lng === "number" ? "https://www.google.com/maps?q=" + t.lat + "," + t.lng : null

                        return (
                            <div key={v.id} className="enhanced-vehicle-card" style={{ 
                                background: "white", 
                                borderRadius: "16px", 
                                padding: "24px", 
                                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)", 
                                border: "1px solid #e5e7eb", 
                                transition: "transform 0.3s, box-shadow 0.3s",
                                position: "relative",
                                overflow: "hidden"
                            }}>
                                {/* Status Badge */}
                                <div className="status-badge-enhanced" style={{ 
                                    position: "absolute", 
                                    top: "16px", 
                                    right: "16px", 
                                    padding: "6px 16px", 
                                    borderRadius: "20px", 
                                    fontSize: "12px", 
                                    fontWeight: "600", 
                                    backgroundColor: statusBgColor(effectiveStatus), 
                                    color: statusColor(effectiveStatus),
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                                }}>
                                    {statusLabel(effectiveStatus)}
                                </div>

                                {/* Vehicle Header */}
                                <div style={{ marginBottom: "20px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                        <div style={{ fontSize: "32px" }}>{v.type === "EV" ? "🔋" : "⛽"}</div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>{v.name}</h3>
                                            <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}>
                                                {v.registration} • {v.type}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div style={{ display: "flex", alignItems: "center", fontSize: "14px", color: "#6b7280", marginBottom: "16px", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                                    <span style={{ marginRight: "8px", fontSize: "16px" }}>📍</span>
                                    {mapsHref ? (
                                        <a href={mapsHref} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "600" }}>
                                            {roundCoord(t?.lat)}, {roundCoord(t?.lng)}
                                        </a>
                                    ) : (
                                        <span>Location unknown</span>
                                    )}
                                </div>

                                {/* Telemetry */}
                                <div style={{ background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                                        <div style={{ textAlign: "center", padding: "8px", background: "white", borderRadius: "8px" }}>
                                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Speed</div>
                                            <div style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937" }}>{t ? Math.round(t.speedKph) : "0"}</div>
                                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>km/h</div>
                                        </div>
                                        <div style={{ textAlign: "center", padding: "8px", background: "white", borderRadius: "8px" }}>
                                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>{v.type === "EV" ? "🔋 Battery" : "⛽ Fuel"}</div>
                                            <div style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937" }}>{pct == null ? "0" : pct}</div>
                                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>percent</div>
                                        </div>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div style={{ position: "relative" }}>
                                        <div style={{ height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                                            <div style={{ 
                                                height: "100%", 
                                                width: pct == null ? "0%" : pct + "%", 
                                                background: levelColor(pct), 
                                                transition: "width 0.5s ease",
                                                borderRadius: "4px"
                                            }}></div>
                                        </div>
                                        {pct != null && pct <= 20 && (
                                            <div style={{ position: "absolute", top: "-24px", right: "0", fontSize: "11px", color: "#ef4444", fontWeight: "600" }}>
                                                ⚠️ Low Fuel
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <button onClick={() => beginEdit(v)} style={{ 
                                        flex: 1, 
                                        padding: "12px 16px", 
                                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                                        color: "white", 
                                        border: "none", 
                                        borderRadius: "10px", 
                                        fontSize: "14px", 
                                        cursor: "pointer", 
                                        fontWeight: "600",
                                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
                                    }}>
                                        ✏️ Edit
                                    </button>
                                    <button onClick={() => handleDelete(v.id)} style={{ 
                                        flex: 1, 
                                        padding: "12px 16px", 
                                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", 
                                        color: "white", 
                                        border: "none", 
                                        borderRadius: "10px", 
                                        fontSize: "14px", 
                                        cursor: "pointer", 
                                        fontWeight: "600",
                                        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
                                    }}>
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="enhanced-table" style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)", borderBottom: "2px solid #e5e7eb" }}>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>🚛 Vehicle</th>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>⚙️ Type</th>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>🚦 Status</th>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>📊 Speed</th>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>⛽ Fuel/Battery</th>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>📍 Location</th>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>🔧 Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.map((v) => {
                                const t = telemetry[String(v.id)]
                                const effectiveStatus = computeEffectiveStatus(v, t)
                                const pctRaw = v.type === "EV" ? t?.batteryPct : t?.fuelPct
                                const pct = typeof pctRaw === "number" ? Math.round(pctRaw) : null

                                return (
                                    <tr key={v.id} style={{ borderBottom: "1px solid #f3f4f6", transition: "background-color 0.2s" }}>
                                        <td style={{ padding: "16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ fontSize: "24px" }}>{v.type === "EV" ? "🔋" : "⛽"}</div>
                                                <div>
                                                    <div style={{ fontWeight: "700", fontSize: "15px", color: "#1f2937" }}>{v.name}</div>
                                                    <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>{v.registration}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px", fontSize: "14px", color: "#374151", fontWeight: "500" }}>{v.type}</td>
                                        <td style={{ padding: "16px" }}>
                                            <span className="status-badge" style={{ 
                                                padding: "6px 12px", 
                                                borderRadius: "12px", 
                                                fontSize: "12px", 
                                                fontWeight: "600", 
                                                backgroundColor: statusBgColor(effectiveStatus), 
                                                color: statusColor(effectiveStatus) 
                                            }}>
                                                {statusLabel(effectiveStatus)}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px", fontSize: "14px", color: "#374151", fontWeight: "600" }}>{t ? Math.round(t.speedKph) + " km/h" : "0 km/h"}</td>
                                        <td style={{ padding: "16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>{pct == null ? "0%" : pct + "%"}</div>
                                                <div className="progress-bar" style={{ width: "60px", height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: pct == null ? "0%" : pct + "%", background: levelColor(pct) }}></div>
                                                </div>
                                                {pct != null && pct <= 20 && <span style={{ color: "#ef4444", fontSize: "12px" }}>⚠️</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px", fontSize: "14px", color: "#374151" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span>📍</span>
                                                {t ? `${roundCoord(t.lat)}, ${roundCoord(t.lng)}` : "Unknown"}
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px" }}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button onClick={() => beginEdit(v)} style={{ 
                                                    padding: "6px 12px", 
                                                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                                                    color: "white", 
                                                    border: "none", 
                                                    borderRadius: "6px", 
                                                    fontSize: "12px", 
                                                    cursor: "pointer", 
                                                    fontWeight: "600"
                                                }}>
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => handleDelete(v.id)} style={{ 
                                                    padding: "6px 12px", 
                                                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", 
                                                    color: "white", 
                                                    border: "none", 
                                                    borderRadius: "6px", 
                                                    fontSize: "12px", 
                                                    cursor: "pointer", 
                                                    fontWeight: "600"
                                                }}>
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Enhanced Empty State */}
            {!loading && filteredVehicles.length === 0 && (
                <div className="enhanced-empty-state" style={{ 
                    background: "white", 
                    borderRadius: "16px", 
                    padding: "60px", 
                    textAlign: "center", 
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)"
                }}>
                    <div style={{ fontSize: "64px", marginBottom: "20px" }}>🚚</div>
                    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#1f2937", marginBottom: "12px" }}>No vehicles found</h3>
                    <p style={{ margin: 0, fontSize: "16px", color: "#6b7280", lineHeight: "1.6" }}>
                        {searchTerm ? "Try adjusting your search terms or filters" : "Add your first vehicle to get started with your fleet management"}
                    </p>
                </div>
            )}

            {/* Enhanced Loading State */}
            {loading && (
                <div className="enhanced-loading-state" style={{ 
                    background: "white", 
                    borderRadius: "16px", 
                    padding: "60px", 
                    textAlign: "center", 
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)"
                }}>
                    <div className="loading-spinner" style={{ 
                        width: "40px", 
                        height: "40px", 
                        margin: "0 auto 20px", 
                        border: "4px solid #e5e7eb", 
                        borderTop: "4px solid #3b82f6", 
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }}></div>
                    <p style={{ margin: 0, fontSize: "18px", color: "#6b7280", fontWeight: "600" }}>Loading vehicles...</p>
                </div>
            )}
        </DashboardLayout>
    )
}

export default Vehicles
