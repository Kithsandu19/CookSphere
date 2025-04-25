package com.skillsync.cooking_edition.repository;

import com.skillsync.cooking_edition.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
}