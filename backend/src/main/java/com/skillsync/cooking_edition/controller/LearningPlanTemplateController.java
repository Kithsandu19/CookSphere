package com.skillsync.cooking_edition.controller;

import com.skillsync.cooking_edition.model.LearningPlanTemplate;
import com.skillsync.cooking_edition.repository.LearningPlanTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/learning-plan-templates")
public class LearningPlanTemplateController {

    private static final Logger logger = LoggerFactory.getLogger(LearningPlanTemplateController.class);

    @Autowired
    private LearningPlanTemplateRepository templateRepository;

    @GetMapping
    public List<LearningPlanTemplate> getAllTemplates() {
        logger.info("Fetching all learning plan templates");
        try {
            List<LearningPlanTemplate> templates = templateRepository.findAll();
            logger.info("Found {} templates", templates.size());
            
            if (templates.isEmpty()) {
                logger.warn("No templates found in database");
                // Try to initialize templates
                initializeTemplates();
                templates = templateRepository.findAll();
                logger.info("After initialization: Found {} templates", templates.size());
            }
            
            // Log details of each template
            for (LearningPlanTemplate template : templates) {
                logger.info("Template: id={}, title={}, category={}, difficulty={}, subjects={}",
                    template.getId(),
                    template.getTitle(),
                    template.getCategory(),
                    template.getDifficulty(),
                    template.getSubjects() != null ? template.getSubjects().size() : 0);
            }
            
            return templates;
        } catch (Exception e) {
            logger.error("Error fetching templates: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningPlanTemplate> getTemplateById(@PathVariable String id) {
        return templateRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public LearningPlanTemplate createTemplate(@RequestBody LearningPlanTemplate template) {
        return templateRepository.save(template);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testTemplates() {
        Map<String, Object> result = new HashMap<>();
        try {
            logger.info("Testing learning plan templates");
            
            // Get all templates
            List<LearningPlanTemplate> allTemplates = templateRepository.findAll();
            result.put("totalTemplates", allTemplates.size());
            
            // If no templates exist, initialize them
            if (allTemplates.isEmpty()) {
                logger.info("No templates found, initializing default templates");
                initializeTemplates();
                
                // Get templates again after initialization
                allTemplates = templateRepository.findAll();
                result.put("templatesAfterInit", allTemplates.size());
                result.put("initialized", true);
            } else {
                result.put("initialized", false);
            }
            
            // Add template details for debugging
            List<Map<String, Object>> templateDetails = new ArrayList<>();
            for (LearningPlanTemplate template : allTemplates) {
                Map<String, Object> detail = new HashMap<>();
                detail.put("id", template.getId());
                detail.put("title", template.getTitle());
                detail.put("category", template.getCategory());
                detail.put("difficulty", template.getDifficulty());
                detail.put("subjectsCount", template.getSubjects() != null ? template.getSubjects().size() : 0);
                templateDetails.add(detail);
            }
            result.put("templateDetails", templateDetails);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error testing templates: {}", e.getMessage(), e);
            result.put("error", e.getMessage());
            result.put("errorType", e.getClass().getName());
            return ResponseEntity.status(500).body(result);
        }
    }

    // Initialize some default templates
    @PostConstruct
    public void init() {
        logger.info("Initializing learning plan templates");
        if (templateRepository.count() == 0) {
            logger.info("No templates found, creating default templates");
            initializeTemplates();
        } else {
            logger.info("Templates already exist, skipping initialization");
        }
    }
    
    private void initializeTemplates() {
        // Create Italian Cuisine template
        LearningPlanTemplate italianCuisine = new LearningPlanTemplate();
        italianCuisine.setTitle("Italian Cuisine Mastery");
        italianCuisine.setDescription("Master the art of Italian cooking");
        italianCuisine.setCategory("CUISINE");
        italianCuisine.setDifficulty("INTERMEDIATE");
        italianCuisine.setEstimatedDurationDays(30);
        
        List<LearningPlanTemplate.Subject> subjects = new ArrayList<>();
        
        LearningPlanTemplate.Subject pasta = new LearningPlanTemplate.Subject();
        pasta.setName("Pasta Making");
        pasta.setDescription("Learn to make fresh pasta from scratch");
        pasta.setMaterials(Arrays.asList(
            "Basic pasta dough recipe",
            "Pasta shaping techniques",
            "Sauce pairing guide"
        ));
        subjects.add(pasta);
        
        LearningPlanTemplate.Subject sauces = new LearningPlanTemplate.Subject();
        sauces.setName("Italian Sauces");
        sauces.setDescription("Master classic Italian sauces");
        sauces.setMaterials(Arrays.asList(
            "Tomato sauce basics",
            "Cream-based sauces",
            "Wine reduction techniques"
        ));
        subjects.add(sauces);
        
        italianCuisine.setSubjects(subjects);
        templateRepository.save(italianCuisine);
        logger.info("Created Italian Cuisine template");
        
        // Create Japanese Cuisine template
        LearningPlanTemplate japaneseCuisine = new LearningPlanTemplate();
        japaneseCuisine.setTitle("Japanese Cuisine Mastery");
        japaneseCuisine.setDescription("Master the art of Japanese cooking");
        japaneseCuisine.setCategory("CUISINE");
        japaneseCuisine.setDifficulty("INTERMEDIATE");
        japaneseCuisine.setEstimatedDurationDays(45);
        
        List<LearningPlanTemplate.Subject> japaneseSubjects = new ArrayList<>();
        
        LearningPlanTemplate.Subject sushi = new LearningPlanTemplate.Subject();
        sushi.setName("Sushi Making");
        sushi.setDescription("Learn to make various types of sushi");
        sushi.setMaterials(Arrays.asList(
            "Rice preparation techniques",
            "Fish selection and preparation",
            "Rolling techniques"
        ));
        japaneseSubjects.add(sushi);
        
        LearningPlanTemplate.Subject ramen = new LearningPlanTemplate.Subject();
        ramen.setName("Ramen Preparation");
        ramen.setDescription("Master the art of making authentic ramen");
        ramen.setMaterials(Arrays.asList(
            "Broth preparation",
            "Noodle selection and cooking",
            "Topping preparation"
        ));
        japaneseSubjects.add(ramen);
        
        japaneseCuisine.setSubjects(japaneseSubjects);
        templateRepository.save(japaneseCuisine);
        logger.info("Created Japanese Cuisine template");
        
        // Create Knife Skills template
        LearningPlanTemplate knifeSkills = new LearningPlanTemplate();
        knifeSkills.setTitle("Knife Skills Mastery");
        knifeSkills.setDescription("Master essential knife skills for cooking");
        knifeSkills.setCategory("SPECIFIC_SKILL");
        knifeSkills.setDifficulty("BEGINNER");
        knifeSkills.setEstimatedDurationDays(14);
        
        List<LearningPlanTemplate.Subject> knifeSubjects = new ArrayList<>();
        
        LearningPlanTemplate.Subject basicCuts = new LearningPlanTemplate.Subject();
        basicCuts.setName("Basic Knife Cuts");
        basicCuts.setDescription("Learn fundamental knife cutting techniques");
        basicCuts.setMaterials(Arrays.asList(
            "Knife selection and maintenance",
            "Julienne technique",
            "Brunoise technique",
            "Chiffonade technique"
        ));
        knifeSubjects.add(basicCuts);
        
        LearningPlanTemplate.Subject advancedCuts = new LearningPlanTemplate.Subject();
        advancedCuts.setName("Advanced Knife Cuts");
        advancedCuts.setDescription("Master advanced knife cutting techniques");
        advancedCuts.setMaterials(Arrays.asList(
            "Tourne technique",
            "Paysanne technique",
            "Macedoine technique"
        ));
        knifeSubjects.add(advancedCuts);
        
        knifeSkills.setSubjects(knifeSubjects);
        templateRepository.save(knifeSkills);
        logger.info("Created Knife Skills template");
        
        // Create Baking Fundamentals template
        LearningPlanTemplate baking = new LearningPlanTemplate();
        baking.setTitle("Baking Fundamentals");
        baking.setDescription("Master the basics of baking");
        baking.setCategory("COOKING_STYLE");
        baking.setDifficulty("BEGINNER");
        baking.setEstimatedDurationDays(21);
        
        List<LearningPlanTemplate.Subject> bakingSubjects = new ArrayList<>();
        
        LearningPlanTemplate.Subject breads = new LearningPlanTemplate.Subject();
        breads.setName("Bread Making");
        breads.setDescription("Learn to make various types of bread");
        breads.setMaterials(Arrays.asList(
            "Yeast activation",
            "Kneading techniques",
            "Proofing methods",
            "Baking temperatures"
        ));
        bakingSubjects.add(breads);
        
        LearningPlanTemplate.Subject pastries = new LearningPlanTemplate.Subject();
        pastries.setName("Pastry Making");
        pastries.setDescription("Master pastry dough techniques");
        pastries.setMaterials(Arrays.asList(
            "Pie crust preparation",
            "Puff pastry technique",
            "Croissant dough preparation"
        ));
        bakingSubjects.add(pastries);
        
        baking.setSubjects(bakingSubjects);
        templateRepository.save(baking);
        logger.info("Created Baking Fundamentals template");
    }
} 