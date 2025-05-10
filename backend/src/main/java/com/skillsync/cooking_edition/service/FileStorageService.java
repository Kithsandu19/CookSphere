package com.skillsync.cooking_edition.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

@Service
public class FileStorageService {
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path getUploadPath() throws IOException {
        // Get the current working directory (project root)
        String projectRoot = System.getProperty("user.dir");
        // Go up one level if we're in the backend directory
        if (projectRoot.endsWith("backend")) {
            projectRoot = Paths.get(projectRoot).getParent().toString();
        }
        
        Path uploadPath = Paths.get(projectRoot, uploadDir).toAbsolutePath().normalize();
        logger.info("Upload path resolved to: {}", uploadPath);
        
        if (!Files.exists(uploadPath)) {
            logger.info("Creating upload directory at: {}", uploadPath);
            Files.createDirectories(uploadPath);
        }
        
        // Verify directory is writable
        if (!Files.isWritable(uploadPath)) {
            logger.error("Upload directory is not writable: {}", uploadPath);
            throw new IOException("Upload directory is not writable: " + uploadPath);
        }
        
        return uploadPath;
    }

    public String storeFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            logger.error("File is null or empty");
            throw new IllegalArgumentException("File cannot be empty");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        logger.info("Processing file upload: {}", originalFilename);

        // Generate a unique filename
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + extension;
        logger.info("Generated unique filename: {}", filename);

        Path uploadPath = getUploadPath();
        Path targetPath = uploadPath.resolve(filename);
        logger.info("Saving file to: {}", targetPath);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("File saved successfully");

            // Verify file was created and is readable
            if (!Files.exists(targetPath)) {
                logger.error("File was not created!");
                throw new IOException("Failed to store file: File was not created");
            }

            if (!Files.isReadable(targetPath)) {
                logger.error("Created file is not readable!");
                throw new IOException("Failed to store file: Created file is not readable");
            }

            logger.info("File verification successful. Size: {} bytes", Files.size(targetPath));
            return "/uploads/" + filename;
        } catch (IOException e) {
            logger.error("Error saving file: {}", e.getMessage(), e);
            throw new IOException("Failed to store file: " + e.getMessage(), e);
        }
    }
} 