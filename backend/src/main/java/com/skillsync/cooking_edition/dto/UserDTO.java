package com.skillsync.cooking_edition.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String bio;
    private List<String> specialties;
    private List<String> favoriteRecipes;
    private boolean isPrivate;
    private List<String> following;
    private String role;
    private String profileImageUrl;
} 