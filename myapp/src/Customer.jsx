import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "./DashboardLayout.jsx";
import RouteMap from "./RouteMap.jsx";

function Customer() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        myBookings: 0,
        bookingHistory: 0,
        paymentStatus: "Pending",
        totalSpent: 0,
        loyaltyPoints: 0,
        activeBookings: 0,
        cancelledBookings: 0,
        completedBookings: 0,
    });
    const [activeTab, setActiveTab] = useState("dashboard");
    const [bookings, setBookings] = useState(() => {
        const saved = localStorage.getItem("customerBookings");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("customerBookings", JSON.stringify(bookings));
    }, [bookings]);

    const [newBooking, setNewBooking] = useState({
        pickup: "",
        drop: "",
        date: "",
        timeSlot: "",
        vehicleType: "",
        vehicleId: null,
        estimatedCost: 0,
    });
    
    // Feature states
    const [extras, setExtras] = useState({
        fragile: false,
        express: false,
        helper: false
    });
    const [promoCode, setPromoCode] = useState("");
    const [discountApplied, setDiscountApplied] = useState(false);
    const [bookingError, setBookingError] = useState("");
    
    // Smart Booking States
    const [bookingFilters, setBookingFilters] = useState({
        type: "All",
        seats: "All",
        isEV: "All"
    });
    
    const [availableVehicles] = useState([
        { id: 1, name: "Eco Move (TATA Ace EV)", type: "Truck", seats: 2, isEV: "Yes", basePrice: 30, image: "🚚", features: ["Zero Emissions", "1 Ton Capacity"] },
        { id: 2, name: "City Glide (Tata Magic)", type: "Van", seats: 8, isEV: "No", basePrice: 25, image: "🚐", features: ["AC", "Comfortable Seating"] },
        { id: 3, name: "Green Shuttle (Force Urbania EV)", type: "Van", seats: 12, isEV: "Yes", basePrice: 40, image: "🚌", features: ["Spacious", "Premium EV"] },
        { id: 4, name: "Swift Sedan (Dzire)", type: "Car", seats: 4, isEV: "No", basePrice: 20, image: "🚕", features: ["Fast", "Perfect for 4"] },
        { id: 5, name: "Cyber Haul", type: "Truck", seats: 2, isEV: "Yes", basePrice: 50, image: "🚛", features: ["Heavy Duty", "Long Range"] },
        { id: 6, name: "City Cruiser (Innova Crysta)", type: "Car", seats: 6, isEV: "No", basePrice: 35, image: "🚙", features: ["Premium Comfort", "Family Trip"] },
        { id: 7, name: "Compact EV (Tata Tiago EV)", type: "Car", seats: 4, isEV: "Yes", basePrice: 18, image: "⚡", features: ["City driving", "Low cost"] },
        { id: 8, name: "Heavy Lifter (Tata 407)", type: "Truck", seats: 2, isEV: "No", basePrice: 45, image: "🚛", features: ["2.5 Ton Capacity", "Reliable"] },
        { id: 9, name: "Eco Scooter (Ather 450X)", type: "Bike", seats: 1, isEV: "Yes", basePrice: 8, image: "🛵", features: ["Fast Delivery", "Zero Emissions"] },
        { id: 10, name: "City Cruiser Bike (Honda Activa)", type: "Bike", seats: 1, isEV: "No", basePrice: 5, image: "🏍️", features: ["Quick Rides", "Economical"] },
        { id: 11, name: "Auto Rickshaw (Bajaj RE)", type: "Auto", seats: 3, isEV: "No", basePrice: 12, image: "🛺", features: ["Spacious", "City Friendly"] },
        { id: 12, name: "E-Rickshaw (Mahindra Treo)", type: "Auto", seats: 3, isEV: "Yes", basePrice: 15, image: "🛺", features: ["Eco-friendly", "Smooth Ride"] }
    ]);
    
    const [recommendedVehicle, setRecommendedVehicle] = useState(null);
    
    useEffect(() => {
        let matchedVehicle = null;
        let matchScore = 0;
        let reason = "";

        if (bookingFilters.type !== "All" || bookingFilters.isEV !== "All" || bookingFilters.seats !== "All") {
            const matches = availableVehicles.filter(v => 
                (bookingFilters.type === "All" || v.type === bookingFilters.type) &&
                (bookingFilters.seats === "All" || (
                    bookingFilters.seats === "1" ? v.seats === 1 :
                    bookingFilters.seats === "2" ? v.seats === 2 : 
                    bookingFilters.seats === "3" ? v.seats === 3 :
                    bookingFilters.seats === "4" ? v.seats === 4 : 
                    bookingFilters.seats === "6+" ? v.seats >= 6 : true
                )) &&
                (bookingFilters.isEV === "All" || v.isEV === bookingFilters.isEV)
            );
            if (matches.length > 0) {
                matchedVehicle = matches[0];
                matchScore = 98;
                reason = "Perfectly matches all your selected filters!";
            }
        } else {
            matchedVehicle = availableVehicles[0];
            matchScore = 92;
            reason = "Based on your eco-friendly past bookings.";
        }
        
        setRecommendedVehicle(matchedVehicle ? { ...matchedVehicle, matchScore, reason } : null);
        
        if (matchedVehicle) {
            setNewBooking(prev => ({ ...prev, vehicleId: matchedVehicle.id, vehicleType: matchedVehicle.name, estimatedCost: matchedVehicle.basePrice * 10 }));
        } else {
            setNewBooking(prev => ({ ...prev, vehicleId: null, vehicleType: "", estimatedCost: 0 }));
        }
    }, [bookingFilters, availableVehicles]);

    const timeSlots = [
        { time: "08:00 AM - 10:00 AM", multiple: 1.0, label: "Morning" }, 
        { time: "10:30 AM - 12:30 PM", multiple: 1.2, label: "Peak Hrs" }, 
        { time: "01:00 PM - 03:00 PM", multiple: 1.0, label: "Afternoon" }, 
        { time: "03:30 PM - 05:30 PM", multiple: 1.3, label: "Evening Rush" }, 
        { time: "06:00 PM - 08:00 PM", multiple: 1.1, label: "Night" }
    ];

    const [trackingEta, setTrackingEta] = useState("10 mins");
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        preferences: "",
    });
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recentActivity, setRecentActivity] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);

    // Authentication check
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        
        if (!token) {
            navigate("/login");
            return;
        }
        
        if (role !== "CUSTOMER") {
            // Redirect based on role
            if (role === "ADMIN") navigate("/admin");
            else if (role === "MANAGER") navigate("/manager");
            else if (role === "DRIVER") navigate("/driver");
            else navigate("/login");
            return;
        }

        loadDashboardData();
        loadProfileData();
    }, [navigate]);

    const loadProfileData = async () => {
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) return;
            const res = await axios.get(`http://localhost:8080/api/profile/${userId}`);
            const p = res.data;
            setProfile({
                name: p.name || "",
                email: p.email || "",
                phone: p.phone || "",
                address: p.location || "",
                preferences: p.travelPreferences || "",
            });
        } catch(e) {
            console.error("Profile load err", e);
        }
    };


    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8080/customer/dashboard", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setData(res.data);
            loadRecentActivity();
            loadPaymentHistory();
        } catch (error) {
            console.error("Dashboard error:", error);
            // Fallback demo data
            const fallbackData = {
                myBookings: 12,
                bookingHistory: 48,
                paymentStatus: "Paid",
                totalSpent: 15000,
                loyaltyPoints: 850,
                activeBookings: 2,
                cancelledBookings: 3,
                completedBookings: 43,
            };
            setData(fallbackData);
            loadRecentActivity();
            loadPaymentHistory();
        } finally {
            setLoading(false);
        }
    };

    const loadRecentActivity = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8080/customer/recent-activity", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRecentActivity(res.data);
        } catch (error) {
            console.error("Activity error:", error);
            // Fallback demo data
            setRecentActivity([
                { id: 1, type: "booking", description: "Booked EV Truck to Whitefield", time: "2 hours ago", status: "confirmed" },
                { id: 2, type: "payment", description: "Payment completed for trip", time: "5 hours ago", status: "success" },
                { id: 3, type: "tracking", description: "Driver arrived at pickup location", time: "1 day ago", status: "completed" },
                { id: 4, type: "support", description: "Support ticket resolved", time: "2 days ago", status: "resolved" },
                { id: 5, type: "booking", description: "Cancelled booking to Koramangala", time: "3 days ago", status: "cancelled" },
            ]);
        }
    };

    const loadPaymentHistory = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8080/customer/payment-history", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPaymentHistory(res.data);
        } catch (error) {
            console.error("Payment error:", error);
            // Fallback demo data
            setPaymentHistory([
                { id: 1, amount: 750, date: "2024-03-10", status: "Paid", method: "Credit Card", bookingId: "BK001" },
                { id: 2, amount: 540, date: "2024-03-08", status: "Paid", method: "UPI", bookingId: "BK002" },
                { id: 3, amount: 360, date: "2024-03-05", status: "Paid", method: "Net Banking", bookingId: "BK003" },
                { id: 4, amount: 900, date: "2024-03-01", status: "Paid", method: "Credit Card", bookingId: "BK004" },
                { id: 5, amount: 1200, date: "2024-02-28", status: "Refunded", method: "Credit Card", bookingId: "BK005" },
            ]);
        }
    };

    const menuItems = [
        { key: "dashboard", label: "Dashboard", icon: "📊" },
        { key: "bookings", label: "My Bookings", icon: "📅" },
        { key: "tracking", label: "Live Tracking", icon: "🧭" },
        { key: "maintenance", label: "Predictive Maint.", icon: "🔧", path: "/predictive-maintenance" },
        { key: "payments", label: "Payments", icon: "💳" },
        { key: "profile", label: "Profile", icon: "👤" },
        { key: "support", label: "Support", icon: "🆘" },
    ];

    const handleNewBookingChange = (e) => {
        const { name, value } = e.target;
        setNewBooking((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setBookingFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const handleExtraChange = (e) => {
        const { name, checked } = e.target;
        setExtras(prev => ({ ...prev, [name]: checked }));
    };

    const handleApplyPromo = () => {
        if (promoCode.toUpperCase() === "NEURO10") {
            setDiscountApplied(true);
            alert("Promo code 'NEURO10' applied! 10% discount on total fare.");
        } else {
            alert("Invalid or expired promo code.");
            setDiscountApplied(false);
        }
    };

    const calculateFinalCost = () => {
        if (!newBooking.estimatedCost || !newBooking.timeSlot) return 0;
        const selectedSlotDetail = timeSlots.find(s => s.time === newBooking.timeSlot);
        let finalCost = newBooking.estimatedCost * (selectedSlotDetail ? selectedSlotDetail.multiple : 1);
        
        if (extras.fragile) finalCost += 150;
        if (extras.express) finalCost += 300;
        if (extras.helper) finalCost += 500;
        
        if (discountApplied) {
            finalCost = finalCost * 0.9;
        }
        return finalCost;
    };

    const handleSelectVehicle = (vehicle) => {
        setNewBooking(prev => ({ 
            ...prev, 
            vehicleId: vehicle.id, 
            vehicleType: vehicle.name,
            estimatedCost: vehicle.basePrice * 10 
        }));
    };

    const handleSelectSlot = (slot) => {
        setNewBooking(prev => ({
            ...prev,
            timeSlot: slot.time
        }));
    };

    const handleAddBooking = (e) => {
        e.preventDefault();
        if (!newBooking.pickup || !newBooking.drop || !newBooking.vehicleId || !newBooking.date || !newBooking.timeSlot) {
            setBookingError("⚠️ Please complete all required fields (Locations, Date, and Time Slot).");
            return;
        }
        setBookingError("");
        
        const finalCost = calculateFinalCost();
        const earnedPoints = Math.floor(finalCost / 100);

        const booking = {
            id: Date.now(),
            ...newBooking,
            estimatedCost: finalCost,
            status: "confirmed",
            driver: "Driver " + Math.floor(Math.random() * 100),
            estimatedTime: extras.express ? "10-15 mins" : "20-30 mins",
            time: `${newBooking.date} ${newBooking.timeSlot}`,
            earnedPoints
        };
        
        setBookings((prev) => [...prev, booking]);
        setNewBooking({ pickup: "", drop: "", date: "", timeSlot: "", vehicleType: "", vehicleId: null, estimatedCost: 0 });
        setExtras({ fragile: false, express: false, helper: false });
        setPromoCode("");
        setDiscountApplied(false);
        setBookingError("");
        
        // Update dashboard data
        setData((prev) => ({
            ...prev,
            myBookings: prev.myBookings + 1,
            activeBookings: prev.activeBookings + 1,
            loyaltyPoints: prev.loyaltyPoints + earnedPoints
        }));
        
        alert(`Booking Confirmed! You earned ${earnedPoints} Loyalty Points! Redirecting to tracking...`);
        setActiveTab("tracking");
    };

    const handleCancelBooking = (bookingId) => {
        if(window.confirm("Are you sure you want to cancel this ride? Cancellation charges may apply.")) {
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b));
            
            setData(prev => ({
                ...prev,
                activeBookings: Math.max(0, prev.activeBookings - 1),
                cancelledBookings: prev.cancelledBookings + 1
            }));
            
            alert("Ride cancelled successfully.");
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                alert("User session invalid.");
                return;
            }
            await axios.put(`http://localhost:8080/api/profile/${userId}`, {
                name: profile.name,
                phone: profile.phone,
                location: profile.address,
                travelPreferences: profile.preferences,
            });
            alert("Profile saved successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to save profile.");
        }
    };

    const handleSupportSubmit = (e) => {
        e.preventDefault();
        setTicket(`TCK-${Date.now().toString().slice(-6)}`);
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
            {/* Customer Overview Stats */}
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
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>📅</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Total Bookings</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{formatNumber(data.myBookings)}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>{data.activeBookings} active</div>
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
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>📚</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Booking History</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{formatNumber(data.bookingHistory)}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>{data.completedBookings} completed</div>
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
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Total Spent</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{formatCurrency(data.totalSpent)}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Lifetime spending</div>
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
                        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Loyalty Points</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "4px" }}>{formatNumber(data.loyaltyPoints)}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Available rewards</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                marginBottom: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    🔄 Recent Activity
                </h3>
                
                <div style={{ display: "grid", gap: "15px" }}>
                    {recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} style={{ 
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
                                    background: activity.type === "booking" ? "#dbeafe" : 
                                                   activity.type === "payment" ? "#dcfce7" : 
                                                   activity.type === "tracking" ? "#fef3c7" : "#fee2e2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "20px"
                                }}>
                                    {activity.type === "booking" ? "📅" : 
                                     activity.type === "payment" ? "💳" : 
                                     activity.type === "tracking" ? "🧭" : "🆘"}
                                </div>
                                <div>
                                    <div style={{ fontWeight: "600", color: "#1f2937" }}>
                                        {activity.description}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                        {activity.time}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ 
                                    fontSize: "12px", 
                                    fontWeight: "500",
                                    padding: "4px 8px",
                                    borderRadius: "12px",
                                    background: activity.status === "confirmed" || activity.status === "success" ? "#dcfce7" : 
                                                   activity.status === "completed" || activity.status === "resolved" ? "#dbeafe" : 
                                                   activity.status === "cancelled" ? "#fee2e2" : "#fef3c7",
                                    color: activity.status === "confirmed" || activity.status === "success" ? "#166534" : 
                                          activity.status === "completed" || activity.status === "resolved" ? "#1e40af" : 
                                          activity.status === "cancelled" ? "#991b1b" : "#92400e"
                                }}>
                                    {activity.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    🚀 Quick Actions
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                    <button 
                        onClick={() => setActiveTab("bookings")}
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
                        📅 Book a Trip
                    </button>
                    <button 
                        onClick={() => setActiveTab("tracking")}
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
                        🧭 Track Delivery
                    </button>
                    <button 
                        onClick={() => setActiveTab("payments")}
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
                        💳 Make Payment
                    </button>
                    <button 
                        onClick={() => setActiveTab("support")}
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
                        🆘 Get Support
                    </button>
                </div>
            </div>
        </>
    );

    const renderBookings = () => (
        <div>
            <h2 style={{ margin: "0 0 30px 0", fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>
                📅 Let's Book Your Next Trip
            </h2>

            {/* Step 1: Filters */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                marginBottom: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700", color: "#1f2937" }}>
                    1. Filter Vehicles
                </h3>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#4b5563", marginBottom: "8px" }}>Type</label>
                        <select name="type" value={bookingFilters.type} onChange={handleFilterChange} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }}>
                            <option value="All">All Types</option>
                            <option value="Bike">Bike</option>
                            <option value="Auto">Auto</option>
                            <option value="Truck">Truck</option>
                            <option value="Van">Van</option>
                            <option value="Car">Car</option>
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#4b5563", marginBottom: "8px" }}>Seats</label>
                        <select name="seats" value={bookingFilters.seats} onChange={handleFilterChange} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }}>
                            <option value="All">Any Capacity</option>
                            <option value="1">1 Seat</option>
                            <option value="2">2 Seats</option>
                            <option value="3">3 Seats</option>
                            <option value="4">4 Seats</option>
                            <option value="6+">6+ Seats</option>
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#4b5563", marginBottom: "8px" }}>Eco-Friendly</label>
                        <select name="isEV" value={bookingFilters.isEV} onChange={handleFilterChange} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }}>
                            <option value="All">All Fuel Types</option>
                            <option value="Yes">EV Only ⚡</option>
                            <option value="No">Non-EV</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Step 2: Recommendations */}
            <div style={{ 
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", 
                borderRadius: "16px", 
                padding: "30px", 
                marginBottom: "30px", 
                boxShadow: "0 10px 25px rgba(14, 165, 233, 0.15)",
                border: "1px solid #bae6fd"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0369a1", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "24px" }}>✨</span> Smart AI Recommendations
                    </h3>
                    <div style={{ fontSize: "12px", background: "#bae6fd", color: "#0369a1", padding: "4px 12px", borderRadius: "12px", fontWeight: "600" }}>
                        Based on your preferences
                    </div>
                </div>
                
                {recommendedVehicle ? (
                    <div 
                        onClick={() => handleSelectVehicle(recommendedVehicle)}
                        style={{ 
                            background: "white", 
                            borderRadius: "12px", 
                            padding: "20px", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "20px",
                            cursor: "pointer",
                            border: newBooking.vehicleId === recommendedVehicle.id ? "2px solid #0ea5e9" : "2px solid transparent",
                            boxShadow: newBooking.vehicleId === recommendedVehicle.id ? "0 4px 12px rgba(14, 165, 233, 0.2)" : "none",
                            transition: "all 0.2s"
                        }}
                    >
                        <div style={{ fontSize: "48px", background: "#f8fafc", padding: "16px", borderRadius: "12px", position: "relative" }}>
                            {recommendedVehicle.image}
                            <div style={{ position: "absolute", top: "-10px", right: "-10px", background: "#10b981", color: "white", fontSize: "12px", fontWeight: "bold", padding: "4px 8px", borderRadius: "12px" }}>
                                {recommendedVehicle.matchScore}% Match
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                                <h4 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>{recommendedVehicle.name}</h4>
                                {recommendedVehicle.isEV === "Yes" && <span style={{ fontSize: "12px", background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px" }}>EV ⚡</span>}
                            </div>
                            <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>
                                {recommendedVehicle.seats} Seats • {recommendedVehicle.type}
                            </div>
                            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                                {recommendedVehicle.features.map(f => (
                                    <span key={f} style={{ fontSize: "11px", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "4px" }}>{f}</span>
                                ))}
                            </div>
                            <div style={{ fontSize: "13px", color: "#0ea5e9", fontStyle: "italic" }}>
                                💡 {recommendedVehicle.reason}
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>Base Price</div>
                            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#0ea5e9" }}>₹{recommendedVehicle.basePrice}/km</div>
                            {newBooking.vehicleId === recommendedVehicle.id && (
                                <div style={{ marginTop: "8px", fontSize: "12px", color: "#0ea5e9", fontWeight: "600" }}>✓ Selected</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                        No recommendations matching your strict filters. Please adjust them.
                    </div>
                )}
            </div>

            {/* Step 3: Complete Booking Form */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                marginBottom: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    2. Location & Time
                </h3>
                
                <form onSubmit={handleAddBooking} style={{ display: "grid", gap: "24px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>Pickup Location</label>
                            <input name="pickup" value={newBooking.pickup} onChange={handleNewBookingChange} required style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px" }} placeholder="Enter pickup address" />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>Drop Location</label>
                            <input name="drop" value={newBooking.drop} onChange={handleNewBookingChange} required style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px" }} placeholder="Enter drop address" />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>Select Date</label>
                        <input name="date" type="date" value={newBooking.date} onChange={handleNewBookingChange} required style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px" }} />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "12px" }}>Select Time Slot (Dynamic Pricing)</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                            {timeSlots.map((slot) => {
                                const isSelected = newBooking.timeSlot === slot.time;
                                return (
                                    <div 
                                        key={slot.time}
                                        onClick={() => handleSelectSlot(slot)}
                                        style={{ 
                                            padding: "12px", 
                                            borderRadius: "8px", 
                                            border: isSelected ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                                            background: isSelected ? "#eff6ff" : "white",
                                            cursor: "pointer",
                                            textAlign: "center",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        <div style={{ fontSize: "12px", fontWeight: "600", color: slot.multiple > 1 ? "#ef4444" : "#10b981", marginBottom: "4px" }}>
                                            {slot.multiple > 1 ? "Peak Price ⚡" : "Std Price ✓"}
                                        </div>
                                        <div style={{ fontSize: "14px", color: "#1f2937", fontWeight: "500" }}>{slot.time}</div>
                                        {newBooking.estimatedCost > 0 && (
                                            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                                                Est: {formatCurrency(newBooking.estimatedCost * slot.multiple)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Add-ons and Promos */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", background: "#f9fafb", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px" }}>📦 Extra Services</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#4b5563", cursor: "pointer" }}>
                                    <input type="checkbox" name="fragile" checked={extras.fragile} onChange={handleExtraChange} style={{ width: "16px", height: "16px" }} />
                                    Fragile Handling (+₹150)
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#4b5563", cursor: "pointer" }}>
                                    <input type="checkbox" name="express" checked={extras.express} onChange={handleExtraChange} style={{ width: "16px", height: "16px" }} />
                                    Express Delivery (+₹300)
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#4b5563", cursor: "pointer" }}>
                                    <input type="checkbox" name="helper" checked={extras.helper} onChange={handleExtraChange} style={{ width: "16px", height: "16px" }} />
                                    Extra Helper (+₹500)
                                </label>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px" }}>🎟️ Promo Code</label>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input 
                                    type="text" 
                                    value={promoCode} 
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromo(); } }}
                                    placeholder="Try NEURO10" 
                                    style={{ flex: 1, padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px", outline: "none" }}
                                    disabled={discountApplied}
                                />
                                <button type="button" onClick={handleApplyPromo} disabled={discountApplied || !promoCode} style={{ padding: "0 16px", background: discountApplied ? "#10b981" : "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: discountApplied ? "default" : "pointer", opacity: (!promoCode || discountApplied) ? 0.7 : 1 }}>
                                    {discountApplied ? "Applied ✓" : "Apply"}
                                </button>
                            </div>
                            {discountApplied && <div style={{ marginTop: "8px", fontSize: "12px", color: "#10b981", fontWeight: "600" }}>10% discount applied to total!</div>}
                        </div>
                    </div>

                    {/* Advanced Booking Summary */}
                    {newBooking.vehicleId && newBooking.timeSlot && (
                        <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                            <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#1e293b", display: "flex", justifyContent: "space-between" }}>
                                <span>🧾 Advanced Booking Summary</span>
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "#475569" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Base Fare ({newBooking.vehicleType})</span>
                                    <span>{formatCurrency(newBooking.estimatedCost)}</span>
                                </div>
                                {(() => {
                                    const slot = timeSlots.find(s => s.time === newBooking.timeSlot);
                                    if (slot && slot.multiple > 1) {
                                        return (
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span>Time Slot Surcharge ({slot.label})</span>
                                                <span style={{ color: "#ef4444" }}>+{formatCurrency(newBooking.estimatedCost * (slot.multiple - 1))}</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                                {extras.fragile && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Fragile Handling</span><span>+{formatCurrency(150)}</span></div>
                                )}
                                {extras.express && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Express Delivery</span><span>+{formatCurrency(300)}</span></div>
                                )}
                                {extras.helper && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Extra Helper</span><span>+{formatCurrency(500)}</span></div>
                                )}
                                {discountApplied && (
                                    <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981", fontWeight: "600" }}>
                                        <span>Promo Discount (10%)</span>
                                        <span>-{formatCurrency(calculateFinalCost() / 0.9 * 0.1)}</span>
                                    </div>
                                )}
                                <div style={{ borderTop: "1px dashed #cbd5e1", margin: "8px 0" }}></div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                                    <span>Total Estimated Cost</span>
                                    <span>{formatCurrency(calculateFinalCost())}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                        <div>
                            {newBooking.vehicleId && newBooking.timeSlot ? (
                                <div>
                                    <div style={{ fontSize: "14px", color: "#6b7280" }}>Total Final Cost</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#10b981" }}>
                                            {formatCurrency(calculateFinalCost())}
                                        </div>
                                        {discountApplied && (
                                            <div style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: "16px" }}>
                                                {formatCurrency(calculateFinalCost() / 0.9)}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#f59e0b", fontWeight: "600", marginTop: "4px" }}>
                                        ⭐ Earn {Math.floor(calculateFinalCost() / 100)} Loyalty Points
                                    </div>
                                </div>
                            ) : (
                                <div style={{ fontSize: "14px", color: "#9ca3af" }}>Select vehicle & slot to see price</div>
                            )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                            {bookingError && (
                                <div style={{ color: "#ef4444", fontSize: "14px", fontWeight: "600", maxWidth: "250px", textAlign: "right", paddingRight: "5px" }}>
                                    {bookingError}
                                </div>
                            )}
                            <button 
                                type="submit" 
                                style={{
                                    padding: "14px 28px",
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                                }}
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* My Bookings History */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    📋 My Bookings
                </h3>
                
                {bookings.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
                            No bookings yet
                        </h3>
                        <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                            Create your first booking to get started
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "15px" }}>
                        {bookings.map((booking) => (
                            <div key={booking.id} style={{ 
                                padding: "20px", 
                                background: "#f9fafb", 
                                borderRadius: "12px", 
                                border: "1px solid #e5e7eb"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                                    <div>
                                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                                            📍 {booking.pickup} ➜ {booking.drop}
                                        </div>
                                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
                                            🚛 {booking.vehicleType}
                                        </div>
                                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
                                            👤 Driver: {booking.driver}
                                        </div>
                                        {booking.time && (
                                            <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500", color: "#3b82f6" }}>
                                                📅 {booking.time}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#10b981", marginBottom: "8px" }}>
                                            {formatCurrency(booking.estimatedCost)}
                                        </div>
                                        <div style={{ 
                                            fontSize: "12px", 
                                            fontWeight: "500",
                                            padding: "4px 8px",
                                            borderRadius: "12px",
                                            background: "#dcfce7",
                                            color: "#166534",
                                            display: "inline-block"
                                        }}>
                                            {booking.status}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button 
                                        onClick={() => {
                                            setActiveTab("tracking");
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        style={{ 
                                            padding: "8px 16px", 
                                            background: "#3b82f6", 
                                            color: "white", 
                                            border: "none", 
                                            borderRadius: "6px", 
                                            fontSize: "12px", 
                                            cursor: "pointer", 
                                            fontWeight: "600"
                                        }}>
                                        Track
                                    </button>
                                    <button 
                                        onClick={() => handleCancelBooking(booking.id)}
                                        disabled={booking.status === "cancelled" || booking.status === "completed"}
                                        style={{ 
                                            padding: "8px 16px", 
                                            background: (booking.status === "cancelled" || booking.status === "completed") ? "#fca5a5" : "#ef4444", 
                                            color: "white", 
                                            border: "none", 
                                            borderRadius: "6px", 
                                            fontSize: "12px", 
                                            cursor: (booking.status === "cancelled" || booking.status === "completed") ? "not-allowed" : "pointer", 
                                            fontWeight: "600"
                                        }}>
                                        {booking.status === "cancelled" ? "Cancelled" : "Cancel"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderTracking = () => (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>
                    🧭 Live Tracking
                </h2>
                <div style={{ background: "#dcfce7", color: "#166534", padding: "8px 16px", borderRadius: "20px", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 10px rgba(22, 101, 52, 0.1)" }}>
                    <span style={{ display: "inline-block", width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%", boxShadow: "0 0 8px #22c55e" }}></span>
                    En Route
                </div>
            </div>

            {/* Uber-Style Map and Driver Card Overlay */}
            <div style={{ 
                background: "white", 
                borderRadius: "24px", 
                overflow: "hidden", 
                marginBottom: "30px", 
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                position: "relative",
                display: "flex",
                flexDirection: "column"
            }}>
                {/* Embedded Map Area */}
                <div style={{ position: "relative", height: "450px", overflow: "hidden", marginTop: "-20px" }}>
                     <RouteMap 
                         startPoint="Pickup Location"
                         endPoint="Drop Location"
                         routeData={{
                              algorithm: "Optimum Route",
                              distance: 8.5,
                              estimatedDuration: parseInt(trackingEta) || 12,
                              energyConsumption: 1.2,
                              path: [
                                  { lat: 12.9716, lng: 77.5946 },
                                  { lat: 12.9780, lng: 77.6020 },
                                  { lat: 12.9850, lng: 77.6095 }
                              ]
                         }}
                     />
                     <div style={{ position: "absolute", top: "40px", left: "50%", transform: "translateX(-50%)", background: "white", padding: "12px 24px", borderRadius: "30px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", fontWeight: "bold", fontSize: "16px", color: "#1f2937", zIndex: 10, display: "flex", alignItems: "center", gap: "10px" }}>
                         <span style={{ fontSize: "20px" }}>⏳</span>
                         Arriving in {trackingEta}
                     </div>
                </div>

                {/* Floating Bottom Sheet */}
                <div style={{ 
                    background: "white", 
                    padding: "24px 30px", 
                    borderTopLeftRadius: "24px", 
                    borderTopRightRadius: "24px", 
                    marginTop: "-40px", 
                    position: "relative", 
                    zIndex: 20, 
                    boxShadow: "0 -10px 30px rgba(0,0,0,0.08)" 
                }}>
                    <div style={{ width: "40px", height: "5px", background: "#e2e8f0", borderRadius: "3px", margin: "0 auto 24px auto" }}></div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", border: "2px solid #e2e8f0", position: "relative" }}>
                                👨🏽‍✈️
                                <div style={{ position: "absolute", bottom: "-5px", background: "#1e293b", color: "white", fontSize: "11px", fontWeight: "bold", padding: "2px 8px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "3px" }}>
                                    4.9 ⭐
                                </div>
                            </div>
                            <div>
                                <h3 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Ramesh Kumar</h3>
                                <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>
                                    1.2k Deliveries
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ textAlign: "right", background: "#f8fafc", padding: "10px 16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", letterSpacing: "1px" }}>
                                KA 01 <span style={{ color: "#3b82f6" }}>AB 1234</span>
                            </div>
                            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>
                                Tata Ace EV (White)
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", background: "linear-gradient(to right, #f8fafc, #f1f5f9)", borderRadius: "16px", marginBottom: "24px", border: "1px dashed #cbd5e1" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ background: "#e2e8f0", padding: "10px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                                🔐
                            </div>
                            <div>
                                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Start Trip PIN</div>
                                <div style={{ fontSize: "14px", color: "#334155", fontWeight: "500" }}>Share this with driver</div>
                            </div>
                        </div>
                        <div style={{ fontSize: "32px", fontWeight: "900", color: "#0f172a", letterSpacing: "6px", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                            4512
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                        <button 
                            onClick={() => alert("Calling Driver...")}
                            style={{ padding: "16px", background: "#f1f5f9", border: "none", borderRadius: "16px", fontSize: "15px", fontWeight: "700", color: "#0f172a", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", transition: "transform 0.2s" }}
                        >
                            <span style={{ fontSize: "24px" }}>📞</span> Call
                        </button>
                        <button 
                            onClick={() => alert("Opening Chat...")}
                            style={{ padding: "16px", background: "#f1f5f9", border: "none", borderRadius: "16px", fontSize: "15px", fontWeight: "700", color: "#0f172a", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", transition: "transform 0.2s" }}
                        >
                            <span style={{ fontSize: "24px" }}>💬</span> Message
                        </button>
                        <button 
                            onClick={() => alert("Sharing Live Location...")}
                            style={{ padding: "16px", background: "#f1f5f9", border: "none", borderRadius: "16px", fontSize: "15px", fontWeight: "700", color: "#0f172a", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", transition: "transform 0.2s" }}
                        >
                            <span style={{ fontSize: "24px" }}>🔗</span> Share
                        </button>
                        <button 
                            onClick={() => {
                                const activeBooking = bookings.find(b => b.status === "confirmed");
                                if (activeBooking) {
                                    handleCancelBooking(activeBooking.id);
                                    setActiveTab("bookings");
                                } else {
                                    if(window.confirm("Are you sure you want to cancel the trip? Cancellation charges may apply.")) {
                                        alert("Trip Cancelled.");
                                        setActiveTab("bookings");
                                    }
                                }
                            }}
                            style={{ padding: "16px", background: "#fee2e2", border: "none", borderRadius: "16px", fontSize: "15px", fontWeight: "700", color: "#b91c1c", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", transition: "transform 0.2s" }}
                        >
                            <span style={{ fontSize: "24px" }}>🚫</span> Cancel
                        </button>
                    </div>
                </div>
            </div>

            {/* Trip History */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    📊 Recent Trips
                </h3>
                
                <div style={{ display: "grid", gap: "15px" }}>
                    {[
                        { id: 1, route: "Electronic City → Whitefield", date: "Today", status: "completed", duration: "25 mins", driver: "Driver John" },
                        { id: 2, route: "Koramangala → Indiranagar", date: "Yesterday", status: "completed", duration: "18 mins", driver: "Driver Mike" },
                        { id: 3, route: "HSR Layout → Marathahalli", date: "2 days ago", status: "completed", duration: "22 mins", driver: "Driver Sarah" },
                    ].map((trip) => (
                        <div key={trip.id} style={{ 
                            padding: "16px", 
                            background: "#f9fafb", 
                            borderRadius: "12px", 
                            border: "1px solid #e5e7eb"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                                        📍 {trip.route}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                        📅 {trip.date} • ⏱️ {trip.duration} • 👤 {trip.driver}
                                    </div>
                                </div>
                                <div style={{ 
                                    fontSize: "12px", 
                                    fontWeight: "500",
                                    padding: "4px 8px",
                                    borderRadius: "12px",
                                    background: "#dcfce7",
                                    color: "#166534"
                                }}>
                                    {trip.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderPayments = () => (
        <div>
            <h2 style={{ margin: "0 0 30px 0", fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>
                💳 Payment Management
            </h2>

            {/* Payment Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={{ 
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white",
                    boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)"
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>💰 Total Spent</div>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>{formatCurrency(data.totalSpent)}</div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>Lifetime spending</div>
                </div>

                <div style={{ 
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white",
                    boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)"
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>💳 Payment Status</div>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>{data.paymentStatus}</div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>Latest payment</div>
                </div>

                <div style={{ 
                    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", 
                    padding: "24px", 
                    borderRadius: "16px", 
                    color: "white",
                    boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)"
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>⭐ Loyalty Points</div>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>{formatNumber(data.loyaltyPoints)}</div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>Available rewards</div>
                </div>
            </div>

            {/* Payment History */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    📋 Payment History
                </h3>
                
                <div style={{ display: "grid", gap: "15px" }}>
                    {paymentHistory.map((payment) => (
                        <div key={payment.id} style={{ 
                            padding: "20px", 
                            background: "#f9fafb", 
                            borderRadius: "12px", 
                            border: "1px solid #e5e7eb"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                                        💳 {payment.method} • Booking #{payment.bookingId}
                                    </div>
                                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                                        📅 {new Date(payment.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "18px", fontWeight: "bold", color: payment.status === "Paid" ? "#10b981" : "#f59e0b" }}>
                                        {payment.status === "Paid" ? "+" : "-"}{formatCurrency(payment.amount)}
                                    </div>
                                    <div style={{ 
                                        fontSize: "12px", 
                                        fontWeight: "500",
                                        padding: "4px 8px",
                                        borderRadius: "12px",
                                        background: payment.status === "Paid" ? "#dcfce7" : "#fef3c7",
                                        color: payment.status === "Paid" ? "#166534" : "#92400e"
                                    }}>
                                        {payment.status}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Methods */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                marginTop: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    💳 Payment Methods
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                    <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                            💳 Credit Card
                        </div>
                        <div style={{ fontSize: "14px", color: "#6b7280" }}>
                            **** **** **** 1234<br/>
                            Expires: 12/25
                        </div>
                    </div>
                    <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                            📱 UPI
                        </div>
                        <div style={{ fontSize: "14px", color: "#6b7280" }}>
                            user@upi<br/>
                            Primary payment method
                        </div>
                    </div>
                    <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                            🏦 Net Banking
                        </div>
                        <div style={{ fontSize: "14px", color: "#6b7280" }}>
                            State Bank of India<br/>
                            Account ending 5678
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div>
            <h2 style={{ margin: "0 0 30px 0", fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>
                👤 Profile Management
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "30px" }}>
                {/* Personal Information */}
                <div style={{ 
                    background: "white", 
                    borderRadius: "16px", 
                    padding: "30px", 
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
                }}>
                    <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                        📝 Personal Information
                    </h3>
                    
                    <form style={{ display: "grid", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                                Full Name
                            </label>
                            <input
                                name="name"
                                value={profile.name}
                                onChange={handleProfileChange}
                                style={{ 
                                    width: "100%", 
                                    padding: "12px", 
                                    border: "1px solid #d1d5db", 
                                    borderRadius: "8px",
                                    fontSize: "14px"
                                }}
                                placeholder="Enter your name"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                                Email Address
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                style={{ 
                                    width: "100%", 
                                    padding: "12px", 
                                    border: "1px solid #d1d5db", 
                                    borderRadius: "8px",
                                    fontSize: "14px"
                                }}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                                Phone Number
                            </label>
                            <input
                                name="phone"
                                value={profile.phone}
                                onChange={handleProfileChange}
                                style={{ 
                                    width: "100%", 
                                    padding: "12px", 
                                    border: "1px solid #d1d5db", 
                                    borderRadius: "8px",
                                    fontSize: "14px"
                                }}
                                placeholder="Enter your phone number"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={profile.address}
                                onChange={handleProfileChange}
                                rows={3}
                                style={{ 
                                    width: "100%", 
                                    padding: "12px", 
                                    border: "1px solid #d1d5db", 
                                    borderRadius: "8px",
                                    fontSize: "14px"
                                }}
                                placeholder="Enter your address"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleSaveProfile}
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
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Account Summary */}
                <div style={{ 
                    background: "white", 
                    borderRadius: "16px", 
                    padding: "30px", 
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
                }}>
                    <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                        📊 Account Summary
                    </h3>
                    
                    <div style={{ display: "grid", gap: "20px" }}>
                        <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                                📅 Member Since
                            </div>
                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}>
                                January 2024
                            </div>
                        </div>
                        <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                                📊 Total Bookings
                            </div>
                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}>
                                {formatNumber(data.bookingHistory)}
                            </div>
                        </div>
                        <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                                💰 Total Spent
                            </div>
                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}>
                                {formatCurrency(data.totalSpent)}
                            </div>
                        </div>
                        <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                                ⭐ Loyalty Points
                            </div>
                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}>
                                {formatNumber(data.loyaltyPoints)} points
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                marginTop: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    ⚙️ Preferences
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                            Preferred Vehicle Type
                        </label>
                        <select style={{ 
                            width: "100%", 
                            padding: "12px", 
                            border: "1px solid #d1d5db", 
                            borderRadius: "8px",
                            fontSize: "14px"
                        }}>
                            <option>EV Truck</option>
                            <option>Diesel Van</option>
                            <option>Hybrid Truck</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                            Notification Preferences
                        </label>
                        <select style={{ 
                            width: "100%", 
                            padding: "12px", 
                            border: "1px solid #d1d5db", 
                            borderRadius: "8px",
                            fontSize: "14px"
                        }}>
                            <option>Email & SMS</option>
                            <option>Email Only</option>
                            <option>SMS Only</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSupport = () => (
        <div>
            <h2 style={{ margin: "0 0 30px 0", fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>
                🆘 Customer Support
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "30px" }}>
                {/* Raise Ticket */}
                <div style={{ 
                    background: "white", 
                    borderRadius: "16px", 
                    padding: "30px", 
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
                }}>
                    <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                        🎫 Raise Support Ticket
                    </h3>
                    
                    <form onSubmit={handleSupportSubmit} style={{ display: "grid", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                                Issue Type
                            </label>
                            <select style={{ 
                                width: "100%", 
                                padding: "12px", 
                                border: "1px solid #d1d5db", 
                                borderRadius: "8px",
                                fontSize: "14px"
                            }}>
                                <option>Booking Issue</option>
                                <option>Payment Problem</option>
                                <option>Vehicle Issue</option>
                                <option>Driver Concern</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                                Describe your issue
                            </label>
                            <textarea
                                required
                                rows={4}
                                style={{ 
                                    width: "100%", 
                                    padding: "12px", 
                                    border: "1px solid #d1d5db", 
                                    borderRadius: "8px",
                                    fontSize: "14px"
                                }}
                                placeholder="Please describe your issue in detail..."
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                                Priority
                            </label>
                            <select style={{ 
                                width: "100%", 
                                padding: "12px", 
                                border: "1px solid #d1d5db", 
                                borderRadius: "8px",
                                fontSize: "14px"
                            }}>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Urgent</option>
                            </select>
                        </div>
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
                            Submit Ticket
                        </button>
                    </form>
                    
                    {ticket && (
                        <div style={{ 
                            marginTop: "20px", 
                            padding: "16px", 
                            background: "#f0fdf4", 
                            borderRadius: "12px", 
                            border: "1px solid #bbf7d0"
                        }}>
                            <div style={{ fontSize: "14px", color: "#166534" }}>
                                <strong>✅ Ticket submitted successfully!</strong><br/>
                                Your ticket ID: <strong>{ticket}</strong><br/>
                                We will respond within 24 hours.
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Help */}
                <div style={{ 
                    background: "white", 
                    borderRadius: "16px", 
                    padding: "30px", 
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
                }}>
                    <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                        📞 Quick Help
                    </h3>
                    
                    <div style={{ display: "grid", gap: "20px" }}>
                        <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                                📞 Phone Support
                            </div>
                            <div style={{ fontSize: "14px", color: "#6b7280" }}>
                                24/7 Helpline: 1800-123-4567<br/>
                                Available round the clock
                            </div>
                        </div>
                        <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                                💬 Live Chat
                            </div>
                            <div style={{ fontSize: "14px", color: "#6b7280" }}>
                                Chat with our support team<br/>
                                Average response time: 2 minutes
                            </div>
                        </div>
                        <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                                📧 Email Support
                            </div>
                            <div style={{ fontSize: "14px", color: "#6b7280" }}>
                                support@neurofeetx.com<br/>
                                Response within 24 hours
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "30px", 
                marginTop: "30px", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
            }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                    ❓ Frequently Asked Questions
                </h3>
                
                <div style={{ display: "grid", gap: "15px" }}>
                    {[
                        { q: "How do I book a vehicle?", a: "Simply go to the Bookings section, enter your pickup and drop locations, select a vehicle type, and confirm your booking." },
                        { q: "What payment methods are accepted?", a: "We accept credit cards, debit cards, UPI, net banking, and cash on delivery." },
                        { q: "How can I track my delivery?", a: "Use the Live Tracking feature to monitor your vehicle's real-time location and estimated arrival time." },
                        { q: "What is the cancellation policy?", a: "You can cancel your booking up to 1 hour before the scheduled pickup time without any charges." },
                        { q: "How do I earn loyalty points?", a: "You earn 1 point for every ₹100 spent. Points can be redeemed for discounts on future bookings." },
                    ].map((faq, index) => (
                        <div key={index} style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                                {faq.q}
                            </div>
                            <div style={{ fontSize: "14px", color: "#6b7280" }}>
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout
            title="Customer Dashboard Overview"
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
                    {activeTab === "bookings" && renderBookings()}
                    {activeTab === "tracking" && renderTracking()}
                    {activeTab === "payments" && renderPayments()}
                    {activeTab === "profile" && renderProfile()}
                    {activeTab === "support" && renderSupport()}
                </>
            )}
        </DashboardLayout>
    );
}

export default Customer;