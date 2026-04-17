import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";

// Lazy loading heavy dashboard components
const Admin = React.lazy(() => import("./Admin.jsx"));
const Manager = React.lazy(() => import("./Manager.jsx"));
const Driver = React.lazy(() => import("./Driver.jsx"));
const Customer = React.lazy(() => import("./Customer.jsx"));
const Vehicles = React.lazy(() => import("./Vehicles.jsx"));
const RouteOptimization = React.lazy(() => import("./RouteOptimization.jsx"));
const PredictiveMaintenance = React.lazy(() => import("./PredictiveMaintenance.jsx"));

// Loading Fallback UI
const LoadingFallback = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid #e2e8f0', borderTop: '5px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
);

function App() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/route-optimization" element={<RouteOptimization />} />
                <Route path="/predictive-maintenance" element={<PredictiveMaintenance />} />
                <Route path="/manager" element={<Manager />} />
                <Route path="/driver" element={<Driver />} />
                <Route path="/customer" element={<Customer />} />
            </Routes>
        </Suspense>
    );
}

export default App;