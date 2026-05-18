package com.example.healthtracker.repository;

import com.example.healthtracker.entity.WorkoutTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkoutTrackerRepository extends JpaRepository<WorkoutTracker, Long> {
    List<WorkoutTracker> findByUserIdOrderByWorkoutDateDesc(Long userId);
}
