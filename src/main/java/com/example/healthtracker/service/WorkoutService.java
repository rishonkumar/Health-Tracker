package com.example.healthtracker.service;

import com.example.healthtracker.entity.User;
import com.example.healthtracker.entity.WorkoutTracker;
import com.example.healthtracker.repository.WorkoutTrackerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutTrackerRepository workoutTrackerRepository;
    private final UserService userService;

    @Transactional
    public WorkoutTracker logWorkout(Long userId, WorkoutTracker workout) {
        User user = userService.getUserById(userId);
        workout.setUser(user);
        if (workout.getWorkoutDate() == null) {
            workout.setWorkoutDate(LocalDateTime.now());
        }
        return workoutTrackerRepository.save(workout);
    }

    public List<WorkoutTracker> getWorkoutsByUserId(Long userId) {
        // Ensure user exists first
        userService.getUserById(userId);
        return workoutTrackerRepository.findByUserIdOrderByWorkoutDateDesc(userId);
    }
}
