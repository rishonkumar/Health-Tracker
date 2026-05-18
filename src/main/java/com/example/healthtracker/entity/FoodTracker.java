package com.example.healthtracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_tracker")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String foodName;

    private Integer calories;
    
    private Double protein; // in grams
    
    private Double fiber; // in grams
    
    private Double fat; // in grams

    private LocalDateTime entryDate;

    private Boolean isAiAnalyzed;

    @Column(columnDefinition = "TEXT")
    private String rawInput;

    private String imageUrl;
}
