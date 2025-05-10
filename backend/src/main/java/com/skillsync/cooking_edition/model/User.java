package com.skillsync.cooking_edition.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String name;
    private String bio;
    private List<String> specialties;
    private List<String> favoriteRecipes;
    private boolean isPrivate;
    private List<String> following;
    private String role; // "USER" or "ADMIN"
    private String profileImageUrl;
}