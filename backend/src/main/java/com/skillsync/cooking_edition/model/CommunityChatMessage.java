package com.skillsync.cooking_edition.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "community_chat_messages")
public class CommunityChatMessage {
    @Id
    private String id;
    private String message;
    private String userId;
    private String userName;
    private LocalDateTime createdAt;
    private String userPicture;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getUserPicture() { return userPicture; }
    public void setUserPicture(String userPicture) { this.userPicture = userPicture; }
} 