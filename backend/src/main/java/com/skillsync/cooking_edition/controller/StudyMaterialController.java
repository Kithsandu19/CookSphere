package com.skillsync.cooking_edition.controller;

import com.skillsync.cooking_edition.model.StudyMaterial;
import com.skillsync.cooking_edition.service.FileStorageService;
import com.skillsync.cooking_edition.service.StudyMaterialService;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/study-materials")
public class StudyMaterialController {
    private static final Logger logger = LoggerFactory.getLogger(StudyMaterialController.class);

    @Autowired
    private StudyMaterialService studyMaterialService;

    @Autowired
    private FileStorageService fileStorageService;

    private static final int MAX_FILES = 5;

    @GetMapping
    public ResponseEntity<List<StudyMaterial>> listStudyMaterials() {
        try {
            logger.info("Attempting to fetch all study materials from database");
            List<StudyMaterial> materials = studyMaterialService.findAllByOrderByCreatedAtDesc();
            logger.info("Successfully fetched {} study materials", materials.size());
            return ResponseEntity.ok(materials);
        } catch (Exception e) {
            logger.error("Error fetching study materials: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<StudyMaterial>> myStudyMaterials() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String userId = oauth2User.getName();
            logger.info("Fetching study materials for user: {}", userId);
            List<StudyMaterial> materials = studyMaterialService.findByUserId(userId);
            logger.info("Found {} study materials for user {}", materials.size(), userId);
            return ResponseEntity.ok(materials);
        }
        logger.warn("User not authenticated when fetching my study materials");
        return ResponseEntity.ok(new ArrayList<>());
    }

    @PostMapping
    public ResponseEntity<?> createStudyMaterial(
            @RequestParam String title,
            @RequestParam String description,
            @RequestPart(required = false) List<MultipartFile> files) {
        logger.info("Received request to create study material. Title: {}, Files count: {}", 
                   title, (files != null ? files.size() : 0));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User)) {
            logger.error("User not authenticated");
            return ResponseEntity.status(401).body("User not authenticated");
        }

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String userId = oauth2User.getName();
        logger.info("Creating study material for user: {}", userId);

        // Validate files
        if (files == null || files.isEmpty()) {
            logger.warn("No files provided in the request");
            return ResponseEntity.badRequest().body("At least one file is required");
        }

        // Validate number of files
        if (files.size() > MAX_FILES) {
            logger.warn("Too many files uploaded: {}", files.size());
            return ResponseEntity.badRequest().body("Maximum " + MAX_FILES + " files allowed");
        }

        List<String> fileUrls = new ArrayList<>();
        String fileType = null;

