package com.skillsync.cooking_edition.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProfileUpdateRequest {
    private String id;
    private String name;
    private String bio;
    private List<String> specialties;
    private List<String> favoriteRecipes;
    private boolean isPrivate;
    private String profileImageUrl;
} 