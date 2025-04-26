package com.skillsync.cooking_edition.controller;

import com.skillsync.cooking_edition.model.CommunityChatMessage;
import com.skillsync.cooking_edition.repository.CommunityChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community-chat")
public class CommunityChatController {

    @Autowired
    private CommunityChatRepository chatRepository;

    @GetMapping
    public ResponseEntity<List<CommunityChatMessage>> getAllMessages() {
        List<CommunityChatMessage> messages = chatRepository.findAllByOrderByCreatedAtAsc();
        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<?> postMessage(@RequestParam String message) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String userId = oauth2User.getName();
            String userName = oauth2User.getAttribute("name");
            String userPicture = oauth2User.getAttribute("picture");

            CommunityChatMessage chatMessage = new CommunityChatMessage();
            chatMessage.setMessage(message);
            chatMessage.setUserId(userId);
            chatMessage.setUserName(userName);
            chatMessage.setUserPicture(userPicture);
            chatMessage.setCreatedAt(LocalDateTime.now());

            CommunityChatMessage saved = chatRepository.save(chatMessage);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.status(401).body("Unauthorized");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editMessage(@PathVariable String id, @RequestBody Map<String, String> body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String userId = oauth2User.getName();
        CommunityChatMessage message = chatRepository.findById(id).orElse(null);
        if (message == null) return ResponseEntity.notFound().build();
        if (!message.getUserId().equals(userId)) return ResponseEntity.status(403).body("Forbidden");
        String newMessage = body.get("message");
        if (newMessage == null || newMessage.trim().isEmpty()) return ResponseEntity.badRequest().body("Message cannot be empty");
        message.setMessage(newMessage);
        chatRepository.save(message);
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String userId = oauth2User.getName();
        CommunityChatMessage message = chatRepository.findById(id).orElse(null);
        if (message == null) return ResponseEntity.notFound().build();
        if (!message.getUserId().equals(userId)) return ResponseEntity.status(403).body("Forbidden");
        chatRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
} 