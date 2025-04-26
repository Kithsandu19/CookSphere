package com.skillsync.cooking_edition.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.skillsync.cooking_edition.model.CommunityChatMessage;

public interface CommunityChatRepository extends MongoRepository<CommunityChatMessage, String> {
    List<CommunityChatMessage> findAllByOrderByCreatedAtAsc();
} 