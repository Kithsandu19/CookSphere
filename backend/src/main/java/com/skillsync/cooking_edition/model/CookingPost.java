package com.skillsync.cooking_edition.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "cooking_posts")
public class CookingPost {
    @Id
    private String id;
    private String userId;
    private String title;
    private String description;
    private List<String> ingredients;
    private List<String> instructions;
    private List<String> mediaUrls; // Max 3 photos or 1 video (30s)
    private String category;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}