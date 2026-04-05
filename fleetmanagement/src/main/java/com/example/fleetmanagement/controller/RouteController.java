package com.example.fleetmanagement.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.fleetmanagement.service.RouteService;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:5173")
public class RouteController {

    private final Random random = new Random();
    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping("/optimize")
    public ResponseEntity<?> optimizeRoute(@RequestBody Map<String, Object> request) {
        try {
            String startPoint = (String) request.get("startPoint");
            String endPoint = (String) request.get("endPoint");
            
            Map<String, Object> optimizedRoute = routeService.generateOptimizedRoute(startPoint, endPoint);
            
            return ResponseEntity.ok(optimizedRoute);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error optimizing route: " + e.getMessage());
        }
    }

    @PostMapping("/alternatives")
    public ResponseEntity<?> getAlternativeRoutes(@RequestBody Map<String, Object> request) {
        try {
            String startPoint = (String) request.get("startPoint");
            String endPoint = (String) request.get("endPoint");
            int numberOfAlternatives = request.get("numberOfAlternatives") != null ? 
                (Integer) request.get("numberOfAlternatives") : 4;
            
            List<Map<String, Object>> alternatives = routeService.generateAlternativeRoutes(startPoint, endPoint, numberOfAlternatives);
            
            return ResponseEntity.ok(alternatives);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error generating alternatives: " + e.getMessage());
        }
    }

    @PostMapping("/intelligent-alternatives")
    public ResponseEntity<?> getIntelligentAlternativeRoutes(@RequestBody Map<String, Object> request) {
        try {
            String startPoint = (String) request.get("startPoint");
            String endPoint = (String) request.get("endPoint");
            
            // Get vehicle type for optimization
            String vehicleType = request.get("vehicleType") != null ? 
                (String) request.get("vehicleType") : "Standard";
            
            // Get time of day for traffic consideration
            String timeOfDay = request.get("timeOfDay") != null ? 
                (String) request.get("timeOfDay") : "morning";
            
            List<Map<String, Object>> intelligentAlternatives = routeService.generateIntelligentAlternatives(startPoint, endPoint, vehicleType, timeOfDay);
            
            return ResponseEntity.ok(intelligentAlternatives);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error generating intelligent alternatives: " + e.getMessage());
        }
    }

