package com.skillsync.cooking_edition.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "learning_plans")
public class LearningPlan {
    @Id
    private String id;
    private String userId;
    private String title;
    private String description;
    private List<Subject> subjects;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String progress; // e.g., "IN_PROGRESS", "COMPLETED"
    private List<Milestone> milestones;
    private Map<String, Boolean> completedItems;

    @Data
    public static class Subject {
        private String name;
        private String description;
        private List<String> materials;
        private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED
    }

    @Data
    public static class Milestone {
        private String title;
        private String description;
        private LocalDate dueDate;
        private boolean completed;
        private String type; // e.g., "COURSE_COMPLETION", "SKILL_MASTERY"
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}