        // Handle file uploads
        try {
            for (MultipartFile file : files) {
                logger.info("Processing file: {}, Size: {} bytes", file.getOriginalFilename(), file.getSize());
                
                // Validate file is not empty
                if (file.isEmpty()) {
                    logger.warn("Empty file provided: {}", file.getOriginalFilename());
                    continue;
                }

                String fileUrl = fileStorageService.storeFile(file);
                fileUrls.add(fileUrl);
                logger.info("File stored successfully. URL: {}", fileUrl);

                // Determine file type from the first file
                if (fileType == null) {
                    String contentType = file.getContentType();
                    logger.info("File content type: {}", contentType);
                    if (contentType != null) {
                        if (contentType.contains("pdf")) {
                            fileType = "pdf";
                        } else if (contentType.contains("msword") || contentType.contains("officedocument")) {
                            fileType = "doc";
                        } else if (contentType.contains("text")) {
                            fileType = "txt";
                        } else {
                            fileType = "unknown";
                        }
                        logger.info("Determined file type: {}", fileType);
                    }
                }
            }

            if (fileUrls.isEmpty()) {
                logger.error("No files were successfully uploaded");
                return ResponseEntity.badRequest().body("No files were successfully uploaded");
            }

            StudyMaterial material = new StudyMaterial();
            material.setTitle(title);
            material.setDescription(description);
            material.setFileUrls(fileUrls);
            material.setFileType(fileType);
            material.setUserId(userId);
            material.setUserName(oauth2User.getAttribute("name"));
            material.setCreatedAt(LocalDateTime.now());
            material.setUpdatedAt(LocalDateTime.now());

            StudyMaterial savedMaterial = studyMaterialService.save(material);
            logger.info("Study material created successfully with ID: {}", savedMaterial.getId());
            return ResponseEntity.ok(savedMaterial);

        } catch (IOException e) {
            logger.error("Failed to upload files", e);
            return ResponseEntity.internalServerError().body("Failed to upload files: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error while creating study material", e);
            return ResponseEntity.internalServerError().body("An unexpected error occurred");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyMaterial> viewStudyMaterial(@PathVariable String id) {
        return studyMaterialService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudyMaterial(
            @PathVariable String id,
            @RequestParam String title,
            @RequestParam String description,
            @RequestPart(required = false) List<MultipartFile> files,
            @RequestParam(required = false) List<String> existingFiles) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String userId = oauth2User.getName();

        // Check if there are any files (either existing or new)
        boolean hasExistingFiles = existingFiles != null && !existingFiles.isEmpty();
        boolean hasNewFiles = files != null && !files.isEmpty();

        // If no files are provided at all, return an error
        if (!hasExistingFiles && !hasNewFiles) {
            return ResponseEntity.badRequest().body("At least one file is required to update the material");
        }

        return studyMaterialService.findById(id)
                .map(material -> {
                    if (!material.getUserId().equals(userId)) {
                        return ResponseEntity.status(403).body("Forbidden: You can only edit your own study materials.");
                    }

                    // Validate number of total files
                    int totalFiles = (hasExistingFiles ? existingFiles.size() : 0) + 
                                   (hasNewFiles ? files.size() : 0);
                    if (totalFiles > MAX_FILES) {
                        return ResponseEntity.badRequest().body("Maximum " + MAX_FILES + " files allowed");
                    }

                    material.setTitle(title);
                    material.setDescription(description);
                    material.setUpdatedAt(LocalDateTime.now());

                    List<String> fileUrls = new ArrayList<>();
                    String fileType = null;

                    // Add existing files first
                    if (hasExistingFiles) {
                        fileUrls.addAll(existingFiles);
                        // Determine file type from first existing file
                        String firstFile = existingFiles.get(0);
                        String extension = firstFile.substring(firstFile.lastIndexOf(".") + 1).toLowerCase();
                        fileType = getFileType(extension);
                    }

                    // Handle new file uploads if present
                    if (hasNewFiles) {
                        try {
                            for (MultipartFile file : files) {
                                String fileUrl = fileStorageService.storeFile(file);
                                fileUrls.add(fileUrl);
                                
                                // Determine file type from the first file if not already set
                                if (fileType == null) {
                                    String contentType = file.getContentType();
                                    fileType = getFileTypeFromContentType(contentType);
                                }
                            }
                        } catch (IOException e) {
                            logger.error("Failed to upload files", e);
                            return ResponseEntity.internalServerError().body("Failed to upload files: " + e.getMessage());
                        }
                    }

                    material.setFileUrls(fileUrls);
                    material.setFileType(fileType);

                    StudyMaterial updatedMaterial = studyMaterialService.save(material);
                    return ResponseEntity.ok(updatedMaterial);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String getFileType(String extension) {
        switch (extension.toLowerCase()) {
            case "pdf":
                return "pdf";
            case "doc":
            case "docx":
                return "doc";
            case "txt":
                return "txt";
            case "ppt":
            case "pptx":
                return "ppt";
            default:
                return "unknown";
        }
    }

    private String getFileTypeFromContentType(String contentType) {
        if (contentType == null) return "unknown";
        
        if (contentType.contains("pdf")) {
            return "pdf";
        } else if (contentType.contains("msword") || contentType.contains("officedocument")) {
            return "doc";
        } else if (contentType.contains("text")) {
            return "txt";
        } else if (contentType.contains("presentation")) {
            return "ppt";
        }
        return "unknown";
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudyMaterial(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String userId = oauth2User.getName();

        return studyMaterialService.findById(id)
                .map(material -> {
                    if (!material.getUserId().equals(userId)) {
                        return ResponseEntity.status(403).body("Forbidden: You can only delete your own study materials.");
                    }
                    studyMaterialService.delete(material);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}