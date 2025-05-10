package com.skillsync.cooking_edition.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    private String title;
    private String description;
    private String content;
    
    @Field("mediaUrls")
    private List<String> mediaUrls = new ArrayList<>(); // List of URLs for images or video
    
    private String mediaType; // "video" or "image"
    private Integer videoDuration; // Duration in seconds for videos
    
    @Field("ingredients")
    private List<String> ingredients = new ArrayList<>();
    
    @Field("amounts")
    private List<String> amounts = new ArrayList<>(); // Amounts for ingredients
    
    @Field("instructions")
    private List<String> instructions = new ArrayList<>();
    
    private Integer cookingTime = 0; // Cooking time in minutes
    private Integer servings = 0; // Number of servings
    private String userId;
    private String userName;
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer likes = 0;
    private Integer comments = 0;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls != null ? mediaUrls : new ArrayList<>();
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public Integer getVideoDuration() {
        return videoDuration;
    }

    public void setVideoDuration(Integer videoDuration) {
        this.videoDuration = videoDuration;
    }

    public List<String> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<String> ingredients) {
        this.ingredients = ingredients != null ? ingredients : new ArrayList<>();
    }

    public List<String> getAmounts() {
        return amounts;
    }

    public void setAmounts(List<String> amounts) {
        this.amounts = amounts != null ? amounts : new ArrayList<>();
    }

    public List<String> getInstructions() {
        return instructions;
    }

    public void setInstructions(List<String> instructions) {
        this.instructions = instructions != null ? instructions : new ArrayList<>();
    }

    public Integer getCookingTime() {
        return cookingTime;
    }

    public void setCookingTime(Integer cookingTime) {
        this.cookingTime = cookingTime != null ? cookingTime : 0;
    }

    public Integer getServings() {
        return servings;
    }

    public void setServings(Integer servings) {
        this.servings = servings != null ? servings : 0;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getLikes() {
        return likes;
    }

    public void setLikes(Integer likes) {
        this.likes = likes != null ? likes : 0;
    }

    public Integer getComments() {
        return comments;
    }

    public void setComments(Integer comments) {
        this.comments = comments != null ? comments : 0;
    }
} 