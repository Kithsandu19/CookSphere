package com.skillsync.cooking_edition.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.resource.PathResourceResolver;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class FileServingConfig implements WebMvcConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(FileServingConfig.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            // Get the current working directory (project root)
            String projectRoot = System.getProperty("user.dir");
            // Go up one level if we're in the backend directory
            if (projectRoot.endsWith("backend")) {
                projectRoot = Paths.get(projectRoot).getParent().toString();
            }
            
            Path uploadPath = Paths.get(projectRoot, uploadDir).toAbsolutePath().normalize();
            String location = "file:" + uploadPath.toString() + "/";
            
            logger.info("Configuring file serving from: {}", location);
            
            registry.addResourceHandler("/uploads/**")
                   .addResourceLocations(location)
                   .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS))
                   .resourceChain(true)
                   .addResolver(new PathResourceResolver());
                   
            logger.info("File serving configuration completed successfully");
        } catch (Exception e) {
            logger.error("Failed to configure file serving: {}", e.getMessage(), e);
            throw new RuntimeException("Could not configure file serving", e);
        }
    }
} 