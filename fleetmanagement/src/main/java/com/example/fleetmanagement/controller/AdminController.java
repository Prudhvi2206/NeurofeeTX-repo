package com.example.fleetmanagement.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.fleetmanagement.repository.UserRepository;
import com.example.fleetmanagement.repository.VehicleRepository;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    public AdminController(UserRepository userRepository, VehicleRepository vehicleRepository) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> adminDashboard() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalUsers", userRepository.count());
        // For now, bookings and revenue are placeholders; wire to real tables later
        metrics.put("totalBookings", 12);
        metrics.put("totalVehicles", vehicleRepository.count());
        metrics.put("revenue", 45000);
        return metrics;
    }
}