import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async () => {
        // Basic validation
        if (!email || !password || !role) {
            alert("Please fill in all fields");
            return;
        }

        try {
            console.log("Attempting login with:", { email, password, role });
            
            const res = await axios.post("http://localhost:8080/auth/login", {
                email,
                password,
            });

            console.log("Login response:", res.data);

            const token = res.data.token;
            let resolvedRole = res.data.role || role;

            if (resolvedRole && resolvedRole.startsWith("ROLE_")) {
                resolvedRole = resolvedRole.replace("ROLE_", "");
            }

            console.log("Resolved role:", resolvedRole);

            localStorage.setItem("token", token);
            localStorage.setItem("role", resolvedRole);

            if (resolvedRole === "ADMIN") navigate("/admin");
            else if (resolvedRole === "MANAGER") navigate("/manager");
            else if (resolvedRole === "DRIVER") navigate("/driver");
            else if (resolvedRole === "CUSTOMER") navigate("/customer");
        } catch (error) {
            console.error("Login error:", error);
            console.error("Error response:", error.response?.data);
            
            let errorMessage = "Invalid Credentials";
            
            if (error.response?.data) {
                if (typeof error.response.data === "string") {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.code === "ECONNREFUSED") {
                errorMessage = "Cannot connect to server. Please check if the backend is running.";
            } else if (error.code === "NETWORK_ERROR") {
                errorMessage = "Network error. Please check your connection.";
            }
            
            alert(errorMessage);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="title">NeuroFleetX-AI</h1>

                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="">Select Role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="DRIVER">Driver</option>
                    <option value="CUSTOMER">Customer</option>
                </select>

                <label>Email</label>
                <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button onClick={handleLogin}>Login</button>

                <p className="signup-text">
                    Don&apos;t have an account?{" "}
                    <span>
                        <Link to="/register">Sign Up</Link>
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;