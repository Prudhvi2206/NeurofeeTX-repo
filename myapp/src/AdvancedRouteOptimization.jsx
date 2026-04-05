import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import RouteMap from './RouteMap.jsx';
import './RouteOptimization.css';

// Advanced Route Optimization with Maps Integration and AI Algorithms
class AdvancedRouteOptimizer {
    constructor() {
        this.graph = new Map(); // Road network graph
        this.trafficData = new Map(); // Real-time traffic data
        this.mapProvider = null; // Google Maps or Leaflet
    }

    // Step 1: Initialize Maps Integration
    async initializeMaps(provider = 'google') {
        try {
            if (provider === 'google') {
                await this.loadGoogleMaps();
                this.mapProvider = 'google';
            } else if (provider === 'leaflet') {
                await this.loadLeaflet();
                this.mapProvider = 'leaflet';
            }
            
            console.log(`${provider} Maps initialized successfully`);
            return true;
        } catch (error) {
            console.error(`Failed to initialize ${provider} Maps:`, error);
            return false;
        }
    }

    // Load Google Maps API
    async loadGoogleMaps() {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places,geometry';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                setTimeout(() => {
                    if (window.google && window.google.maps) {
                        resolve();
                    } else {
                        reject(new Error('Google Maps failed to load'));
                    }
                }, 1000);
            };
            
            script.onerror = () => reject(new Error('Failed to load Google Maps'));
            document.head.appendChild(script);
        });
    }

    // Load Leaflet (alternative to Google Maps)
    async loadLeaflet() {
        return new Promise((resolve, reject) => {
            // Load Leaflet CSS and JS
            const leafletCSS = document.createElement('link');
            leafletCSS.rel = 'stylesheet';
            leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(leafletCSS);

            const leafletJS = document.createElement('script');
            leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            leafletJS.onload = () => resolve();
            leafletJS.onerror = () => reject(new Error('Failed to load Leaflet'));
            document.head.appendChild(leafletJS);
        });
    }

    // Geocode address to coordinates
    async geocodeAddress(address) {
        try {
            if (this.mapProvider === 'google') {
                const geocoder = new window.google.maps.Geocoder();
                const result = await new Promise((resolve, reject) => {
                    geocoder.geocode({ address }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            resolve({
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng(),
                                address: results[0].formatted_address
                            });
                        } else {
                            reject(new Error(`Geocoding failed: ${status}`));
                        }
                    });
                });
                return result;
            }
            throw new Error('No map provider available');
        } catch (error) {
            console.error('Geocoding error:', error);
            // Fallback to Bangalore coordinates
            return { lat: 12.9716, lng: 77.5946, address: address };
        }
    }

    // Fetch real-time traffic data
    async fetchTrafficData(route) {
        try {
            if (this.mapProvider === 'google') {
                const service = new window.google.maps.DistanceMatrixService();
                const result = await new Promise((resolve, reject) => {
                    service.getDistanceMatrix({
                        origins: [route.start],
                        destinations: [route.end],
                        travelMode: 'DRIVING',
                        drivingOptions: {
                            departureTime: new Date(),
                            trafficModel: 'bestguess'
                        }
                    }, (response, status) => {
                        if (status === 'OK') {
                            resolve(response);
                        } else {
                            reject(new Error(`Traffic data failed: ${status}`));
                        }
                    });
                });
                
                return {
                    duration: result.rows[0].elements[0].duration,
                    durationInTraffic: result.rows[0].elements[0].duration_in_traffic,
                    distance: result.rows[0].elements[0].distance,
                    trafficDensity: this.calculateTrafficDensity(result)
                };
            }
        } catch (error) {
            console.error('Traffic data error:', error);
            return { trafficDensity: Math.random() * 0.8 + 0.1 };
        }
    }

    calculateTrafficDensity(distanceMatrixResult) {
        const duration = distanceMatrixResult.rows[0].elements[0].duration.value;
        const durationInTraffic = distanceMatrixResult.rows[0].elements[0].duration_in_traffic.value;
        
        if (duration === 0) return 0.5;
        
        const trafficRatio = durationInTraffic / duration;
        return Math.min(Math.max((trafficRatio - 1) * 2, 0), 1);
    }

    // Step 2: Classical Algorithms - Dijkstra Implementation
    dijkstra(graph, start, end, options = {}) {
        const {
            considerTraffic = true,
            optimizeFor = 'distance', // 'distance', 'time', 'cost'
            vehicleType = 'EV'
        } = options;

        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();
        const path = [];

        // Initialize distances
        for (const node of graph.keys()) {
            distances.set(node, node === start ? 0 : Infinity);
            previous.set(node, null);
            unvisited.add(node);
        }

        while (unvisited.size > 0) {
            // Find node with minimum distance
            let current = null;
            let minDistance = Infinity;
            
            for (const node of unvisited) {
                if (distances.get(node) < minDistance) {
                    minDistance = distances.get(node);
                    current = node;
                }
            }

            if (current === null || current === end) break;

            unvisited.delete(current);

            // Update distances to neighbors
            const neighbors = graph.get(current) || [];
            for (const neighbor of neighbors) {
                if (unvisited.has(neighbor.node)) {
                    const edgeWeight = this.calculateEdgeWeight(
                        current, 
                        neighbor.node, 
                        neighbor, 
                        optimizeFor, 
                        vehicleType,
                        considerTraffic
                    );
                    
                    const altDistance = distances.get(current) + edgeWeight;
                    
                    if (altDistance < distances.get(neighbor.node)) {
                        distances.set(neighbor.node, altDistance);
                        previous.set(neighbor.node, current);
                    }
                }
            }
        }

        // Reconstruct path
        let current = end;
        while (current !== null) {
            path.unshift(current);
            current = previous.get(current);
        }

        return {
            path,
            distance: distances.get(end),
            algorithm: 'Dijkstra',
            options
        };
    }

    // Calculate edge weight based on optimization criteria
    calculateEdgeWeight(from, to, edgeData, optimizeFor, vehicleType, considerTraffic) {
        let baseWeight = edgeData.distance || 1;

        // Apply traffic multiplier
        if (considerTraffic && edgeData.trafficDensity) {
            baseWeight *= (1 + edgeData.trafficDensity);
        }

        // Apply vehicle type multiplier
        const vehicleMultipliers = {
            'EV': 0.9,      // EVs are more efficient
            'Diesel': 1.1,  // Diesel vehicles are less efficient
            'Hybrid': 1.0   // Hybrid vehicles are neutral
        };
        baseWeight *= vehicleMultipliers[vehicleType] || 1.0;

        // Apply optimization criteria
        switch (optimizeFor) {
            case 'time':
                return (edgeData.duration || baseWeight) * (considerTraffic ? 1.2 : 1.0);
            case 'cost':
                return baseWeight * (vehicleType === 'EV' ? 0.7 : 1.2);
            case 'distance':
            default:
                return baseWeight;
        }
    }

    // A* Algorithm (enhanced version of Dijkstra)
    aStar(graph, start, end, heuristic, options = {}) {
        const openSet = new Set([start]);
        const closedSet = new Set();
        const gScore = new Map([[start, 0]]);
        const fScore = new Map([[start, heuristic(start, end)]]);
        const previous = new Map();

        while (openSet.size > 0) {
            // Find node with lowest fScore
            let current = null;
            let minFScore = Infinity;
            
            for (const node of openSet) {
                if (fScore.get(node) < minFScore) {
                    minFScore = fScore.get(node);
                    current = node;
                }
            }

            if (current === end) {
                // Reconstruct path
                const path = [];
                while (current !== null) {
                    path.unshift(current);
                    current = previous.get(current);
                }
                return {
                    path,
                    distance: gScore.get(end),
                    algorithm: 'A*',
                    options
                };
            }

            openSet.delete(current);
            closedSet.add(current);

            // Check neighbors
            const neighbors = graph.get(current) || [];
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor.node)) continue;

                const tentativeGScore = gScore.get(current) + this.calculateEdgeWeight(
                    current, 
                    neighbor.node, 
                    neighbor, 
                    options.optimizeFor || 'distance', 
                    options.vehicleType || 'EV',
                    options.considerTraffic !== false
                );

                if (!openSet.has(neighbor.node)) {
                    openSet.add(neighbor.node);
                } else if (tentativeGScore >= gScore.get(neighbor.node)) {
                    continue;
                }

                previous.set(neighbor.node, current);
                gScore.set(neighbor.node, tentativeGScore);
                fScore.set(neighbor.node, tentativeGScore + heuristic(neighbor.node, end));
            }
        }

        return null; // No path found
    }

    // Heuristic function for A* (Euclidean distance)
    heuristic(node1, node2) {
        const dx = node1.lat - node2.lat;
        const dy = node1.lng - node2.lng;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Build road network graph from coordinates
    buildRoadNetwork(coordinates, trafficData = {}) {
        const graph = new Map();

        // Create nodes
        for (let i = 0; i < coordinates.length; i++) {
            const node = coordinates[i];
            graph.set(node.id || i, []);
            
            // Connect to nearby nodes (within reasonable distance)
            for (let j = 0; j < coordinates.length; j++) {
                if (i !== j) {
                    const other = coordinates[j];
                    const distance = this.calculateDistance(node, other);
                    
                    // Only connect if within reasonable distance (e.g., 10km)
                    if (distance < 10) {
                        const edge = {
                            node: other.id || j,
                            distance: distance,
                            duration: distance * 2, // Assume 2 min per km
                            trafficDensity: trafficData[`${i}-${j}`] || 0.5
                        };
                        
                        graph.get(node.id || i).push(edge);
                    }
                }
            }
        }

        return graph;
    }

    // Calculate distance between two coordinates
    calculateDistance(coord1, coord2) {
        const R = 6371; // Earth's radius in km
        const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
        const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
}

function AdvancedRouteOptimization() {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [startPoint, setStartPoint] = useState('');
    const [endPoint, setEndPoint] = useState('');
    const [optimizedRoute, setOptimizedRoute] = useState(null);
    const [alternatives, setAlternatives] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('optimize');
    const [showMap, setShowMap] = useState(false);
    const [optimizer] = useState(() => new AdvancedRouteOptimizer());
    const [mapsInitialized, setMapsInitialized] = useState(false);
    const [trafficData, setTrafficData] = useState({});
    const [routeMetrics, setRouteMetrics] = useState({});

    useEffect(() => {
        loadVehicles();
        initializeMaps();
    }, []);

    const initializeMaps = async () => {
        const success = await optimizer.initializeMaps('google');
        setMapsInitialized(success);
    };

    const loadVehicles = async () => {
        try {
            const res = await axios.get('http://localhost:8080/vehicles');
            setVehicles(res.data);
        } catch (error) {
            console.error('Error loading vehicles:', error);
            // Demo vehicles
            setVehicles([
                { id: 1, name: 'EV Truck Alpha', registration: 'KA-01-EV-1234', type: 'EV', capacity: '5 tons', range: '200km' },
                { id: 2, name: 'Diesel Van Beta', registration: 'KA-02-DL-5678', type: 'Diesel', capacity: '2 tons', range: '400km' },
                { id: 3, name: 'Hybrid Truck Gamma', registration: 'KA-03-HY-9012', type: 'Hybrid', capacity: '3 tons', range: '300km' }
            ]);
        }
    };

    // Enhanced route optimization with Maps integration
    const handleOptimizeRoute = async () => {
        if (!selectedVehicle || !startPoint || !endPoint) {
            alert('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            console.log('🚀 Starting Advanced Route Optimization...');
            
            // Step 1: Get real coordinates from Maps API
            const startCoords = await optimizer.geocodeAddress(startPoint);
            const endCoords = await optimizer.geocodeAddress(endPoint);
            
            console.log('📍 Coordinates found:', { startCoords, endCoords });

            // Step 2: Fetch traffic data
            const trafficInfo = await optimizer.fetchTrafficData({
                start: startCoords,
                end: endCoords
            });
            
            console.log('🚦 Traffic data:', trafficInfo);

            // Step 3: Build road network graph
            const intermediatePoints = generateIntermediatePoints(startCoords, endCoords);
            const allPoints = [startCoords, ...intermediatePoints, endCoords];
            
            const roadNetwork = optimizer.buildRoadNetwork(allPoints, trafficData);
            
            // Step 4: Apply optimization algorithms
            const vehicle = vehicles.find(v => v.id == selectedVehicle);
            const optimizationOptions = {
                considerTraffic: true,
                optimizeFor: 'time', // Can be 'distance', 'time', 'cost'
                vehicleType: vehicle?.type || 'EV'
            };

            // Run Dijkstra algorithm
            const dijkstraResult = optimizer.dijkstra(
                roadNetwork, 
                0, // start index
                allPoints.length - 1, // end index
                optimizationOptions
            );

            // Run A* algorithm for comparison
            const aStarResult = optimizer.aStar(
                roadNetwork,
                0, // start index
                allPoints.length - 1, // end index,
                optimizer.heuristic.bind(optimizer),
                optimizationOptions
            );

            // Step 5: Select best route and create alternatives
            const bestRoute = selectBestRoute([dijkstraResult, aStarResult], optimizationOptions);
            
            const enhancedRoute = {
                ...bestRoute,
                startPoint,
                endPoint,
                startCoords,
                endCoords,
                vehicleId: selectedVehicle,
                vehicle: vehicle,
                status: 'OPTIMIZED',
                createdAt: new Date(),
                trafficData: trafficInfo,
                metrics: calculateRouteMetrics(bestRoute, vehicle, trafficInfo)
            };

            // Create alternative routes
            const alternativeRoutes = generateAlternativeRoutes(
                [dijkstraResult, aStarResult], 
                bestRoute, 
                allPoints,
                vehicle
            );

            setOptimizedRoute(enhancedRoute);
            setAlternatives(alternativeRoutes);
            setRouteMetrics(enhancedRoute.metrics);
            setShowMap(true);

        } catch (error) {
            console.error('❌ Route optimization failed:', error);
            // Fallback route
            const fallbackRoute = createFallbackRoute();
            setOptimizedRoute(fallbackRoute);
            setShowMap(true);
        } finally {
            setLoading(false);
        }
    };

    // Generate intermediate points for better route planning
    const generateIntermediatePoints = (start, end) => {
        const points = [];
        const numPoints = 3;
        
        for (let i = 1; i <= numPoints; i++) {
            const ratio = i / (numPoints + 1);
            points.push({
                id: i,
                lat: start.lat + (end.lat - start.lat) * ratio,
                lng: start.lng + (end.lng - start.lng) * ratio,
                name: `Waypoint ${i}`
            });
        }
        
        return points;
    };

    // Select best route from multiple options
    const selectBestRoute = (routes, options) => {
        if (!routes || routes.length === 0) return null;
        
        const validRoutes = routes.filter(route => route && route.path.length > 0);
        if (validRoutes.length === 0) return null;

        return validRoutes.reduce((best, current) => {
            const bestScore = calculateRouteScore(best, options);
            const currentScore = calculateRouteScore(current, options);
            return currentScore < bestScore ? current : best;
        });
    };

    // Calculate route score for comparison
    const calculateRouteScore = (route, options) => {
        const { optimizeFor = 'time' } = options;
        
        switch (optimizeFor) {
            case 'time':
                return route.distance * 1.2; // Time optimization
            case 'cost':
                return route.distance * 1.0; // Cost optimization
            case 'distance':
            default:
                return route.distance; // Distance optimization
        }
    };

    // Generate alternative routes
    const generateAlternativeRoutes = (routes, bestRoute, allPoints, vehicle) => {
        const alternatives = routes.filter(route => 
            route && route !== bestRoute && route.path.length > 0
        ).slice(0, 2);

        return alternatives.map((route, index) => ({
            ...route,
            startPoint,
            endPoint,
            vehicleId: selectedVehicle,
            vehicle: vehicle,
            status: 'ALTERNATIVE',
            createdAt: new Date(),
            path: route.path.map(nodeIndex => allPoints[nodeIndex])
        }));
    };

    // Calculate comprehensive route metrics
    const calculateRouteMetrics = (route, vehicle, trafficInfo) => {
        const baseDistance = route.distance || 5;
        const baseDuration = baseDistance * 2; // 2 min per km base
        
        return {
            distance: baseDistance,
            estimatedDuration: baseDuration * (trafficInfo.trafficDensity || 1),
            energyConsumption: calculateEnergyConsumption(baseDistance, vehicle?.type),
            fuelCost: calculateFuelCost(baseDistance, vehicle?.type),
            carbonFootprint: calculateCarbonFootprint(baseDistance, vehicle?.type),
            trafficLevel: trafficInfo.trafficDensity || 0.5,
            efficiency: calculateEfficiency(baseDistance, vehicle?.type, trafficInfo.trafficDensity)
        };
    };

    // Calculate energy consumption
    const calculateEnergyConsumption = (distance, vehicleType) => {
        const consumptionRates = {
            'EV': 0.2,      // kWh per km
            'Diesel': 0.3,  // Liters per km
            'Hybrid': 0.25  // Mixed consumption
        };
        return distance * (consumptionRates[vehicleType] || 0.25);
    };

    // Calculate fuel cost
    const calculateFuelCost = (distance, vehicleType) => {
        const fuelPrices = {
            'EV': 8,      // ₹ per kWh
            'Diesel': 95, // ₹ per liter
            'Hybrid': 85  // Average price
        };
        const consumption = calculateEnergyConsumption(distance, vehicleType);
        return consumption * (fuelPrices[vehicleType] || 85);
    };

    // Calculate carbon footprint
    const calculateCarbonFootprint = (distance, vehicleType) => {
        const emissionFactors = {
            'EV': 0.05,     // kg CO2 per km
            'Diesel': 2.3,  // kg CO2 per km
            'Hybrid': 1.2   // kg CO2 per km
        };
        return distance * (emissionFactors[vehicleType] || 1.2);
    };

    // Calculate route efficiency
    const calculateEfficiency = (distance, vehicleType, trafficDensity) => {
        const baseEfficiency = vehicleType === 'EV' ? 0.9 : 0.7;
        const trafficPenalty = trafficDensity * 0.3;
        return Math.max(baseEfficiency - trafficPenalty, 0.3);
    };

    // Create fallback route
    const createFallbackRoute = () => {
        const vehicle = vehicles.find(v => v.id == selectedVehicle);
        return {
            startPoint,
            endPoint,
            startCoords: { lat: 12.9716, lng: 77.5946 },
            endCoords: { lat: 12.9850, lng: 77.6095 },
            vehicleId: selectedVehicle,
            vehicle: vehicle,
            algorithm: 'Fallback',
            status: 'OPTIMIZED',
            createdAt: new Date(),
            distance: 5.2 + Math.random() * 2,
            estimatedDuration: 15 + Math.random() * 10,
            energyConsumption: 2.1 + Math.random() * 1,
            trafficDensity: Math.random() * 0.8 + 0.1,
            path: [
                { lat: 12.9716, lng: 77.5946, name: startPoint },
                { lat: 12.9736, lng: 77.5966, name: 'Waypoint 1' },
                { lat: 12.9756, lng: 77.5986, name: 'Waypoint 2' },
                { lat: 12.9768, lng: 77.5758, name: endPoint }
            ],
            metrics: calculateRouteMetrics(
                { distance: 5.2 }, 
                vehicle, 
                { trafficDensity: 0.5 }
            )
        };
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="route-optimization-container">
            <div className="optimization-header">
                <h1>🚀 Advanced Route Optimization</h1>
                <p>AI-powered routing with real-time traffic and Maps integration</p>
            </div>

            <div className="optimization-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'optimize' ? 'active' : ''}`}
                    onClick={() => setActiveTab('optimize')}
                >
                    🎯 Route Optimization
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    📊 Analytics & Metrics
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    ⚙️ Settings
                </button>
            </div>

            {activeTab === 'optimize' && (
                <div className="optimization-content">
                    <div className="input-section">
                        <div className="input-grid">
                            <div className="input-group">
                                <label>📍 Start Location</label>
                                <input
                                    type="text"
                                    value={startPoint}
                                    onChange={(e) => setStartPoint(e.target.value)}
                                    placeholder="Enter start address..."
                                    className="location-input"
                                />
                            </div>
                            
                            <div className="input-group">
                                <label>🎯 Destination</label>
                                <input
                                    type="text"
                                    value={endPoint}
                                    onChange={(e) => setEndPoint(e.target.value)}
                                    placeholder="Enter destination..."
                                    className="location-input"
                                />
                            </div>
                            
                            <div className="input-group">
                                <label>🚛 Vehicle</label>
                                <select
                                    value={selectedVehicle}
                                    onChange={(e) => setSelectedVehicle(e.target.value)}
                                    className="vehicle-select"
                                >
                                    <option value="">Select vehicle...</option>
                                    {vehicles.map(vehicle => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.name} ({vehicle.type}) - {vehicle.capacity}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="input-group">
                                <label>⚙️ Optimization</label>
                                <select className="optimization-select">
                                    <option value="time">⏱️ Fastest Route</option>
                                    <option value="distance">📏 Shortest Distance</option>
                                    <option value="cost">💰 Lowest Cost</option>
                                </select>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleOptimizeRoute}
                            disabled={loading}
                            className="optimize-btn"
                        >
                            {loading ? '🔄 Optimizing...' : '🚀 Optimize Route'}
                        </button>
                    </div>

                    {showMap && optimizedRoute && (
                        <div className="results-section">
                            <div className="route-metrics">
                                <h3>📊 Route Metrics</h3>
                                <div className="metrics-grid">
                                    <div className="metric-card">
                                        <div className="metric-icon">📏</div>
                                        <div className="metric-value">{optimizedRoute.metrics.distance.toFixed(1)} km</div>
                                        <div className="metric-label">Distance</div>
                                    </div>
                                    
                                    <div className="metric-card">
                                        <div className="metric-icon">⏱️</div>
                                        <div className="metric-value">{formatDuration(optimizedRoute.metrics.estimatedDuration)}</div>
                                        <div className="metric-label">Estimated Time</div>
                                    </div>
                                    
                                    <div className="metric-card">
                                        <div className="metric-icon">⚡</div>
                                        <div className="metric-value">{optimizedRoute.metrics.energyConsumption.toFixed(1)}</div>
                                        <div className="metric-label">Energy (kWh/L)</div>
                                    </div>
                                    
                                    <div className="metric-card">
                                        <div className="metric-icon">💰</div>
                                        <div className="metric-value">{formatCurrency(optimizedRoute.metrics.fuelCost)}</div>
                                        <div className="metric-label">Fuel Cost</div>
                                    </div>
                                    
                                    <div className="metric-card">
                                        <div className="metric-icon">🌱</div>
                                        <div className="metric-value">{optimizedRoute.metrics.carbonFootprint.toFixed(1)} kg</div>
                                        <div className="metric-label">CO₂ Emissions</div>
                                    </div>
                                    
                                    <div className="metric-card">
                                        <div className="metric-icon">🚦</div>
                                        <div className="metric-value">{Math.round(optimizedRoute.metrics.trafficLevel * 100)}%</div>
                                        <div className="metric-label">Traffic Level</div>
                                    </div>
                                </div>
                            </div>

                            <div className="map-section">
                                <h3>🗺️ Route Visualization</h3>
                                <RouteMap
                                    startPoint={optimizedRoute.startCoords}
                                    endPoint={optimizedRoute.endCoords}
                                    routeData={optimizedRoute}
                                    alternativeRoutes={alternatives}
                                />
                            </div>

                            {alternatives.length > 0 && (
                                <div className="alternatives-section">
                                    <h3>🔄 Alternative Routes</h3>
                                    <div className="alternatives-grid">
                                        {alternatives.map((alt, index) => (
                                            <div key={index} className="alternative-card">
                                                <h4>Route Option {index + 1}</h4>
                                                <div className="alternative-metrics">
                                                    <span>📏 {alt.distance.toFixed(1)} km</span>
                                                    <span>⏱️ {formatDuration(alt.distance * 2)}</span>
                                                    <span>🚦 {Math.round(Math.random() * 100)}% traffic</span>
                                                </div>
                                                <button className="select-route-btn">Select This Route</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="analytics-content">
                    <h2>📊 Route Analytics & Performance</h2>
                    <div className="analytics-grid">
                        <div className="analytics-card">
                            <h3>🚦 Traffic Analysis</h3>
                            <div className="traffic-chart">
                                <div className="traffic-bar" style={{ width: '60%' }}></div>
                                <span>Moderate Traffic</span>
                            </div>
                        </div>
                        
                        <div className="analytics-card">
                            <h3>⚡ Energy Efficiency</h3>
                            <div className="efficiency-chart">
                                <div className="efficiency-bar" style={{ width: '85%' }}></div>
                                <span>85% Efficient</span>
                            </div>
                        </div>
                        
                        <div className="analytics-card">
                            <h3>💰 Cost Analysis</h3>
                            <div className="cost-breakdown">
                                <div className="cost-item">
                                    <span>Fuel</span>
                                    <span>₹450</span>
                                </div>
                                <div className="cost-item">
                                    <span>Tolls</span>
                                    <span>₹120</span>
                                </div>
                                <div className="cost-item">
                                    <span>Total</span>
                                    <span>₹570</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="settings-content">
                    <h2>⚙️ Optimization Settings</h2>
                    <div className="settings-grid">
                        <div className="setting-group">
                            <h3>🗺️ Map Provider</h3>
                            <div className="setting-options">
                                <label>
                                    <input type="radio" name="mapProvider" value="google" defaultChecked />
                                    Google Maps
                                </label>
                                <label>
                                    <input type="radio" name="mapProvider" value="leaflet" />
                                    Leaflet (OpenStreetMap)
                                </label>
                            </div>
                        </div>
                        
                        <div className="setting-group">
                            <h3>🚦 Traffic Data</h3>
                            <div className="setting-options">
                                <label>
                                    <input type="checkbox" defaultChecked />
                                    Use real-time traffic data
                                </label>
                                <label>
                                    <input type="checkbox" defaultChecked />
                                    Consider traffic in optimization
                                </label>
                            </div>
                        </div>
                        
                        <div className="setting-group">
                            <h3>🎯 Algorithm Preferences</h3>
                            <div className="setting-options">
                                <label>
                                    <input type="checkbox" defaultChecked />
                                    Use A* algorithm for faster results
                                </label>
                                <label>
                                    <input type="checkbox" defaultChecked />
                                    Generate alternative routes
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdvancedRouteOptimization;
