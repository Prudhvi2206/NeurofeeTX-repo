package com.example.fleetmanagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.fleetmanagement.model.Trip;
import com.example.fleetmanagement.repository.TripRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:5173")
public class TripController {

    @Autowired
    private TripRepository tripRepository;

    @PostMapping
    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip) {
        if (trip.getStatus() == null) trip.setStatus("PENDING");
        Trip saved = tripRepository.save(trip);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips() {
        return ResponseEntity.ok(tripRepository.findAll());
    }

    @GetMapping("/customer/{id}")
    public ResponseEntity<List<Trip>> getCustomerTrips(@PathVariable Long id) {
        return ResponseEntity.ok(tripRepository.findByCustomerId(id));
    }

    @GetMapping("/driver/{id}")
    public ResponseEntity<List<Trip>> getDriverTrips(@PathVariable Long id) {
        return ResponseEntity.ok(tripRepository.findByDriverId(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTripStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<Trip> tripOpt = tripRepository.findById(id);
        if (tripOpt.isPresent()) {
            Trip trip = tripOpt.get();
            trip.setStatus(status);
            tripRepository.save(trip);
            return ResponseEntity.ok(trip);
        }
        return ResponseEntity.notFound().build();
    }
}
