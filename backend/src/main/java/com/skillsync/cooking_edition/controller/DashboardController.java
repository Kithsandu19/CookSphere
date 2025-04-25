package com.skillsync.cooking_edition.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillsync.cooking_edition.repository.PostRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
public class DashboardController {

    @Autowired
    private PostRepository postRepository;

    @GetMapping("/api/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        Map<String, Object> dashboardData = new HashMap<>();
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String name = oauth2User.getAttribute("name");
            String email = oauth2User.getAttribute("email");
            String userId = oauth2User.getName();
            
            // Add user info
            Map<String, String> userInfo = new HashMap<>();
            userInfo.put("name", name);
            userInfo.put("email", email);
            userInfo.put("id", userId);
            dashboardData.put("user", userInfo);
            
            // Add statistics
            Map<String, Object> statistics = new HashMap<>();
            long postCount = postRepository.findByUserId(userId).size();
            statistics.put("postCount", postCount);
            
            int totalLikes = postRepository.findByUserId(userId).stream()
                .mapToInt(post -> post.getLikes())
                .sum();
            statistics.put("totalLikes", totalLikes);
            
            dashboardData.put("statistics", statistics);
            
            return ResponseEntity.ok(dashboardData);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
        }
    }
} 