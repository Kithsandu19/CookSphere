package com.skillsync.cooking_edition.controller;

import com.skillsync.cooking_edition.model.User;
import com.skillsync.cooking_edition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        try {
            logger.info("Getting user with id: {}", id);
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found: " + id));
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting user: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> userData) {
        try {
            String id = userData.get("id");
            String name = userData.get("name");
            String email = userData.get("email");
            
            logger.info("Creating user with data - id: {}, name: {}, email: {}", id, name, email);
            
            if (id == null || id.isEmpty()) {
                logger.error("User ID is missing");
                return ResponseEntity.badRequest().body(Map.of("message", "User ID is required"));
            }
            
            if (name == null || name.isEmpty()) {
                logger.error("User name is missing");
                return ResponseEntity.badRequest().body(Map.of("message", "User name is required"));
            }
            
            if (email == null || email.isEmpty()) {
                logger.error("User email is missing");
                return ResponseEntity.badRequest().body(Map.of("message", "User email is required"));
            }
            
            // Check if user already exists
            if (userRepository.existsById(id)) {
                logger.info("User already exists: {}", id);
                return ResponseEntity.ok(Map.of("message", "User already exists"));
            }
            
            // Create new user
            User user = new User();
            user.setId(id);
            user.setName(name);
            user.setEmail(email);
            user.setRole("USER");
            // Initialize following list as empty
            user.setFollowing(java.util.Collections.emptyList());
            
            try {
                userRepository.save(user);
                logger.info("User created successfully: {}", user.getId());
                
                return ResponseEntity.ok(Map.of(
                    "message", "User created successfully",
                    "id", user.getId(),
                    "name", user.getName()
                ));
            } catch (Exception saveError) {
                logger.error("Error saving user to database: {}", saveError.getMessage(), saveError);
                return ResponseEntity.badRequest().body(Map.of("message", "Database error: " + saveError.getMessage()));
            }
        } catch (Exception e) {
            logger.error("Error creating user: {}", userData.get("id"), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to create user: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 