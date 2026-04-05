package com.example.fleetmanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:5173")
public class TestController {

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Backend is running!");
    }

    @GetMapping("/time")
    public ResponseEntity<String> getTime() {
        return ResponseEntity.ok("Current time: " + new java.util.Date().toString());
    }
}
