package com.skillsync.cooking_edition.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "learning_plan_templates")
public class LearningPlanTemplate {
    @Id
    private String id;
    private String title;
    private String description;
    private String category; // e.g., "CUISINE", "COOKING_STYLE", "SPECIFIC_SKILL"
    private List<Subject> subjects;
    private int estimatedDurationDays;
    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED
    
    @Data
    public static class Subject {
        private String name;
        private String description;
        private List<String> materials;
        private List<String> prerequisites;
    }
} 