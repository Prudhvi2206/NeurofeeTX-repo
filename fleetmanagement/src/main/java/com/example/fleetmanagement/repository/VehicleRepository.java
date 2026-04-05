package com.example.fleetmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.fleetmanagement.model.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
}

