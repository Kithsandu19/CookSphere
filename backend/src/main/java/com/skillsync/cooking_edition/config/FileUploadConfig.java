package com.skillsync.cooking_edition.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class FileUploadConfig {
    private static final Logger logger = LoggerFactory.getLogger(FileUploadConfig.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            logger.info("Initializing file upload directory at: {}", uploadPath);
            
            if (!Files.exists(uploadPath)) {
                logger.info("Creating upload directory: {}", uploadPath);
                Files.createDirectories(uploadPath);
                logger.info("Upload directory created successfully");
            } else {
                logger.info("Upload directory already exists");
            }
            
            // Verify directory is writable
            if (!Files.isWritable(uploadPath)) {
                logger.error("Upload directory is not writable: {}", uploadPath);
                throw new RuntimeException("Upload directory is not writable");
            }
            
            logger.info("File upload configuration initialized successfully");
        } catch (IOException e) {
            logger.error("Could not create upload directory", e);
            throw new RuntimeException("Could not create upload directory", e);
        }
    }
} 