    @PostMapping("/multi-stop")
    public ResponseEntity<?> getMultiStopRoutes(@RequestBody Map<String, Object> request) {
        try {
            String startPoint = (String) request.get("startPoint");
            String endPoint = (String) request.get("endPoint");
            
            @SuppressWarnings("unchecked")
            List<String> waypoints = (List<String>) request.get("waypoints");
            
            List<Map<String, Object>> multiStopRoutes = routeService.generateMultiStopRoutes(startPoint, endPoint, waypoints);
            
            return ResponseEntity.ok(multiStopRoutes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error generating multi-stop routes: " + e.getMessage());
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<Map<String, Object>>> getActiveRoutes() {
        List<Map<String, Object>> activeRoutes = new ArrayList<>();
        Map<String, Object> route = new HashMap<>();
        route.put("id", 1L);
        route.put("startPoint", "Bangalore");
        route.put("endPoint", "Mumbai");
        route.put("status", "ACTIVE");
        route.put("currentLocation", "Pune");
        route.put("progress", 65);
        activeRoutes.add(route);
        return ResponseEntity.ok(activeRoutes);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentRoutes() {
        List<Map<String, Object>> recentRoutes = new ArrayList<>();
        Map<String, Object> route = new HashMap<>();
        route.put("id", 1L);
        route.put("startPoint", "Delhi");
        route.put("endPoint", "Chennai");
        route.put("status", "COMPLETED");
        route.put("completionTime", "2 hours 15 minutes");
        route.put("distance", 2150.5);
        recentRoutes.add(route);
        return ResponseEntity.ok(recentRoutes);
    }

    @PostMapping("/load-balance")
    public ResponseEntity<?> loadBalanceRoutes(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Integer> vehicleIds = (List<Integer>) request.get("vehicleIds");
            String startPoint = (String) request.get("startPoint");
            String endPoint = (String) request.get("endPoint");
            
            List<Map<String, Object>> balancedRoutes = new ArrayList<>();
            
            for (int i = 0; i < vehicleIds.size(); i++) {
                Map<String, Object> route = new HashMap<>();
                Map<String, Object> vehicle = new HashMap<>();
                vehicle.put("id", vehicleIds.get(i));
                vehicle.put("name", "Vehicle " + vehicleIds.get(i));
                vehicle.put("registration", "KA-01-" + String.format("%04d", vehicleIds.get(i)));
                
                route.put("vehicle", vehicle);
                
                Map<String, Object> routeData = new HashMap<>();
                routeData.put("startPoint", startPoint);
                routeData.put("endPoint", endPoint);
                routeData.put("distance", 120.0 + i * 15.0);
                routeData.put("estimatedDuration", 90 + i * 10);
                routeData.put("algorithm", "Load-Balanced-AI");
                routeData.put("trafficDensity", 0.4 + i * 0.1);
                routeData.put("energyConsumption", 15.0 + i * 2.0);
                routeData.put("status", "PLANNED");
                routeData.put("efficiency", 85 - i * 5);
                
                route.put("route", routeData);
                balancedRoutes.add(route);
            }
            
            return ResponseEntity.ok(balancedRoutes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error load balancing routes: " + e.getMessage());
        }
    }

    @GetMapping("/route-metrics")
    public ResponseEntity<Map<String, Object>> getRouteMetrics(@RequestParam String algorithm) {
        Map<String, Object> metrics = routeService.getRouteMetrics(algorithm);
        return ResponseEntity.ok(metrics);
    }

    // Helper methods for route generation
    private Map<String, Object> generateRoute(String startPoint, String endPoint, String algorithm, String color) {
        Map<String, Object> route = new HashMap<>();
        route.put("algorithm", algorithm);
        route.put("startPoint", startPoint);
        route.put("endPoint", endPoint);
        route.put("distance", calculateDistance(startPoint, endPoint));
        route.put("estimatedDuration", calculateDuration(startPoint, endPoint));
        route.put("trafficDensity", random.nextDouble());
        route.put("energyConsumption", calculateEnergyConsumption(startPoint, endPoint));
        route.put("estimatedCost", calculateCost(startPoint, endPoint));
        route.put("status", "PLANNED");
        route.put("color", color);
        route.put("createdAt", new Date());
        route.put("isAlternative", true);
        
        // Add algorithm-specific optimizations
        if (algorithm.contains("Traffic")) {
            route.put("trafficAvoidance", "High");
            route.put("realTimeUpdates", true);
        } else if (algorithm.contains("Energy")) {
            route.put("energyOptimization", "Maximum");
            route.put("ecoMode", true);
        } else if (algorithm.contains("Time")) {
            route.put("timeOptimization", "Priority");
            route.put("speedOptimized", true);
        }
        
        return route;
    }

    private Map<String, Object> generateAlternativeRoute(String startPoint, String endPoint, String algorithm, String color) {
        Map<String, Object> route = generateRoute(startPoint, endPoint, algorithm, color);
        
        // Add alternative-specific features
        switch (algorithm) {
            case "A*-Traffic-Aware":
                route.put("trafficPrediction", "Real-time AI analysis");
                route.put("dynamicRerouting", true);
                break;
            case "Greedy-Energy-Optimized":
                route.put("energySaving", "Maximum efficiency");
                route.put("regenerativeBraking", true);
                break;
            case "Time-Optimized":
                route.put("timeSaving", "Fastest possible");
                route.put("expressLanes", true);
                break;
            case "Cost-Effective":
                route.put("costSaving", "Minimum expense");
                route.put("tollAvoidance", true);
                break;
            case "Scenic-Route":
                route.put("scenicViews", "Beautiful landscapes");
                route.put("touristSpots", true);
                break;
            case "Avoid-Highways":
                route.put("highwayAvoidance", "Local roads only");
                route.put("cityDriving", true);
                break;
        }
        
        return route;
    }

    private double calculateDistance(String start, String end) {
        // Simulate distance calculation based on city pairs
        return random.nextDouble() * 100 + 50;
    }

    private int calculateDuration(String start, String end) {
        // Simulate duration calculation
        return random.nextInt(120) + 30;
    }

    private double calculateEnergyConsumption(String start, String end) {
        return random.nextDouble() * 20 + 10;
    }

    private double calculateCost(String start, String end) {
        return random.nextDouble() * 500 + 100;
    }

    private double calculateMultiStopDistance(String start, String end, List<String> waypoints) {
        return calculateDistance(start, end) + (waypoints.size() * 20);
    }

    private int calculateMultiStopDuration(String start, String end, List<String> waypoints) {
        return calculateDuration(start, end) + (waypoints.size() * 15);
    }

    private double calculateMultiStopCost(String start, String end, List<String> waypoints) {
        return calculateCost(start, end) + (waypoints.size() * 50);
    }
}
