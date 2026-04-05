package com.example.fleetmanagement.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/driver")
public class DriverController {

    @GetMapping("/dashboard")
    public Map<String, Object> driverDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("Assigned Trips", 3);
        data.put("Trip Status", "On duty");
        data.put("EarningsDay", 800);
        data.put("EarningsWeek", 5600);
        data.put("EarningsMonth", 22000);
        return data;
    }

    @GetMapping("/assigned-vehicle")
    public Map<String, Object> assignedVehicle() {
        Map<String, Object> v = new HashMap<>();
        v.put("name", "EV-12 Urban Shuttle");
        v.put("registration", "TS09 AB 1234");
        v.put("type", "EV");
        v.put("status", "IN_USE");
        v.put("batteryPercent", 76);
        v.put("lastServiceKm", 42000);
        v.put("nextServiceKm", 45000);
        return v;
    }
}