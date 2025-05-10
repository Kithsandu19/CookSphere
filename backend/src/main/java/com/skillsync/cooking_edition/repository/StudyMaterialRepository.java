package com.skillsync.cooking_edition.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.skillsync.cooking_edition.model.StudyMaterial;

public interface StudyMaterialRepository extends MongoRepository<StudyMaterial, String> {
    List<StudyMaterial> findByUserId(String userId);
    List<StudyMaterial> findAllByOrderByCreatedAtDesc();
}