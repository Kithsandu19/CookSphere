package com.skillsync.cooking_edition.repository;

import com.skillsync.cooking_edition.model.LearningPlanTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LearningPlanTemplateRepository extends MongoRepository<LearningPlanTemplate, String> {
} 