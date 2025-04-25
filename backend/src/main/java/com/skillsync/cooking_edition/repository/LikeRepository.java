package com.skillsync.cooking_edition.repository;

import com.skillsync.cooking_edition.model.Like;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LikeRepository extends MongoRepository<Like, String> {
    Like findByPostIdAndUserId(String postId, String userId);
} 