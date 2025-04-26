package com.skillsync.cooking_edition.controller;

import com.skillsync.cooking_edition.model.Material;
import com.skillsync.cooking_edition.repository.MaterialRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/materials")
public class MaterialController {
    private static final Logger logger = LoggerFactory.getLogger(MaterialController.class);
    private static final int MAX_VIDEO_DURATION_SECONDS = 30;

    @Autowired
    private MaterialRepository materialRepository;

    @PostMapping
    public ResponseEntity<?> createMaterial(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) String content,
            @RequestPart(required = false) List<MultipartFile> media,
            @RequestParam(required = false) String mediaType,
            @RequestParam String category,
            @RequestParam String difficultyLevel,
            @RequestParam Integer estimatedTime) {
        
        logger.info("Creating new material with title: {}", title);
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String userId = oauth2User.getAttribute("sub");
            
            List<String> mediaUrls = new ArrayList<>();
            if (media != null && !media.isEmpty()) {
                try {
                    for (MultipartFile file : media) {
                        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                        Path uploadPath = Paths.get("uploads/materials");
                        if (!Files.exists(uploadPath)) {
                            Files.createDirectories(uploadPath);
                        }
                        Path filePath = uploadPath.resolve(fileName);
                        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                        mediaUrls.add("/uploads/materials/" + fileName);
                    }
                    
                    if (mediaType == null || mediaType.isEmpty()) {
                        String firstFileType = media.get(0).getContentType();
                        if (firstFileType != null && firstFileType.startsWith("image/")) {
                            mediaType = "image";
                        } else if (firstFileType != null && firstFileType.startsWith("video/")) {
                            mediaType = "video";
                        }
                        logger.info("Detected media type: {}", mediaType);
                    }
                } catch (IOException e) {
                    logger.error("Failed to upload media", e);
                    return ResponseEntity.internalServerError().body("Failed to upload media: " + e.getMessage());
                }
            }
            
            Material material = new Material();
            material.setTitle(title);
            material.setDescription(description);
            material.setContent(content != null ? content : "");
            material.setMediaUrls(mediaUrls);
            material.setMediaType(mediaType);
            material.setCategory(category);
            material.setDifficultyLevel(difficultyLevel);
            material.setEstimatedTime(estimatedTime);
            material.setUserId(userId);
            material.setUserName(oauth2User.getAttribute("name"));
            material.setCreatedAt(LocalDateTime.now());
            material.setUpdatedAt(LocalDateTime.now());
            material.setViews(0);
            material.setDownloads(0);
            
            try {
                Material savedMaterial = materialRepository.save(material);
                logger.info("Successfully created material with ID: {}", savedMaterial.getId());
                return ResponseEntity.ok(savedMaterial);
            } catch (Exception e) {
                logger.error("Error saving material: {}", e.getMessage(), e);
                return ResponseEntity.internalServerError().body("Failed to save material: " + e.getMessage());
            }
        }
        
        logger.warn("User not authenticated when creating material");
        return ResponseEntity.badRequest().body("User not authenticated");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Material> getMaterial(@PathVariable String id) {
        return materialRepository.findById(id)
                .map(material -> {
                    material.setViews(material.getViews() + 1);
                    materialRepository.save(material);
                    return ResponseEntity.ok(material);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Material>> getAllMaterials() {
        return ResponseEntity.ok(materialRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Material>> getMaterialsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(materialRepository.findByUserId(userId));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Material>> getMaterialsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(materialRepository.findByCategory(category));
    }

    @GetMapping("/difficulty/{level}")
    public ResponseEntity<List<Material>> getMaterialsByDifficulty(@PathVariable String level) {
        return ResponseEntity.ok(materialRepository.findByDifficultyLevel(level));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMaterial(
            @PathVariable String id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String content,
            @RequestPart(required = false) List<MultipartFile> media,
            @RequestParam(required = false) String mediaType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficultyLevel,
            @RequestParam(required = false) Integer estimatedTime) {
        
        return materialRepository.findById(id)
                .map(material -> {
                    if (title != null) material.setTitle(title);
                    if (description != null) material.setDescription(description);
                    if (content != null) material.setContent(content);
                    if (category != null) material.setCategory(category);
                    if (difficultyLevel != null) material.setDifficultyLevel(difficultyLevel);
                    if (estimatedTime != null) material.setEstimatedTime(estimatedTime);
                    
                    if (media != null && !media.isEmpty()) {
                        try {
                            List<String> mediaUrls = new ArrayList<>();
                            for (MultipartFile file : media) {
                                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                                Path uploadPath = Paths.get("uploads/materials");
                                if (!Files.exists(uploadPath)) {
                                    Files.createDirectories(uploadPath);
                                }
                                Path filePath = uploadPath.resolve(fileName);
                                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                                mediaUrls.add("/uploads/materials/" + fileName);
                            }
                            material.setMediaUrls(mediaUrls);
                            
                            if (mediaType == null || mediaType.isEmpty()) {
                                String firstFileType = media.get(0).getContentType();
                                if (firstFileType != null && firstFileType.startsWith("image/")) {
                                    material.setMediaType("image");
                                } else if (firstFileType != null && firstFileType.startsWith("video/")) {
                                    material.setMediaType("video");
                                }
                            } else {
                                material.setMediaType(mediaType);
                            }
                        } catch (IOException e) {
                            logger.error("Failed to upload media", e);
                            return ResponseEntity.internalServerError().body("Failed to upload media: " + e.getMessage());
                        }
                    }
                    
                    material.setUpdatedAt(LocalDateTime.now());
                    Material updatedMaterial = materialRepository.save(material);
                    return ResponseEntity.ok(updatedMaterial);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable String id) {
        return materialRepository.findById(id)
                .map(material -> {
                    materialRepository.delete(material);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/download")
    public ResponseEntity<?> incrementDownloads(@PathVariable String id) {
        return materialRepository.findById(id)
                .map(material -> {
                    material.setDownloads(material.getDownloads() + 1);
                    materialRepository.save(material);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 