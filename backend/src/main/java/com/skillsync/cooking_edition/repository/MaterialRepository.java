package com.skillsync.cooking_edition.repository;

import com.skillsync.cooking_edition.model.Material;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MaterialRepository extends MongoRepository<Material, String> {
    List<Material> findByUserId(String userId);
    List<Material> findByCategory(String category);
    List<Material> findByDifficultyLevel(String difficultyLevel);
    List<Material> findAllByOrderByCreatedAtDesc();
} 