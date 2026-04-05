// Dijkstra Algorithm Implementation for Route Optimization

class GraphNode {
    constructor(id, lat, lng, name) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.name = name;
        this.neighbors = new Map(); // neighborId -> { distance, trafficFactor, roadType }
        this.distance = Infinity;
        this.previous = null;
        this.visited = false;
    }

    addNeighbor(neighborId, distance, trafficFactor = 1.0, roadType = 'urban') {
        const weight = distance * trafficFactor;
        this.neighbors.set(neighborId, {
            distance,
            trafficFactor,
            roadType,
            weight
        });
    }
}

class RoadNetwork {
    constructor() {
        this.nodes = new Map();
        this.initializeBangaloreNetwork();
    }

    // Initialize with Bangalore area road network (simplified for demo)
    initializeBangaloreNetwork() {
        // Major junctions/landmarks in Bangalore
        const locations = [
            { id: 1, name: "MG Road", lat: 12.9768, lng: 77.5758 },
            { id: 2, name: "Brigade Road", lat: 12.9795, lng: 77.5826 },
            { id: 3, name: "Koramangala", lat: 12.9279, lng: 77.6271 },
            { id: 4, name: "Indiranagar", lat: 12.9784, lng: 77.6408 },
            { id: 5, name: "JP Nagar", lat: 12.9157, lng: 77.5947 },
            { id: 6, name: "Electronic City", lat: 12.8440, lng: 77.6764 },
            { id: 7, name: "Whitefield", lat: 12.9698, lng: 77.7499 },
            { id: 8, name: "Marathahalli", lat: 12.9591, lng: 77.6995 },
            { id: 9, name: "HSR Layout", lat: 12.9106, lng: 77.6384 },
            { id: 10, name: "BTM Layout", lat: 12.9165, lng: 77.6106 }
        ];

        // Create nodes
        locations.forEach(loc => {
            this.nodes.set(loc.id, new GraphNode(loc.id, loc.lat, loc.lng, loc.name));
        });

        // Add connections (roads) with distances and traffic factors
        // Format: fromId, toId, distance(km), trafficFactor, roadType
        const connections = [
            [1, 2, 1.2, 0.8, 'urban'],     // MG Road to Brigade Road
            [1, 3, 8.5, 1.2, 'arterial'],   // MG Road to Koramangala
            [2, 4, 3.8, 1.0, 'urban'],     // Brigade Road to Indiranagar
            [3, 5, 6.2, 0.9, 'arterial'],   // Koramangala to JP Nagar
            [3, 9, 4.1, 1.1, 'urban'],     // Koramangala to HSR Layout
            [4, 7, 12.3, 1.3, 'highway'],  // Indiranagar to Whitefield
            [4, 8, 7.5, 1.4, 'arterial'],  // Indiranagar to Marathahalli
            [5, 10, 3.2, 0.8, 'urban'],    // JP Nagar to BTM Layout
            [6, 8, 8.9, 1.2, 'highway'],   // Electronic City to Marathahalli
            [7, 8, 5.6, 1.0, 'arterial'],  // Whitefield to Marathahalli
            [8, 9, 6.8, 1.1, 'arterial'],  // Marathahalli to HSR Layout
            [9, 10, 2.8, 0.9, 'urban'],    // HSR Layout to BTM Layout
            [2, 3, 7.1, 1.0, 'arterial'],  // Brigade Road to Koramangala
            [5, 6, 15.2, 1.5, 'highway'], // JP Nagar to Electronic City
            [10, 6, 18.5, 1.4, 'highway'], // BTM Layout to Electronic City
        ];

        // Add bidirectional connections
        connections.forEach(([from, to, distance, traffic, roadType]) => {
            if (this.nodes.has(from) && this.nodes.has(to)) {
                this.nodes.get(from).addNeighbor(to, distance, traffic, roadType);
                this.nodes.get(to).addNeighbor(from, distance, traffic, roadType);
            }
        });
    }

