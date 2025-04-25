package com.skillsync.cooking_edition.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId;
    private String senderId;
    private String senderName;
    private String message;
    private NotificationType type;
    private String relatedPostId;
    private String relatedCommentId;
    private boolean isRead;
    private LocalDateTime createdAt;

    public enum NotificationType {
        LIKE, COMMENT, REPLY
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getRelatedPostId() {
        return relatedPostId;
    }

    public void setRelatedPostId(String relatedPostId) {
        this.relatedPostId = relatedPostId;
    }

    public String getRelatedCommentId() {
        return relatedCommentId;
    }

    public void setRelatedCommentId(String relatedCommentId) {
        this.relatedCommentId = relatedCommentId;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 