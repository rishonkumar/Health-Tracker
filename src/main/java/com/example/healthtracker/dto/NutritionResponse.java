package com.example.healthtracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionResponse {
    private String foodName;
    private Integer calories;
    private Double protein;
    private Double fiber;
    private Double fat;
}
