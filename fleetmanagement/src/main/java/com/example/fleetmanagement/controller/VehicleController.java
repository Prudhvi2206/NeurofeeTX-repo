package com.example.fleetmanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.fleetmanagement.model.Vehicle;
import com.example.fleetmanagement.model.VehicleStatus;
import com.example.fleetmanagement.repository.VehicleRepository;

@RestController
@RequestMapping("/vehicles")
@CrossOrigin(origins = "http://localhost:5173")
public class VehicleController {

    private final VehicleRepository vehicleRepository;

    public VehicleController(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping
    public List<Vehicle> list() {
        return vehicleRepository.findAll();
    }

    @PostMapping
    public Vehicle create(@RequestBody Vehicle vehicle) {
        if (vehicle.getStatus() == null) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }
        return vehicleRepository.save(vehicle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable Long id, @RequestBody Vehicle payload) {
        return vehicleRepository.findById(id)
                .map(existing -> {
                    existing.setName(payload.getName());
                    existing.setRegistration(payload.getRegistration());
                    existing.setType(payload.getType());
                    existing.setStatus(payload.getStatus() == null ? VehicleStatus.AVAILABLE : payload.getStatus());
                    return ResponseEntity.ok(vehicleRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!vehicleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        vehicleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public List<Vehicle> getVehiclesByStatus(@PathVariable VehicleStatus status) {
        return vehicleRepository.findAll().stream()
                .filter(v -> v.getStatus() == status)
                .toList();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Vehicle> updateVehicleStatus(@PathVariable Long id, @RequestBody VehicleStatus status) {
        return vehicleRepository.findById(id)
                .map(vehicle -> {
                    vehicle.setStatus(status);
                    return ResponseEntity.ok(vehicleRepository.save(vehicle));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
