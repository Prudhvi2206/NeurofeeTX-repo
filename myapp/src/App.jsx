import { Routes, Route } from "react-router-dom";

import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Admin from "./Admin.jsx";
import Manager from "./Manager.jsx";
import Driver from "./Driver.jsx";
import Customer from "./Customer.jsx";
import Vehicles from "./Vehicles.jsx";
import RouteOptimization from "./RouteOptimization.jsx";
import PredictiveMaintenance from "./PredictiveMaintenance.jsx";

function App() {
    return (
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
    );
}

export default App;