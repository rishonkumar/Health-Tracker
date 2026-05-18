package com.example.healthtracker.dto;

import lombok.Data;

@Data
public class FoodRequest {
    private Long userId;
    
    // For AI analysis: either description of the food, or details
    private String rawInput;
    
    // For manual logs (optional if user provides details directly)
    private String foodName;
    private Integer calories;
    private Double protein;
    private Double fiber;
    private Double fat;
}
