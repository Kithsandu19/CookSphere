package com.skillsync.cooking_edition.controller;

import com.skillsync.cooking_edition.model.Comment;
import com.skillsync.cooking_edition.service.InteractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    @Autowired
    private InteractionService interactionService;

    @GetMapping
    public ResponseEntity<List<Comment>> getComments(@PathVariable String postId) {
        List<Comment> comments = interactionService.getComments(postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<Comment> addComment(
            @PathVariable String postId,
            @RequestBody Comment comment,
            @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = principal.getName();
        Comment savedComment = interactionService.addComment(postId, userId, comment.getContent());
        return ResponseEntity.ok(savedComment);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal OAuth2User principal) {
        try {
            String content = request.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            Comment comment = interactionService.getCommentById(commentId);
            if (comment == null || !comment.getPostId().equals(postId)) {
                return ResponseEntity.badRequest().build();
            }
            
            // If user is authenticated, verify ownership
            if (principal != null) {
                String userId = principal.getName();
                if (!comment.getUserId().equals(userId)) {
                    return ResponseEntity.badRequest().build();
                }
            }
            
            comment.setContent(content);
            comment.setUpdatedAt(java.time.LocalDateTime.now());
            Comment updatedComment = interactionService.updateComment(comment);
            return ResponseEntity.ok(updatedComment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = principal.getName();
        // Verify that the comment belongs to the user or the post belongs to the user
        Comment comment = interactionService.getCommentById(commentId);
        if (comment == null) {
            return ResponseEntity.notFound().build();
        }
        if (!comment.getUserId().equals(userId) && !comment.getPostId().equals(userId)) {
            return ResponseEntity.badRequest().build();
        }
        interactionService.deleteComment(commentId);
        return ResponseEntity.ok().build();
    }
}