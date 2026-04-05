package com.example.fleetmanagement.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/customer")
public class CustomerController {

    @GetMapping("/dashboard")
    public Map<String, Object> customerDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("myBookings", 2);
        data.put("bookingHistory", 5);
        data.put("paymentStatus", "Paid");
        return data;
    }
}