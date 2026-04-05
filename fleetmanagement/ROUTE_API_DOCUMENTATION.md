# Route Generation API Documentation

This document provides comprehensive documentation for the enhanced route generation functionality in your fleet management application.

## Overview

The application now supports sophisticated route generation with multiple algorithms, intelligent alternatives, and multi-stop optimization. The RouteService handles all business logic while the RouteController exposes REST endpoints.

## API Endpoints

### 1. Primary Route Optimization

**Endpoint:** `POST /api/routes/optimize`

**Request Body:**
```json
{
  "startPoint": "Bangalore",
  "endPoint": "Mumbai"
}
```

**Response:**
```json
{
  "id": 1700000000000,
  "startPoint": "Bangalore",
  "endPoint": "Mumbai",
  "distance": 125.5,
  "estimatedDuration": 95,
  "algorithm": "AI-Dijkstra-ML",
  "trafficDensity": 0.6,
  "energyConsumption": 18.2,
  "estimatedCost": 450.0,
  "status": "OPTIMIZED",
  "createdAt": "2024-03-13T10:30:00.000+00:00",
  "isPrimary": true,
  "color": "#4CAF50",
  "aiOptimizationLevel": "Maximum",
  "machineLearningEnabled": true,
  "predictiveAnalytics": true
}
```

### 2. Alternative Routes Generation

**Endpoint:** `POST /api/routes/alternatives`

**Request Body:**
```json
{
  "startPoint": "Delhi",
  "endPoint": "Chennai",
  "numberOfAlternatives": 4
}
```

**Available Algorithms:**
- `A*-Traffic-Aware` - Real-time traffic prediction and dynamic rerouting
- `Greedy-Energy-Optimized` - Maximum energy efficiency with regenerative braking
- `Time-Optimized` - Fastest possible route with express lanes
- `Cost-Effective` - Minimum expense with toll avoidance
- `Scenic-Route` - Beautiful landscapes with tourist spots
- `Avoid-Highways` - Local roads only for city driving

**Response:**
```json
[
  {
    "algorithm": "A*-Traffic-Aware",
    "startPoint": "Delhi",
    "endPoint": "Chennai",
    "distance": 120.0,
    "estimatedDuration": 85,
    "trafficDensity": 0.5,
    "energyConsumption": 15.0,
    "estimatedCost": 400.0,
    "status": "PLANNED",
    "color": "#2196F3",
    "createdAt": "2024-03-13T10:30:00.000+00:00",
    "isAlternative": true,
    "trafficAvoidance": "High",
    "realTimeUpdates": true,
    "trafficPrediction": "Real-time AI analysis",
    "dynamicRerouting": true
  }
]
```

### 3. Intelligent Alternative Routes

**Endpoint:** `POST /api/routes/intelligent-alternatives`

**Request Body:**
```json
{
  "startPoint": "Mumbai",
  "endPoint": "Pune",
  "vehicleType": "EV",
  "timeOfDay": "rush_hour"
}
```

**Features:**
- **Vehicle-specific optimization** (EV, standard, etc.)
- **Time-based optimization** (rush hour, normal traffic)
- **Smart algorithm selection** based on conditions

**Response:**
```json
[
  {
    "algorithm": "EV-Optimized",
    "startPoint": "Mumbai",
    "endPoint": "Pune",
    "distance": 110.0,
    "estimatedDuration": 75,
    "trafficDensity": 0.4,
    "energyConsumption": 12.0,
    "estimatedCost": 350.0,
    "status": "PLANNED",
    "color": "#4CAF50",
    "createdAt": "2024-03-13T10:30:00.000+00:00",
    "isAlternative": true,
    "evOptimization": "Electric vehicle optimized",
    "chargingStations": "Included",
    "batteryEfficiency": "Maximum",
    "evFriendly": true
  }
]
```

### 4. Multi-Stop Route Optimization

**Endpoint:** `POST /api/routes/multi-stop`

**Request Body:**
```json
{
  "startPoint": "Hyderabad",
  "endPoint": "Vijayawada",
  "waypoints": ["Warangal", "Khammam", "Eluru"]
}
```

**Available Strategies:**
- `Sequential-Optimization` - Sequential waypoint optimization
- `Cluster-Based` - Geographic clustering
- `Time-Zone-Aware` - Time zone optimization
- `Fuel-Efficient` - Fuel consumption optimization
- `Priority-Stop-First` - Priority-based routing
- `Distance-Minimized` - Distance minimization

**Response:**
```json
[
  {
    "strategy": "Sequential-Optimization",
    "startPoint": "Hyderabad",
    "endPoint": "Vijayawada",
    "waypoints": ["Warangal", "Khammam", "Eluru"],
    "totalDistance": 280.0,
    "totalDuration": 240,
    "estimatedCost": 1200.0,
    "color": "#E91E63",
    "status": "PLANNED",
    "createdAt": "2024-03-13T10:30:00.000+00:00",
    "optimizationType": "Sequential waypoint optimization",
    "timeEfficiency": "High"
  }
]
```

