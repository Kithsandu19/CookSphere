package com.skillsync.cooking_edition.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.skillsync.cooking_edition.model.Post;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByUserId(String userId);
    List<Post> findAllByOrderByCreatedAtDesc();
} 