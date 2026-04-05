import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home">
            <header className="home-header">
                <div className="home-logo">NeuroFleetX</div>
                <nav className="home-nav">
                    <button
                        className="home-nav-button"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>
                </nav>
            </header>

            <main className="home-main">
                <section className="home-hero">
                    <div className="home-hero-left">
                        <h1 className="home-title">
                            NeuroFleetX – AI-Driven Urban Mobility Optimization System
                        </h1>
                        <p className="home-subtitle">
                            Orchestrate urban fleets for rentals, transport, and smart cities with a
                            single AI-powered control plane.
                        </p>
                        <p className="home-copy">
                            By combining real-time telemetry, intelligent routing, and predictive
                            maintenance, NeuroFleetX helps operations teams reduce downtime, improve
                            asset utilization, and deliver a better experience for drivers and
                            customers.
                        </p>

                        <div className="home-actions">
                            <button
                                className="home-primary"
                                onClick={() => navigate("/login")}
                            >
                                Get Started
                            </button>
                            <button
                                className="home-secondary"
                                onClick={() => navigate("/register")}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    <div className="home-hero-right">
                        <div className="home-kpi-row">
                            <div className="home-kpi-card">
                                <div className="home-kpi-label">Live Vehicles</div>
                                <div className="home-kpi-value">120+</div>
                                <div className="home-kpi-note">Streaming telemetry in real time</div>
                            </div>
                            <div className="home-kpi-card">
                                <div className="home-kpi-label">On-time Trips</div>
                                <div className="home-kpi-value">98%</div>
                                <div className="home-kpi-note">Optimized routes & dispatch</div>
                            </div>
                        </div>
                        <div className="home-role-row">
                            <div className="home-role-pill">Admin • Control center</div>
                            <div className="home-role-pill">Manager • Fleet ops</div>
                            <div className="home-role-pill">Driver • Trips & earnings</div>
                            <div className="home-role-pill">Customer • Booking portal</div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;

