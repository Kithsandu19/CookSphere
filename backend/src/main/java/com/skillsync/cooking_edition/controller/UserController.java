package com.skillsync.cooking_edition.controller;

import com.skillsync.cooking_edition.dto.ProfileUpdateRequest;
import com.skillsync.cooking_edition.dto.UserDTO;
import com.skillsync.cooking_edition.model.User;
import com.skillsync.cooking_edition.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        try {
            logger.info("Getting user with id: {}", id);
            User user = userService.getUserById(id);
            UserDTO userDTO = convertToDTO(user);
            return ResponseEntity.ok(userDTO);
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
            if (userService.existsById(id)) {
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
                userService.save(user);
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

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest profileUpdateRequest, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthorized update attempt to profile endpoint");
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            String userId = authentication.getName();
            if (!userId.equals(profileUpdateRequest.getId())) {
                logger.warn("User {} attempted to update profile of user {}", userId, profileUpdateRequest.getId());
                return ResponseEntity.status(403).body(Map.of("message", "Not authorized to update this profile"));
            }

            logger.info("Updating profile for user: {}", userId);
            
            User updatedUser = new User();
            updatedUser.setId(userId);
            updatedUser.setName(profileUpdateRequest.getName());
            updatedUser.setBio(profileUpdateRequest.getBio());
            updatedUser.setSpecialties(profileUpdateRequest.getSpecialties());
            updatedUser.setFavoriteRecipes(profileUpdateRequest.getFavoriteRecipes());
            updatedUser.setPrivate(profileUpdateRequest.isPrivate());

            User savedUser = userService.updateProfile(userId, updatedUser);
            UserDTO userDTO = convertToDTO(savedUser);
            
            logger.info("Successfully updated profile for user: {}", userId);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            logger.error("Error updating profile: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to update profile: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthorized access attempt to profile endpoint");
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            String userId = authentication.getName();
            logger.info("Fetching profile for user: {}", userId);
            
            User user = userService.getUserById(userId);
            if (user == null) {
                logger.warn("User not found: {}", userId);
                return ResponseEntity.notFound().build();
            }
            
            UserDTO userDTO = convertToDTO(user);
            logger.info("Successfully fetched profile for user: {}", userId);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            logger.error("Error fetching profile: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setBio(user.getBio());
        dto.setSpecialties(user.getSpecialties());
        dto.setFavoriteRecipes(user.getFavoriteRecipes());
        dto.setPrivate(user.isPrivate());
        dto.setFollowing(user.getFollowing());
        dto.setRole(user.getRole());
        return dto;
    }
} 