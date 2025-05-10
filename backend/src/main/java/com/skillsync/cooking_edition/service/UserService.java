package com.skillsync.cooking_edition.service;

import com.skillsync.cooking_edition.model.User;
import com.skillsync.cooking_edition.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    public boolean existsById(String id) {
        return userRepository.existsById(id);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public User updateProfile(String userId, User updatedUser) {
        User existingUser = getUserById(userId);
        
        // Update only the provided fields
        // Name cannot be updated
        if (updatedUser.getBio() != null) {
            existingUser.setBio(updatedUser.getBio());
        }
        if (updatedUser.getSpecialties() != null) {
            existingUser.setSpecialties(updatedUser.getSpecialties());
        }
        if (updatedUser.getFavoriteRecipes() != null) {
            existingUser.setFavoriteRecipes(updatedUser.getFavoriteRecipes());
        }
        // Always update isPrivate as it's a boolean
        existingUser.setPrivate(updatedUser.isPrivate());
        if (updatedUser.getProfileImageUrl() != null) {
            existingUser.setProfileImageUrl(updatedUser.getProfileImageUrl());
        }
        
        try {
            return userRepository.save(existingUser);
        } catch (Exception e) {
            logger.error("Error saving updated user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save user profile: " + e.getMessage());
        }
    }

    public List<User> getFollowing(String userId) {
        User user = getUserById(userId);
        return userRepository.findAllById(user.getFollowing());
    }

    public User getProfile(String userId) {
        User user = getUserById(userId);
        if (user == null) {
            throw new RuntimeException("User profile not found");
        }
        return user;
    }
} 