package com.skillsync.cooking_edition.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.skillsync.cooking_edition.model.Post;
import com.skillsync.cooking_edition.repository.PostRepository;
import javax.media.Manager;
import javax.media.MediaLocator;
import javax.media.Player;
import javax.media.Time;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    @Autowired
    private PostRepository postRepository;
    
    @Value("${upload.path:uploads}")
    private String uploadPath;

    private static final int MAX_IMAGES = 3;
    private static final double MAX_VIDEO_DURATION_SECONDS = 300.0; // 5 minutes

    @GetMapping
    public ResponseEntity<List<Post>> listPosts() {
        try {
            logger.info("Attempting to fetch all posts from database");
            
            // First try to get all posts without ordering
            List<Post> allPosts = postRepository.findAll();
            logger.info("Total posts in database (using findAll): {}", allPosts.size());
            
            // If we have posts but they're not showing up with ordering, return them directly
            if (!allPosts.isEmpty()) {
                logger.info("Returning all posts without ordering");
                return ResponseEntity.ok(allPosts);
            }
            
            // Otherwise try to get posts ordered by creation date
            List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
            logger.info("Successfully fetched {} posts from database (using findAllByOrderByCreatedAtDesc)", posts.size());
            
            if (posts.isEmpty()) {
                logger.warn("No posts found in the database");
            } else {
                logger.debug("First post details: id={}, title={}, userId={}, createdAt={}", 
                    posts.get(0).getId(), 
                    posts.get(0).getTitle(), 
                    posts.get(0).getUserId(),
                    posts.get(0).getCreatedAt());
            }
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            logger.error("Error fetching posts from database: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<Post>> myPosts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String userId = oauth2User.getName();
            logger.info("Fetching posts for user: {}", userId);
            List<Post> posts = postRepository.findByUserId(userId);
            logger.info("Found {} posts for user {}", posts.size(), userId);
            return ResponseEntity.ok(posts);
        }
        logger.warn("User not authenticated when fetching my posts");
        return ResponseEntity.ok(new ArrayList<>());
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) String content,
            @RequestPart(required = false) List<MultipartFile> media,
            @RequestParam(required = false) String mediaType,
            @RequestParam(required = false) String[] ingredients,
            @RequestParam(required = false) String[] amounts,
            @RequestParam(required = false) String[] instructions,
            @RequestParam(required = false) Integer cookingTime,
            @RequestParam(required = false) Integer servings,
            @RequestParam(required = false) String category) {
        
        logger.info("Creating new post with title: {}", title);
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String userId = oauth2User.getName();
            logger.info("Creating post for user: {}", userId);
            
            List<String> mediaUrls = new ArrayList<>();
            
            // Handle file uploads if present
            if (media != null && !media.isEmpty()) {
                logger.info("Processing {} media files", media.size());
                // Validate number of images
                if (mediaType != null && mediaType.equals("image") && media.size() > MAX_IMAGES) {
                    logger.warn("Too many images uploaded: {}", media.size());
                    return ResponseEntity.badRequest().body("Maximum " + MAX_IMAGES + " images allowed");
                }

                try {
                    // Create upload directory if it doesn't exist
                    Path uploadDir = Paths.get(uploadPath);
                    if (!Files.exists(uploadDir)) {
                        Files.createDirectories(uploadDir);
                        logger.info("Created upload directory: {}", uploadPath);
                    }
                    
                    for (MultipartFile file : media) {
                        // Generate a unique filename
                        String originalFilename = file.getOriginalFilename();
                        if (originalFilename == null) {
                            originalFilename = "file";
                        }
                        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                        String filename = UUID.randomUUID().toString() + extension;
                        
                        // Save the file
                        Path filePath = uploadDir.resolve(filename);
                        Files.copy(file.getInputStream(), filePath);
                        logger.info("Saved media file: {}", filename);
                        
                        // Add the media URL to the list
                        mediaUrls.add("/uploads/" + filename);
                    }
                    
                    // Set media type based on file type if not provided
                    if (mediaType == null || mediaType.isEmpty()) {
                        String firstFileType = media.get(0).getContentType();
                        if (firstFileType != null && firstFileType.startsWith("image/")) {
                            mediaType = "image";
                        } else if (firstFileType != null && firstFileType.startsWith("video/")) {
                            mediaType = "video";
                            if (!validateVideoDuration(media.get(0))) {
                                return ResponseEntity.badRequest().body("Video duration exceeds " + MAX_VIDEO_DURATION_SECONDS + " seconds");
                            }
                        }
                        logger.info("Detected media type: {}", mediaType);
                    }
                } catch (IOException e) {
                    logger.error("Failed to upload media", e);
                    return ResponseEntity.internalServerError().body("Failed to upload media: " + e.getMessage());
                }
            }
            
            Post post = new Post();
            post.setTitle(title);
            post.setDescription(description);
            post.setContent(content != null ? content : "");
            post.setMediaUrls(mediaUrls);
            post.setMediaType(mediaType);
            post.setIngredients(ingredients != null ? Arrays.asList(ingredients) : null);
            post.setAmounts(amounts != null ? Arrays.asList(amounts) : null);
            post.setInstructions(instructions != null ? Arrays.asList(instructions) : null);
            post.setCookingTime(cookingTime);
            post.setServings(servings);
            post.setCategory(category);
            post.setUserId(userId);
            post.setUserName(oauth2User.getAttribute("name"));
            post.setCreatedAt(LocalDateTime.now());
            post.setUpdatedAt(LocalDateTime.now());
            post.setLikes(0);
            post.setComments(0);
            
            try {
                Post savedPost = postRepository.save(post);
                logger.info("Successfully created post with ID: {}", savedPost.getId());
                return ResponseEntity.ok(savedPost);
            } catch (Exception e) {
                logger.error("Error saving post: {}", e.getMessage(), e);
                return ResponseEntity.internalServerError().body("Failed to save post: " + e.getMessage());
            }
        }
        
        logger.warn("User not authenticated when creating post");
        return ResponseEntity.badRequest().body("User not authenticated");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> viewPost(@PathVariable String id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable String id,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) String content,
            @RequestPart(required = false) List<MultipartFile> media,
            @RequestParam(required = false) String mediaType,
            @RequestParam(required = false) String[] ingredients,
            @RequestParam(required = false) String[] amounts,
            @RequestParam(required = false) String[] instructions,
            @RequestParam(required = false) Integer cookingTime,
            @RequestParam(required = false) Integer servings,
            @RequestParam(required = false) String category) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String userId = oauth2User.getName();
        return postRepository.findById(id)
                .map(post -> {
                    if (!post.getUserId().equals(userId)) {
                        return ResponseEntity.status(403).body("Forbidden: You can only edit your own posts.");
                    }
                    // Validate number of images
                    if (media != null && !media.isEmpty() && mediaType != null && 
                        mediaType.equals("image") && media.size() > MAX_IMAGES) {
                        return ResponseEntity.badRequest().body("Maximum " + MAX_IMAGES + " images allowed");
                    }

                    post.setTitle(title);
                    post.setDescription(description);
                    post.setContent(content != null ? content : "");
                    post.setIngredients(ingredients != null ? Arrays.asList(ingredients) : null);
                    post.setAmounts(amounts != null ? Arrays.asList(amounts) : null);
                    post.setInstructions(instructions != null ? Arrays.asList(instructions) : null);
                    post.setCookingTime(cookingTime != null ? cookingTime : 0);
                    post.setServings(servings != null ? servings : 0);
                    post.setCategory(category);
                    post.setUpdatedAt(LocalDateTime.now());
                    
                    // Handle file uploads if present
                    if (media != null && !media.isEmpty()) {
                        List<String> mediaUrls = new ArrayList<>();
                        try {
                            // Create upload directory if it doesn't exist
                            Path uploadDir = Paths.get(uploadPath);
                            if (!Files.exists(uploadDir)) {
                                Files.createDirectories(uploadDir);
                            }
                            
                            for (MultipartFile file : media) {
                                // Generate a unique filename
                                String originalFilename = file.getOriginalFilename();
                                if (originalFilename == null) {
                                    originalFilename = "file";
                                }
                                String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                                String filename = UUID.randomUUID().toString() + extension;
                                
                                // Save the file
                                Path filePath = uploadDir.resolve(filename);
                                Files.copy(file.getInputStream(), filePath);
                                
                                // Add the media URL to the list
                                mediaUrls.add("/uploads/" + filename);
                            }
                            
                            post.setMediaUrls(mediaUrls);
                            
                            // Set media type based on file type if not provided
                            if (mediaType == null || mediaType.isEmpty()) {
                                String firstFileType = media.get(0).getContentType();
                                if (firstFileType != null && firstFileType.startsWith("image/")) {
                                    post.setMediaType("image");
                                } else if (firstFileType != null && firstFileType.startsWith("video/")) {
                                    post.setMediaType("video");
                                    if (!validateVideoDuration(media.get(0))) {
                                        return ResponseEntity.badRequest().body("Video duration exceeds " + MAX_VIDEO_DURATION_SECONDS + " seconds");
                                    }
                                }
                            } else {
                                post.setMediaType(mediaType);
                            }
                        } catch (IOException e) {
                            e.printStackTrace();
                            return ResponseEntity.internalServerError().body("Failed to upload media: " + e.getMessage());
                        }
                    }
                    
                    Post updatedPost = postRepository.save(post);
                    return ResponseEntity.ok(updatedPost);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String userId = oauth2User.getName();
        return postRepository.findById(id)
                .map(post -> {
                    if (!post.getUserId().equals(userId)) {
                        return ResponseEntity.status(403).body("Forbidden: You can only delete your own posts.");
                    }
                    postRepository.delete(post);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testConnection() {
        Map<String, Object> result = new HashMap<>();
        try {
            logger.info("Testing MongoDB connection");
            
            // Get all posts
            List<Post> allPosts = postRepository.findAll();
            result.put("totalPosts", allPosts.size());
            
            // Get posts by user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof OAuth2User) {
                OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                String userId = oauth2User.getName();
                List<Post> userPosts = postRepository.findByUserId(userId);
                result.put("userPosts", userPosts.size());
                result.put("userId", userId);
            } else {
                result.put("userPosts", 0);
                result.put("userId", "not authenticated");
            }
            
            // Get posts ordered by creation date
            List<Post> orderedPosts = postRepository.findAllByOrderByCreatedAtDesc();
            result.put("orderedPosts", orderedPosts.size());
            
            // Add sample post if none exist
            if (allPosts.isEmpty()) {
                Post samplePost = new Post();
                samplePost.setTitle("Sample Post");
                samplePost.setDescription("This is a sample post");
                samplePost.setContent("Sample content");
                samplePost.setUserId("sample-user");
                samplePost.setUserName("Sample User");
                samplePost.setCreatedAt(LocalDateTime.now());
                samplePost.setUpdatedAt(LocalDateTime.now());
                samplePost.setLikes(0);
                samplePost.setComments(0);
                
                Post savedPost = postRepository.save(samplePost);
                result.put("createdSamplePost", true);
                result.put("samplePostId", savedPost.getId());
            } else {
                result.put("createdSamplePost", false);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error testing MongoDB connection: {}", e.getMessage(), e);
            result.put("error", e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        try {
            logger.info("Fetching unique categories from posts");
            List<Post> posts = postRepository.findAll();
            List<String> categories = posts.stream()
                .map(Post::getCategory)
                .filter(category -> category != null && !category.isEmpty())
                .distinct()
                .sorted()
                .toList();
            logger.info("Found {} unique categories", categories.size());
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            logger.error("Error fetching categories: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    private boolean validateVideoDuration(MultipartFile file) {
        try {
            // Save the file temporarily
            Path tempFile = Files.createTempFile("video", ".mp4");
            Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);
            
            // Create a media locator
            MediaLocator ml = new MediaLocator(tempFile.toUri().toURL());
            
            // Create a player
            Player player = Manager.createRealizedPlayer(ml);
            
            // Get the duration
            Time duration = player.getDuration();
            double durationInSeconds = duration.getSeconds();
            
            // Clean up
            player.close();
            Files.delete(tempFile);
            
            return durationInSeconds <= MAX_VIDEO_DURATION_SECONDS;
        } catch (Exception e) {
            logger.error("Error validating video duration", e);
            return false;
        }
    }
} 