# NeuroFleetX 🚀

NeuroFleetX is an AI-powered urban mobility platform that leverages real-time IoT and geospatial data to optimize fleet operations and provide intelligent, sustainable transport solutions for smart cities.

## ✨ Features

- **Admin Strategic Command Center:** A high-performance, glassmorphic dashboard showcasing real-time organizational KPIs.
- **Urban Mobility Insights:** Live interactive heatmaps mapping deployment density and real-time trip trajectory paths.
- **Unified Role Management:** Fine-grained provisioning and active monitoring for Customers, Drivers, Managers, and System Admins.
- **Reporting & Data Export:** Beautiful, automated business intelligence reporting modules with one-click export functions for both CSV and PDF.

## 🛠️ Technology Stack

NeuroFleetX employs an enterprise-grade decoupled stack designed for instantaneous responsiveness and scale:

* **Frontend Client (`myapp`)**:
  * **React.js (Vite)** for lightning-fast compilation and HMR.
  * **Chart.js & Recharts** to power interactive analytics.
  * **Leaflet & Leaflet.heat** for rendering intense geographical trip visualizations natively.
  * **Vanilla CSS (Glassmorphism theme)** targeting maximum rendering efficiency without bulk UI libraries.

* **Backend Engine (`fleetmanagement`)**:
  * **Spring Boot (Java)** exposing the core RESTful services architecture for user authentication, live data querying, and deep analytics aggregation.
  * **Spring Security & JWT** handling rigorous role-based permission verification.
  * **H2 Database Engine** acting as the deeply embedded agile testing state.
  * **Maven** for deterministic, repeatable container-ready builds.

## 🏃 Getting Started (Local Development)

### 1. Booting the Core Engine (Backend)

Navigate to the fleet management system engine and utilize the native maven wrapper to launch the Spring application context:

```bash
cd fleetmanagement
./mvnw spring-boot:run
```
*The backend server will deploy strictly on `http://localhost:8080/`*

### 2. Hydrating the Application (Frontend)

Open a secondary terminal process, install all local dependencies, and spin up the developer UI cache:

```bash
cd myapp
npm install
npm run dev
```
*The client-side module will initialize and expose an HTTP mapping at `http://localhost:5173/`*

## 📝 License
This project is proprietary software for internal administration. All rights reserved.
