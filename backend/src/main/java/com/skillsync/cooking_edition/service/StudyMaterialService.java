package com.skillsync.cooking_edition.service;

import com.skillsync.cooking_edition.model.StudyMaterial;
import com.skillsync.cooking_edition.repository.StudyMaterialRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class StudyMaterialService {
    private static final Logger logger = LoggerFactory.getLogger(StudyMaterialService.class);

    @Autowired
    private StudyMaterialRepository studyMaterialRepository;

    public StudyMaterial save(StudyMaterial studyMaterial) {
        logger.info("Saving study material with title: {}", studyMaterial.getTitle());
        return studyMaterialRepository.save(studyMaterial);
    }

    public List<StudyMaterial> findByUserId(String userId) {
        logger.info("Fetching study materials for user: {}", userId);
        return studyMaterialRepository.findByUserId(userId);
    }

    public List<StudyMaterial> findAllByOrderByCreatedAtDesc() {
        logger.info("Fetching all study materials ordered by creation date");
        return studyMaterialRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<StudyMaterial> findById(String id) {
        logger.info("Fetching study material by ID: {}", id);
        return studyMaterialRepository.findById(id);
    }

    public void delete(StudyMaterial studyMaterial) {
        logger.info("Deleting study material with ID: {}", studyMaterial.getId());
        studyMaterialRepository.delete(studyMaterial);
    }
}