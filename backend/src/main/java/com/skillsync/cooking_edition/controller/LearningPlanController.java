package com.skillsync.cooking_edition.controller;

import com.skillsync.cooking_edition.model.LearningPlan;
import com.skillsync.cooking_edition.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {

    @Autowired
    private LearningPlanRepository planRepository;

    @GetMapping
    public List<LearningPlan> getAllPlans() {
        return planRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<LearningPlan> getPlansByUser(@PathVariable String userId) {
        return planRepository.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getPlanById(@PathVariable String id) {
        return planRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public LearningPlan createPlan(@RequestBody LearningPlan plan) {
        plan.setProgress("NOT_STARTED");
        if (plan.getCompletedItems() == null) {
            plan.setCompletedItems(new HashMap<>());
        }
        
        // Initialize subject statuses
        if (plan.getSubjects() != null) {
            for (LearningPlan.Subject subject : plan.getSubjects()) {
                subject.setStatus("NOT_STARTED");
            }
        }
        
        return planRepository.save(plan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updatePlan(
            @PathVariable String id,
            @RequestBody LearningPlan plan) {
        if (!planRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        plan.setId(id);
        return ResponseEntity.ok(planRepository.save(plan));
    }
    
    @PutMapping("/{id}/progress")
    public ResponseEntity<LearningPlan> updateProgress(
            @PathVariable String id,
            @RequestBody Map<String, Object> progressData) {
        return planRepository.findById(id)
                .map(plan -> {
                    // Update completed items
                    if (progressData.containsKey("completedItems")) {
                        @SuppressWarnings("unchecked")
                        Map<String, Boolean> completedItems = (Map<String, Boolean>) progressData.get("completedItems");
                        plan.setCompletedItems(completedItems);
                    }
                    
                    // Update subject statuses
                    if (progressData.containsKey("subjectStatuses")) {
                        @SuppressWarnings("unchecked")
                        Map<String, String> subjectStatuses = (Map<String, String>) progressData.get("subjectStatuses");
                        for (int i = 0; i < plan.getSubjects().size(); i++) {
                            if (subjectStatuses.containsKey(String.valueOf(i))) {
                                plan.getSubjects().get(i).setStatus(subjectStatuses.get(String.valueOf(i)));
                            }
                        }
                    }
                    
                    // Update milestone completion
                    if (progressData.containsKey("milestoneCompletions")) {
                        @SuppressWarnings("unchecked")
                        Map<String, Boolean> milestoneCompletions = (Map<String, Boolean>) progressData.get("milestoneCompletions");
                        for (int i = 0; i < plan.getMilestones().size(); i++) {
                            if (milestoneCompletions.containsKey(String.valueOf(i))) {
                                plan.getMilestones().get(i).setCompleted(milestoneCompletions.get(String.valueOf(i)));
                            }
                        }
                    }
                    
                    // Calculate overall progress
                    updateOverallProgress(plan);
                    
                    return ResponseEntity.ok(planRepository.save(plan));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    private void updateOverallProgress(LearningPlan plan) {
        if (plan.getSubjects() == null || plan.getSubjects().isEmpty()) {
            plan.setProgress("NOT_STARTED");
            return;
        }
        
        int totalSubjects = plan.getSubjects().size();
        int completedSubjects = 0;
        
        for (LearningPlan.Subject subject : plan.getSubjects()) {
            if ("COMPLETED".equals(subject.getStatus())) {
                completedSubjects++;
            }
        }
        
        double progressPercentage = (double) completedSubjects / totalSubjects * 100;
        
        if (progressPercentage == 0) {
            plan.setProgress("NOT_STARTED");
        } else if (progressPercentage < 100) {
            plan.setProgress("IN_PROGRESS");
        } else {
            plan.setProgress("COMPLETED");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable String id) {
        if (!planRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        planRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}