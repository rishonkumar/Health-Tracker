package com.example.healthtracker.repository;

import com.example.healthtracker.entity.FoodTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodTrackerRepository extends JpaRepository<FoodTracker, Long> {
    List<FoodTracker> findByUserIdOrderByEntryDateDesc(Long userId);
}
