// Advanced Road Network for Route Optimization
// Supports real-time traffic, multiple vehicle types, and AI optimization

class AdvancedRoadNetwork {
    constructor() {
        this.nodes = new Map();      // Map of node ID to node data
        this.edges = new Map();      // Map of edge ID to edge data
        this.adjacencyList = new Map(); // Graph adjacency list
        this.trafficData = new Map(); // Real-time traffic data
        this.roadTypes = new Map();   // Road type classifications
        this.speedLimits = new Map(); // Speed limits by road type
        this.initializeNetwork();
    }

    // Initialize default road network with Bangalore area
    initializeNetwork() {
        // Define major nodes (junctions, landmarks)
        const defaultNodes = [
            { id: 'b1', name: 'Electronic City', lat: 12.9716, lng: 77.5946, type: 'commercial' },
            { id: 'b2', name: 'Whitefield', lat: 12.9850, lng: 77.6095, type: 'commercial' },
            { id: 'b3', name: 'Koramangala', lat: 12.9352, lng: 77.6245, type: 'residential' },
            { id: 'b4', name: 'Indiranagar', lat: 12.9784, lng: 77.6408, type: 'commercial' },
            { id: 'b5', name: 'HSR Layout', lat: 12.9100, lng: 77.6480, type: 'residential' },
            { id: 'b6', name: 'Marathahalli', lat: 12.9580, lng: 77.7070, type: 'commercial' },
            { id: 'b7', name: 'Silk Board', lat: 12.9170, lng: 77.6100, type: 'junction' },
            { id: 'b8', name: 'MG Road', lat: 12.9760, lng: 77.6050, type: 'commercial' },
            { id: 'b9', name: 'Jayanagar', lat: 12.9300, lng: 77.5800, type: 'residential' },
            { id: 'b10', name: 'BTM Layout', lat: 12.9200, lng: 77.6100, type: 'residential' }
        ];

        // Add nodes to network
        defaultNodes.forEach(node => this.addNode(node));

        // Define roads (edges) between nodes
        const defaultEdges = [
            { from: 'b1', to: 'b2', distance: 8.5, roadType: 'highway', speedLimit: 80 },
            { from: 'b1', to: 'b3', distance: 6.2, roadType: 'arterial', speedLimit: 60 },
            { from: 'b2', to: 'b4', distance: 7.8, roadType: 'arterial', speedLimit: 60 },
            { from: 'b2', to: 'b6', distance: 4.3, roadType: 'highway', speedLimit: 80 },
            { from: 'b3', to: 'b4', distance: 5.1, roadType: 'arterial', speedLimit: 50 },
            { from: 'b3', to: 'b7', distance: 3.8, roadType: 'arterial', speedLimit: 60 },
            { from: 'b4', to: 'b8', distance: 2.9, roadType: 'arterial', speedLimit: 50 },
            { from: 'b5', to: 'b7', distance: 4.2, roadType: 'local', speedLimit: 40 },
            { from: 'b5', to: 'b9', distance: 5.5, roadType: 'arterial', speedLimit: 50 },
            { from: 'b6', to: 'b7', distance: 6.8, roadType: 'highway', speedLimit: 80 },
            { from: 'b7', to: 'b8', distance: 3.5, roadType: 'arterial', speedLimit: 60 },
            { from: 'b8', to: 'b9', distance: 4.7, roadType: 'arterial', speedLimit: 50 },
            { from: 'b9', to: 'b10', distance: 2.8, roadType: 'local', speedLimit: 40 },
            { from: 'b10', to: 'b1', distance: 5.3, roadType: 'arterial', speedLimit: 60 }
        ];

        // Add edges to network (bidirectional)
        defaultEdges.forEach(edge => {
            this.addEdge(edge.from, edge.to, edge);
            this.addEdge(edge.to, edge.from, edge);
        });

        // Initialize road type properties
        this.roadTypes.set('highway', { multiplier: 0.9, trafficFactor: 0.7 });
        this.roadTypes.set('arterial', { multiplier: 1.0, trafficFactor: 0.8 });
        this.roadTypes.set('local', { multiplier: 1.2, trafficFactor: 0.9 });

        // Initialize speed limits
        this.speedLimits.set('highway', 80);
        this.speedLimits.set('arterial', 60);
        this.speedLimits.set('local', 40);

        // Initialize with some traffic data
        this.initializeTrafficData();
    }

