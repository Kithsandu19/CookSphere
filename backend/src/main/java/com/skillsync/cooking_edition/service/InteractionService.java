package com.skillsync.cooking_edition.service;

import com.skillsync.cooking_edition.model.*;
import com.skillsync.cooking_edition.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InteractionService {

    private static final Logger logger = LoggerFactory.getLogger(InteractionService.class);

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public void toggleLike(String postId, String userId) {
        try {
            logger.info("Service: Toggling like for post: {} and user: {}", postId, userId);
            
            // Find post
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found: " + postId));
            
            // Find user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            
            // Check if like exists
            Like existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
            
            if (existingLike != null) {
                // Unlike
                logger.info("Service: Removing like for post: {} and user: {}", postId, userId);
                likeRepository.delete(existingLike);
                post.setLikes(post.getLikes() - 1);
            } else {
                // Like
                logger.info("Service: Adding like for post: {} and user: {}", postId, userId);
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
                    logger.info("Service: Created notification for post owner: {}", post.getUserId());
                }
            }

            // Save updated post
            postRepository.save(post);
            logger.info("Service: Successfully toggled like for post: {} and user: {}", postId, userId);
        } catch (Exception e) {
            logger.error("Service: Error toggling like for post: {} and user: {}", postId, userId, e);
            throw e; // Re-throw to be handled by the controller
        }
    }

    public boolean isLiked(String postId, String userId) {
        return likeRepository.findByPostIdAndUserId(postId, userId) != null;
    }

    public Comment addComment(String postId, String userId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setUserName(user.getName());
        comment.setContent(content);
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
        notification.setSenderName(user.getName());
        notification.setMessage(user.getName() + " commented on your post");
        notification.setType(Notification.NotificationType.COMMENT);
        notification.setRelatedPostId(postId);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        notificationRepository.save(notification);

        return savedComment;
    }

    public List<Comment> getComments(String postId) {
        return commentRepository.findByPostId(postId);
    }

    public Comment getCommentById(String commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
    }

    public Comment updateComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public void deleteComment(String commentId) {
        Comment comment = getCommentById(commentId);
        Post post = postRepository.findById(comment.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Update post comment count
        post.setComments(post.getComments() - 1);
        postRepository.save(post);
        
        commentRepository.deleteById(commentId);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    public void markNotificationAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public Notification getNotificationById(String notificationId) {
        return notificationRepository.findById(notificationId).orElse(null);
    }

    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }
} 