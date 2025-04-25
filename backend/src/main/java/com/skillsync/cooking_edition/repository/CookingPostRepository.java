package com.skillsync.cooking_edition.repository;

import com.skillsync.cooking_edition.model.CookingPost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CookingPostRepository extends MongoRepository<CookingPost, String> {
    List<CookingPost> findByUserId(String userId);
    List<CookingPost> findByCategory(String category);
}