### 5. Route Metrics

**Endpoint:** `GET /api/routes/route-metrics?algorithm=A*-Traffic-Aware`

**Response:**
```json
{
  "algorithm": "A*-Traffic-Aware",
  "avgDistance": 125.5,
  "avgDuration": 95,
  "successRate": 0.92,
  "energyEfficiency": 0.78,
  "lastUpdated": "2024-03-13T10:30:00.000+00:00",
  "performanceScore": 0.85,
  "reliabilityScore": 0.88
}
```

### 6. Active Routes

**Endpoint:** `GET /api/routes/active`

**Response:**
```json
[
  {
    "id": 1,
    "startPoint": "Bangalore",
    "endPoint": "Mumbai",
    "status": "ACTIVE",
    "currentLocation": "Pune",
    "progress": 65
  }
]
```

### 7. Recent Routes

**Endpoint:** `GET /api/routes/recent`

**Response:**
```json
[
  {
    "id": 1,
    "startPoint": "Delhi",
    "endPoint": "Chennai",
    "status": "COMPLETED",
    "completionTime": "2 hours 15 minutes",
    "distance": 2150.5
  }
]
```

### 8. Load Balancing

**Endpoint:** `POST /api/routes/load-balance`

**Request Body:**
```json
{
  "vehicleIds": [1, 2, 3, 4],
  "startPoint": "Chennai",
  "endPoint": "Coimbatore"
}
```

**Response:**
```json
[
  {
    "vehicle": {
      "id": 1,
      "name": "Vehicle 1",
      "registration": "KA-01-0001"
    },
    "route": {
      "startPoint": "Chennai",
      "endPoint": "Coimbatore",
      "distance": 120.0,
      "estimatedDuration": 90,
      "algorithm": "Load-Balanced-AI",
      "trafficDensity": 0.4,
      "energyConsumption": 15.0,
      "status": "PLANNED",
      "efficiency": 85
    }
  }
]
```

## Algorithm Features

### Traffic-Aware Algorithms
- **A*-Traffic-Aware**: Real-time AI traffic analysis
- **Avoid-Traffic-Jams**: Maximum traffic avoidance
- **Alternative-Lanes**: Multiple lane usage optimization

### Energy Optimization
- **Greedy-Energy-Optimized**: Maximum energy efficiency
- **EV-Optimized**: Electric vehicle specific optimization
- **Charging-Station-Route**: Optimal charging station placement

### Time Optimization
- **Time-Optimized**: Priority time optimization
- **Fastest-Route**: Maximum speed optimization
- **Express-Lanes**: Express route inclusion

### Cost Optimization
- **Cost-Effective**: Minimum expense optimization
- **Toll-Avoidance**: Toll road avoidance

### Specialized Routes
- **Scenic-Route**: Tourist spot inclusion
- **Avoid-Highways**: Local road preference
- **Weather-Aware**: Weather condition adaptation

## Usage Examples

### Basic Route Optimization
```bash
curl -X POST http://localhost:8080/api/routes/optimize \
  -H "Content-Type: application/json" \
  -d '{"startPoint": "Bangalore", "endPoint": "Mumbai"}'
```

### Get Alternative Routes
```bash
curl -X POST http://localhost:8080/api/routes/alternatives \
  -H "Content-Type: application/json" \
  -d '{"startPoint": "Delhi", "endPoint": "Chennai", "numberOfAlternatives": 3}'
```

### Intelligent Route Selection
```bash
curl -X POST http://localhost:8080/api/routes/intelligent-alternatives \
  -H "Content-Type: application/json" \
  -d '{"startPoint": "Mumbai", "endPoint": "Pune", "vehicleType": "EV", "timeOfDay": "rush_hour"}'
```

### Multi-Stop Route
```bash
curl -X POST http://localhost:8080/api/routes/multi-stop \
  -H "Content-Type: application/json" \
  -d '{"startPoint": "Hyderabad", "endPoint": "Vijayawada", "waypoints": ["Warangal", "Khammam"]}'
```

## Integration with Frontend

The API is designed to work seamlessly with frontend applications:

1. **CORS Configuration**: Already configured for `http://localhost:5173`
2. **JSON Response Format**: Consistent across all endpoints
3. **Error Handling**: Standardized error responses
4. **Real-time Updates**: Support for dynamic route updates

## Performance Considerations

- **Caching**: Route calculations are optimized for performance
- **Async Processing**: Heavy computations can be made asynchronous
- **Database Integration**: Routes can be persisted to database
- **Real-time Updates**: Support for live traffic data integration

## Future Enhancements

- **Live Traffic Integration**: Real-time traffic API integration
- **Weather API**: Weather condition-based routing
- **Machine Learning**: Continuous route optimization learning
- **Mobile App**: Native mobile application support
- **GPS Integration**: Real-time GPS tracking integration