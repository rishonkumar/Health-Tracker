package com.example.healthtracker.controller;

import com.example.healthtracker.entity.WorkoutTracker;
import com.example.healthtracker.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<?> logWorkout(@PathVariable Long userId, @RequestBody WorkoutTracker workout) {
        try {
            WorkoutTracker logged = workoutService.logWorkout(userId, workout);
            return ResponseEntity.ok(logged);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkoutTracker>> getWorkouts(@PathVariable Long userId) {
        try {
            List<WorkoutTracker> workouts = workoutService.getWorkoutsByUserId(userId);
            return ResponseEntity.ok(workouts);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
