package com.example.fleetmanagement.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.fleetmanagement.repository.UserRepository;
import com.example.fleetmanagement.repository.VehicleRepository;
import com.example.fleetmanagement.repository.TripRepository;
import com.example.fleetmanagement.model.Trip;
import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;

    public AdminController(UserRepository userRepository, VehicleRepository vehicleRepository, TripRepository tripRepository) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.tripRepository = tripRepository;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> adminDashboard() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalUsers", userRepository.count());
        
        List<Trip> currentTrips = tripRepository.findAll();
        long bookings = currentTrips.size();
        double revenue = currentTrips.stream()
            .mapToDouble(trip -> trip.getEstimatedCost() != null ? trip.getEstimatedCost() : 0.0)
            .sum();
            
        metrics.put("totalBookings", bookings);
        metrics.put("totalVehicles", vehicleRepository.count());
        metrics.put("revenue", revenue);
        return metrics;
    }
}