    // Dijkstra's Algorithm Implementation
    findShortestPath(startId, endId, options = {}) {
        const { 
            considerTraffic = true, 
            optimizeFor = 'distance', // 'distance', 'time', 'energy'
            vehicleType = 'EV' 
        } = options;

        // Reset all nodes
        this.nodes.forEach(node => {
            node.distance = Infinity;
            node.previous = null;
            node.visited = false;
        });

        const startNode = this.nodes.get(startId);
        const endNode = this.nodes.get(endId);

        if (!startNode || !endNode) {
            throw new Error('Start or end node not found');
        }

        startNode.distance = 0;

        const unvisited = new Set(this.nodes.keys());

        while (unvisited.size > 0) {
            // Find node with minimum distance
            let currentNode = null;
            let minDistance = Infinity;

            unvisited.forEach(nodeId => {
                const node = this.nodes.get(nodeId);
                if (node.distance < minDistance) {
                    minDistance = node.distance;
                    currentNode = node;
                }
            });

            if (!currentNode || currentNode.distance === Infinity) {
                break; // No reachable nodes left
            }

            unvisited.delete(currentNode.id);
            currentNode.visited = true;

            // Check if we reached the destination
            if (currentNode.id === endId) {
                break;
            }

            // Update distances to neighbors
            currentNode.neighbors.forEach((neighborInfo, neighborId) => {
                if (currentNode.visited) return;

                const neighbor = this.nodes.get(neighborId);
                let edgeWeight = neighborInfo.weight;

                // Apply optimization factors
                if (optimizeFor === 'time') {
                    // Consider speed limits based on road type
                    const speedLimits = {
                        'highway': 60,    // km/h
                        'arterial': 40,   // km/h
                        'urban': 30       // km/h
                    };
                    const speed = speedLimits[neighborInfo.roadType] || 40;
                    const trafficMultiplier = considerTraffic ? neighborInfo.trafficFactor : 1.0;
                    edgeWeight = (neighborInfo.distance / speed) * 60 * trafficMultiplier; // minutes
                } else if (optimizeFor === 'energy') {
                    // Energy consumption factors
                    const energyFactors = {
                        'highway': 1.2,
                        'arterial': 1.0,
                        'urban': 0.8
                    };
                    const vehicleFactor = vehicleType === 'EV' ? 0.7 : 1.0; // EVs more efficient
                    const trafficMultiplier = considerTraffic ? neighborInfo.trafficFactor : 1.0;
                    edgeWeight = neighborInfo.distance * energyFactors[neighborInfo.roadType] * vehicleFactor * trafficMultiplier;
                }

                const altDistance = currentNode.distance + edgeWeight;

                if (altDistance < neighbor.distance) {
                    neighbor.distance = altDistance;
                    neighbor.previous = currentNode.id;
                }
            });
        }

        // Reconstruct path
        const path = [];
        let current = endNode;

        while (current) {
            path.unshift({
                id: current.id,
                name: current.name,
                lat: current.lat,
                lng: current.lng
            });
            current = current.previous ? this.nodes.get(current.previous) : null;
        }

        if (path[0].id !== startId) {
            throw new Error('No path found between start and end nodes');
        }

        // Calculate route metrics
        const metrics = this.calculateRouteMetrics(path, optimizeFor, considerTraffic);

        return {
            path,
            distance: metrics.distance,
            duration: metrics.duration,
            energyConsumption: metrics.energy,
            trafficDensity: metrics.avgTraffic,
            algorithm: `Dijkstra-${optimizeFor}${considerTraffic ? '-Traffic' : ''}`,
            nodes: path.length
        };
    }

    calculateRouteMetrics(path, optimizeFor, considerTraffic) {
        let totalDistance = 0;
        let totalDuration = 0;
        let totalEnergy = 0;
        let trafficSum = 0;
        let segmentCount = 0;

        for (let i = 0; i < path.length - 1; i++) {
            const current = this.nodes.get(path[i].id);
            const neighborInfo = current.neighbors.get(path[i + 1].id);

            if (neighborInfo) {
                totalDistance += neighborInfo.distance;
                trafficSum += neighborInfo.trafficFactor;
                segmentCount++;

                // Calculate duration
                const speedLimits = {
                    'highway': 60,
                    'arterial': 40,
                    'urban': 30
                };
                const speed = speedLimits[neighborInfo.roadType] || 40;
                const trafficMultiplier = considerTraffic ? neighborInfo.trafficFactor : 1.0;
                totalDuration += (neighborInfo.distance / speed) * 60 * trafficMultiplier;

                // Calculate energy
                const energyFactors = {
                    'highway': 1.2,
                    'arterial': 1.0,
                    'urban': 0.8
                };
                totalEnergy += neighborInfo.distance * energyFactors[neighborInfo.roadType] * 0.8; // EV factor
            }
        }

        return {
            distance: totalDistance,
            duration: totalDuration,
            energy: totalEnergy,
            avgTraffic: segmentCount > 0 ? trafficSum / segmentCount : 0
        };
    }

    // Get nearest node to given coordinates
    getNearestNode(lat, lng) {
        let nearestNode = null;
        let minDistance = Infinity;

        this.nodes.forEach(node => {
            const distance = this.calculateDistance(lat, lng, node.lat, node.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearestNode = node;
            }
        });

        return nearestNode;
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Get all nodes for dropdown selection
    getAllNodes() {
        return Array.from(this.nodes.values()).map(node => ({
            id: node.id,
            name: node.name,
            lat: node.lat,
            lng: node.lng
        }));
    }
}

export default RoadNetwork;
