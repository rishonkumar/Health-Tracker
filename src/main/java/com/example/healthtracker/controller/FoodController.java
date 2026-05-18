package com.example.healthtracker.controller;

import com.example.healthtracker.dto.FoodRequest;
import com.example.healthtracker.entity.FoodTracker;
import com.example.healthtracker.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/food")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @PostMapping
    public ResponseEntity<?> logFood(@RequestBody FoodRequest request) {
        try {
            FoodTracker logged = foodService.logFood(request);
            return ResponseEntity.ok(logged);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("An error occurred during food analysis: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FoodTracker>> getFoodEntries(@PathVariable Long userId) {
        try {
            List<FoodTracker> entries = foodService.getFoodEntriesByUserId(userId);
            return ResponseEntity.ok(entries);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
