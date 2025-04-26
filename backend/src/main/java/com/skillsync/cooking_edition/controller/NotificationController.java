package com.skillsync.cooking_edition.controller;

import com.skillsync.cooking_edition.model.Notification;
import com.skillsync.cooking_edition.service.InteractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private InteractionService interactionService;

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = principal.getName();
        List<Notification> notifications = interactionService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = principal.getName();
        List<Notification> notifications = interactionService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(
            @PathVariable String notificationId,
            @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = principal.getName();
        interactionService.markNotificationAsRead(notificationId, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = principal.getName();
        List<Notification> unreadNotifications = interactionService.getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            interactionService.markNotificationAsRead(notification.getId(), userId);
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String notificationId, @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = principal.getName();
        Notification notification = interactionService.getNotificationById(notificationId);
        if (notification == null || !notification.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        interactionService.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }
} 