    // Add a node to the network
    addNode(nodeData) {
        const node = {
            id: nodeData.id,
            name: nodeData.name,
            lat: nodeData.lat,
            lng: nodeData.lng,
            type: nodeData.type || 'junction',
            connections: []
        };
        
        this.nodes.set(nodeData.id, node);
        this.adjacencyList.set(nodeData.id, []);
        return node;
    }

    // Add an edge to the network
    addEdge(fromId, toId, edgeData) {
        const edge = {
            id: `${fromId}-${toId}`,
            from: fromId,
            to: toId,
            distance: edgeData.distance || this.calculateDistance(
                this.nodes.get(fromId), 
                this.nodes.get(toId)
            ),
            roadType: edgeData.roadType || 'arterial',
            speedLimit: edgeData.speedLimit || this.speedLimits.get(edgeData.roadType) || 60,
            trafficDensity: 0.5,
            estimatedTime: 0,
            lastUpdated: new Date()
        };

        // Calculate estimated time
        edge.estimatedTime = (edge.distance / edge.speedLimit) * 60; // in minutes

        this.edges.set(edge.id, edge);
        this.adjacencyList.get(fromId).push({
            node: toId,
            edge: edge.id,
            ...edge
        });

        return edge;
    }

    // Calculate distance between two nodes
    calculateDistance(node1, node2) {
        if (!node1 || !node2) return 0;
        
        const R = 6371; // Earth's radius in km
        const dLat = (node2.lat - node1.lat) * Math.PI / 180;
        const dLon = (node2.lng - node1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(node1.lat * Math.PI / 180) * Math.cos(node2.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Get nearest node to given coordinates
    getNearestNode(lat, lng) {
        let nearestNode = null;
        let minDistance = Infinity;

        for (const node of this.nodes.values()) {
            const distance = this.calculateDistance(
                { lat, lng },
                node
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestNode = node;
            }
        }

        return nearestNode;
    }

    // Update traffic data for specific edges
    updateTrafficData(edgeUpdates) {
        const currentTime = new Date();
        
        edgeUpdates.forEach(update => {
            const edgeId = `${update.from}-${update.to}`;
            const edge = this.edges.get(edgeId);
            
            if (edge) {
                edge.trafficDensity = update.density || 0.5;
                edge.lastUpdated = currentTime;
                
                // Update estimated time based on traffic
                const baseTime = (edge.distance / edge.speedLimit) * 60;
                const trafficMultiplier = 1 + (edge.trafficDensity * 0.5);
                edge.estimatedTime = baseTime * trafficMultiplier;
            }
        });

        // Also update reverse edge
        edgeUpdates.forEach(update => {
            const reverseEdgeId = `${update.to}-${update.from}`;
            const reverseEdge = this.edges.get(reverseEdgeId);
            
            if (reverseEdge) {
                reverseEdge.trafficDensity = update.density || 0.5;
                reverseEdge.lastUpdated = currentTime;
                
                const baseTime = (reverseEdge.distance / reverseEdge.speedLimit) * 60;
                const trafficMultiplier = 1 + (reverseEdge.trafficDensity * 0.5);
                reverseEdge.estimatedTime = baseTime * trafficMultiplier;
            }
        });
    }

    // Initialize traffic data with realistic patterns
    initializeTrafficData() {
        const currentTime = new Date();
        const hour = currentTime.getHours();
        
        // Simulate traffic patterns based on time of day
        let trafficMultiplier = 0.5; // Base traffic
        
        if (hour >= 7 && hour <= 10) {
            trafficMultiplier = 0.8; // Morning rush
        } else if (hour >= 17 && hour <= 20) {
            trafficMultiplier = 0.9; // Evening rush
        } else if (hour >= 11 && hour <= 16) {
            trafficMultiplier = 0.6; // Midday
        } else {
            trafficMultiplier = 0.3; // Night/early morning
        }

        // Apply traffic to edges
        for (const edge of this.edges.values()) {
            // Higher traffic on highways during rush hours
            const edgeMultiplier = edge.roadType === 'highway' ? 
                trafficMultiplier * 1.2 : trafficMultiplier;
            
            edge.trafficDensity = Math.min(edgeMultiplier, 1.0);
            edge.lastUpdated = currentTime;
            
            // Update estimated time
            const baseTime = (edge.distance / edge.speedLimit) * 60;
            const trafficFactor = 1 + (edge.trafficDensity * 0.5);
            edge.estimatedTime = baseTime * trafficFactor;
        }
    }

    // Get path cost based on optimization criteria
    getEdgeCost(edge, options = {}) {
        const {
            optimizeFor = 'distance', // 'distance', 'time', 'cost'
            vehicleType = 'EV',
            considerTraffic = true
        } = options;

        let baseCost = edge.distance;

        switch (optimizeFor) {
            case 'time':
                baseCost = considerTraffic ? edge.estimatedTime : (edge.distance / edge.speedLimit) * 60;
                break;
            case 'cost':
                baseCost = this.calculateFuelCost(edge.distance, vehicleType);
                break;
            case 'distance':
            default:
                baseCost = edge.distance;
                break;
        }

        // Apply vehicle type multiplier
        const vehicleMultipliers = {
            'EV': 0.9,
            'Diesel': 1.1,
            'Hybrid': 1.0
        };
        baseCost *= vehicleMultipliers[vehicleType] || 1.0;

        // Apply road type multiplier
        const roadType = this.roadTypes.get(edge.roadType);
        if (roadType) {
            baseCost *= roadType.multiplier;
        }

        return baseCost;
    }

    // Calculate fuel cost for distance
    calculateFuelCost(distance, vehicleType) {
        const fuelPrices = {
            'EV': 8,      // ₹ per kWh
            'Diesel': 95, // ₹ per liter
            'Hybrid': 85  // Average price
        };

        const consumptionRates = {
            'EV': 0.2,      // kWh per km
            'Diesel': 0.3,  // Liters per km
            'Hybrid': 0.25  // Mixed consumption
        };

        const consumption = distance * (consumptionRates[vehicleType] || 0.25);
        return consumption * (fuelPrices[vehicleType] || 85);
    }

    // Find shortest path using Dijkstra's algorithm
    findShortestPath(startId, endId, options = {}) {
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();
        const path = [];

        // Initialize distances
        for (const nodeId of this.nodes.keys()) {
            distances.set(nodeId, nodeId === startId ? 0 : Infinity);
            previous.set(nodeId, null);
            unvisited.add(nodeId);
        }

        while (unvisited.size > 0) {
            // Find node with minimum distance
            let current = null;
            let minDistance = Infinity;
            
            for (const nodeId of unvisited) {
                if (distances.get(nodeId) < minDistance) {
                    minDistance = distances.get(nodeId);
                    current = nodeId;
                }
            }

            if (current === null || current === endId) break;

            unvisited.delete(current);

            // Update distances to neighbors
            const neighbors = this.adjacencyList.get(current) || [];
            for (const neighbor of neighbors) {
                if (unvisited.has(neighbor.node)) {
                    const edgeCost = this.getEdgeCost(neighbor, options);
                    const altDistance = distances.get(current) + edgeCost;
                    
                    if (altDistance < distances.get(neighbor.node)) {
                        distances.set(neighbor.node, altDistance);
                        previous.set(neighbor.node, current);
                    }
                }
            }
        }

        // Reconstruct path
        let current = endId;
        while (current !== null) {
            path.unshift(this.nodes.get(current));
            current = previous.get(current);
        }

        // Calculate total metrics
        let totalDistance = 0;
        let totalTime = 0;
        let totalCost = 0;

        for (let i = 0; i < path.length - 1; i++) {
            const fromNode = path[i];
            const toNode = path[i + 1];
            const edgeId = `${fromNode.id}-${toNode.id}`;
            const edge = this.edges.get(edgeId);
            
            if (edge) {
                totalDistance += edge.distance;
                totalTime += edge.estimatedTime;
                totalCost += this.calculateFuelCost(edge.distance, options.vehicleType || 'EV');
            }
        }

        return {
            path,
            distance: totalDistance,
            estimatedDuration: totalTime,
            fuelCost: totalCost,
            algorithm: 'Dijkstra',
            options,
            trafficDensity: this.calculateAverageTrafficDensity(path)
        };
    }

    // Calculate average traffic density for a path
    calculateAverageTrafficDensity(path) {
        if (path.length < 2) return 0.5;

        let totalTraffic = 0;
        let edgeCount = 0;

        for (let i = 0; i < path.length - 1; i++) {
            const fromNode = path[i];
            const toNode = path[i + 1];
            const edgeId = `${fromNode.id}-${toNode.id}`;
            const edge = this.edges.get(edgeId);
            
            if (edge) {
                totalTraffic += edge.trafficDensity;
                edgeCount++;
            }
        }

        return edgeCount > 0 ? totalTraffic / edgeCount : 0.5;
    }

    // Get all nodes
    getAllNodes() {
        return Array.from(this.nodes.values());
    }

    // Get node by ID
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }

    // Get traffic data for visualization
    getTrafficData() {
        const trafficData = [];
        
        for (const edge of this.edges.values()) {
            trafficData.push({
                from: edge.from,
                to: edge.to,
                density: edge.trafficDensity,
                speed: edge.speedLimit,
                estimatedTime: edge.estimatedTime
            });
        }
        
        return trafficData;
    }

    // Find alternative routes
    findAlternativeRoutes(startId, endId, options = {}) {
        const alternatives = [];
        
        // Try different optimization criteria
        const criteria = ['distance', 'time', 'cost'];
        
        for (const criterion of criteria) {
            if (criterion !== options.optimizeFor) {
                const route = this.findShortestPath(startId, endId, {
                    ...options,
                    optimizeFor: criterion
                });
                
                if (route.path.length > 0) {
                    alternatives.push({
                        ...route,
                        algorithm: `Dijkstra-${criterion}`,
                        type: 'alternative'
                    });
                }
            }
        }
        
        return alternatives;
    }

    // Update network with real-time data
    updateWithRealTimeData(realTimeData) {
        if (realTimeData.trafficUpdates) {
            this.updateTrafficData(realTimeData.trafficUpdates);
        }
        
        if (realTimeData.roadClosures) {
            this.handleRoadClosures(realTimeData.roadClosures);
        }
        
        if (realTimeData.speedLimitChanges) {
            this.updateSpeedLimits(realTimeData.speedLimitChanges);
        }
    }

    // Handle road closures
    handleRoadClosures(closures) {
        closures.forEach(closure => {
            const edgeId = `${closure.from}-${closure.to}`;
            const edge = this.edges.get(edgeId);
            
            if (edge) {
                edge.trafficDensity = 1.0; // Maximum traffic (blocked)
                edge.estimatedTime = Infinity;
            }
        });
    }

    // Update speed limits
    updateSpeedLimits(changes) {
        changes.forEach(change => {
            const edgeId = `${change.from}-${change.to}`;
            const edge = this.edges.get(edgeId);
            
            if (edge) {
                edge.speedLimit = change.newLimit;
                edge.estimatedTime = (edge.distance / edge.speedLimit) * 60;
            }
        });
    }

    // Export network data for analysis
    exportNetworkData() {
        return {
            nodes: Array.from(this.nodes.values()),
            edges: Array.from(this.edges.values()),
            trafficData: this.getTrafficData(),
            statistics: this.getNetworkStatistics()
        };
    }

    // Get network statistics
    getNetworkStatistics() {
        const nodes = Array.from(this.nodes.values());
        const edges = Array.from(this.edges.values());
        
        const avgTraffic = edges.reduce((sum, edge) => sum + edge.trafficDensity, 0) / edges.length;
        const totalDistance = edges.reduce((sum, edge) => sum + edge.distance, 0);
        
        const roadTypeCounts = {};
        edges.forEach(edge => {
            roadTypeCounts[edge.roadType] = (roadTypeCounts[edge.roadType] || 0) + 1;
        });

        return {
            totalNodes: nodes.length,
            totalEdges: edges.length,
            totalDistance: totalDistance,
            averageTrafficDensity: avgTraffic,
            roadTypeDistribution: roadTypeCounts,
            lastUpdated: new Date()
        };
    }
}

export default AdvancedRoadNetwork;
