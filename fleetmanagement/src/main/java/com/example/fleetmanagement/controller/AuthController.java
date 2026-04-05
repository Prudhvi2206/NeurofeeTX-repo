package com.example.fleetmanagement.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.fleetmanagement.model.Role;
import com.example.fleetmanagement.model.User;
import com.example.fleetmanagement.repository.UserRepository;
import com.example.fleetmanagement.security.JwtUtil;
import com.example.fleetmanagement.security.PasswordEncoder;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User registrationRequest) {
        // Check if user already exists
        if (userRepository.findByEmail(registrationRequest.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setName(registrationRequest.getName());
        user.setEmail(registrationRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        
        // Set default role if not provided
        if (registrationRequest.getRole() == null) {
            user.setRole(Role.CUSTOMER);
        } else {
            user.setRole(registrationRequest.getRole());
        }

        // Save user
        User savedUser = userRepository.save(user);

        // Create JWT token
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", savedUser.getRole().name());

        String token = jwtUtil.generateToken(claims, savedUser.getEmail());

        // Return token + role
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", savedUser.getRole().name());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {

        Optional<User> optionalUser = userRepository.findByEmail(loginRequest.getEmail());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }

        // Create claims with role
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());

        String token = jwtUtil.generateToken(claims, user.getEmail());

        // Return token + role
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name());

        return ResponseEntity.ok(response);
    }
}
