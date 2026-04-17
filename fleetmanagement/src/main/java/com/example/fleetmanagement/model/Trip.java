package com.example.fleetmanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;
    private Long driverId;
    private Long vehicleId;

    private String pickupLocation;
    private String dropoffLocation;
    
    private Double distanceKm;
    private Double estimatedCost;
    
    // Status: PENDING, ACTIVE, COMPLETED, CANCELLED
    private String status;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Trip() {}

    public Trip(Long customerId, Long driverId, Long vehicleId, String pickupLocation, String dropoffLocation, Double distanceKm, Double estimatedCost, String status) {
        this.customerId = customerId;
        this.driverId = driverId;
        this.vehicleId = vehicleId;
        this.pickupLocation = pickupLocation;
        this.dropoffLocation = dropoffLocation;
        this.distanceKm = distanceKm;
        this.estimatedCost = estimatedCost;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getDropoffLocation() { return dropoffLocation; }
    public void setDropoffLocation(String dropoffLocation) { this.dropoffLocation = dropoffLocation; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public Double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
