package com.example.fleetmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.fleetmanagement.model.Trip;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByCustomerId(Long customerId);
    List<Trip> findByDriverId(Long driverId);
    List<Trip> findByStatus(String status);
}
