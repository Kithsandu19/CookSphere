package com.skillsync.cooking_edition.controller;

import com.skillsync.cooking_edition.service.InteractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts/{postId}/likes")
public class LikeController {

    @Autowired
    private InteractionService interactionService;

    @PostMapping("/toggle")
    public ResponseEntity<Void> toggleLike(
            @PathVariable String postId,
            @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = principal.getName();
        interactionService.toggleLike(postId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkLikeStatus(
            @PathVariable String postId,
            @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = principal.getName();
        boolean isLiked = interactionService.isLiked(postId, userId);
        return ResponseEntity.ok(Map.of("liked", isLiked));
    }
} 