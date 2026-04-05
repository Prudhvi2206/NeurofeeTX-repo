package com.example.fleetmanagement.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/manager")
public class ManagerController {

    @GetMapping("/dashboard")
    public Map<String, Object> managerDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("Active Vehicles", 5);
        data.put("Drivers Available", 3);
        data.put("Trips Today", 10);
        return data;
    }
}