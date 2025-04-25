package com.skillsync.cooking_edition.controller;

import com.skillsync.cooking_edition.model.*;
import com.skillsync.cooking_edition.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interactions")
public class InteractionController {

    private static final Logger logger = LoggerFactory.getLogger(InteractionController.class);

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/posts/{postId}/likes")
    public ResponseEntity<?> toggleLike(
            @PathVariable String postId,
            @RequestParam String userId) {
        try {
            logger.info("Received like request - postId: {}, userId: {}", postId, userId);
            
            // Find post
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> {
                        logger.error("Post not found with id: {}", postId);
                        return new RuntimeException("Post not found: " + postId);
                    });
            logger.info("Found post: {}", post.getId());
            
            // Find user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.error("User not found with id: {}", userId);
                        return new RuntimeException("User not found: " + userId);
                    });
            logger.info("Found user: {}", user.getId());
            
            // Check if like exists
            Like existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
            logger.info("Existing like found: {}", existingLike != null);
            
            if (existingLike != null) {
                // Unlike
                logger.info("Removing like for post: {} and user: {}", postId, userId);
                likeRepository.delete(existingLike);
                post.setLikes(post.getLikes() - 1);
            } else {
                // Like
                logger.info("Adding like for post: {} and user: {}", postId, userId);
                Like like = new Like();
                like.setPostId(postId);
                like.setUserId(userId);
                likeRepository.save(like);
                post.setLikes(post.getLikes() + 1);

                // Create notification for post owner
                if (!post.getUserId().equals(userId)) { // Don't notify if user liked their own post
                    Notification notification = new Notification();
                    notification.setUserId(post.getUserId());
                    notification.setSenderId(userId);
                    notification.setSenderName(user.getName());
                    notification.setMessage(user.getName() + " liked your post");
                    notification.setType(Notification.NotificationType.LIKE);
                    notification.setRelatedPostId(postId);
                    notification.setCreatedAt(LocalDateTime.now());
                    notification.setRead(false);
                    notificationRepository.save(notification);
                    logger.info("Created notification for post owner: {}", post.getUserId());
                }
            }

            // Save updated post
            postRepository.save(post);
            logger.info("Successfully saved post with updated like count: {}", post.getLikes());
            
            // Return success response with updated like count
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("liked", existingLike == null);
            response.put("likeCount", post.getLikes());
            
            logger.info("Sending response: {}", response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error toggling like for post: {} and user: {}", postId, userId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<Comment> addComment(
            @PathVariable String postId,
            @RequestParam String userId,
            @RequestParam String userName,
            @RequestParam(required = false) String userPicture,
            @RequestBody Map<String, String> requestBody) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setUserName(userName);
        comment.setUserPicture(userPicture);
        comment.setContent(requestBody.get("content"));
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        Comment savedComment = commentRepository.save(comment);

        // Update post comment count
        post.setComments(post.getComments() + 1);
        postRepository.save(post);

        // Create notification
        Notification notification = new Notification();
        notification.setUserId(post.getUserId());
        notification.setSenderId(userId);
        notification.setSenderName(userName);
        notification.setMessage(userName + " commented on your post");
        notification.setType(Notification.NotificationType.COMMENT);
        notification.setRelatedPostId(postId);
        notification.setRelatedCommentId(savedComment.getId());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        notificationRepository.save(notification);

        return ResponseEntity.ok(savedComment);
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable String postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/users/{userId}/notifications")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/users/{userId}/notifications/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(
            @PathVariable String notificationId,
            @RequestParam String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            return ResponseEntity.badRequest().build();
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody Map<String, String> requestBody) {
        try {
            System.out.println("Updating comment: " + commentId + " for post: " + postId);
            System.out.println("Request body: " + requestBody);

            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("Comment not found"));

            if (!comment.getPostId().equals(postId)) {
                System.out.println("Comment post ID mismatch");
                return ResponseEntity.badRequest().build();
            }

            String newContent = requestBody.get("content");
            if (newContent == null || newContent.trim().isEmpty()) {
                System.out.println("Empty content provided");
                return ResponseEntity.badRequest().build();
            }

            comment.setContent(newContent);
            comment.setUpdatedAt(LocalDateTime.now());
            Comment updatedComment = commentRepository.save(comment);
            
            System.out.println("Comment updated successfully: " + updatedComment);
            return ResponseEntity.ok(updatedComment);
        } catch (Exception e) {
            System.out.println("Error updating comment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getPostId().equals(postId)) {
            return ResponseEntity.badRequest().build();
        }

        // Update post comment count
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setComments(post.getComments() - 1);
        postRepository.save(post);

        commentRepository.deleteById(commentId);
        return ResponseEntity.ok().build();
    }
} 