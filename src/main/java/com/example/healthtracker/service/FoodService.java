package com.example.healthtracker.service;

import com.example.healthtracker.dto.FoodRequest;
import com.example.healthtracker.dto.NutritionResponse;
import com.example.healthtracker.entity.User;
import com.example.healthtracker.entity.FoodTracker;
import com.example.healthtracker.repository.FoodTrackerRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

@Service
public class FoodService {

    private final FoodTrackerRepository foodTrackerRepository;
    private final UserService userService;
    private final ChatClient chatClient;
    private Logger log;

    // Spring AI automatically provides a ChatClient.Builder configured with default
    // OpenAI properties
    public FoodService(FoodTrackerRepository foodTrackerRepository,
            UserService userService,
            ChatClient.Builder chatClientBuilder) {
        this.foodTrackerRepository = foodTrackerRepository;
        this.userService = userService;
        this.chatClient = chatClientBuilder.build();
    }

    @Transactional
    public FoodTracker logFood(FoodRequest request) {
        User user = userService.getUserById(request.getUserId());

        FoodTracker.FoodTrackerBuilder foodBuilder = FoodTracker.builder()
                .user(user)
                .entryDate(LocalDateTime.now());

        // Scenario 1: Manual entry provided directly
        if (request.getFoodName() != null && request.getCalories() != null) {
            foodBuilder.foodName(request.getFoodName())
                    .calories(request.getCalories())
                    .protein(request.getProtein())
                    .fiber(request.getFiber())
                    .fat(request.getFat())
                    .isAiAnalyzed(false)
                    .rawInput(request.getRawInput());
        }
        // Scenario 2: AI analysis of description or text
        else if (request.getRawInput() != null && !request.getRawInput().isBlank()) {
            NutritionResponse nutrition = analyzeFoodDescription(request.getRawInput());

            log.info("Nutrition data from LLM " + nutrition);
            foodBuilder.foodName(nutrition.getFoodName())
                    .calories(nutrition.getCalories())
                    .protein(nutrition.getProtein())
                    .fiber(nutrition.getFiber())
                    .fat(nutrition.getFat())
                    .isAiAnalyzed(true)
                    .rawInput(request.getRawInput());
        } else {
            log.warning("\"Either manual food details or raw input for AI analysis must be provided.\"");
            throw new IllegalArgumentException(
                    "Either manual food details or raw input for AI analysis must be provided.");
        }

        return foodTrackerRepository.save(foodBuilder.build());
    }

    public List<FoodTracker> getFoodEntriesByUserId(Long userId) {
        // Ensure user exists
        userService.getUserById(userId);
        return foodTrackerRepository.findByUserIdOrderByEntryDateDesc(userId);
    }

    /**
     * Utilizes Spring AI to query ChatGPT and parse nutritional data directly into
     * a DTO.
     */
    public NutritionResponse analyzeFoodDescription(String foodDescription) {
        String systemPrompt = """
                You are a nutrition AI. Your task is to analyze the food description provided by the user,
                identify the food, and estimate its nutrition details: food name, calories, protein (g), fiber (g), and fat (g).
                If the user inputs a casual description like "2 boiled eggs and wheat toast", break down or aggregate the nutritional value accurately.
                Make your best professional nutritional estimation.
                """;

        return chatClient.prompt()
                .system(systemPrompt)
                .user(foodDescription)
                .call()
                .entity(NutritionResponse.class); // This uses Spring AI's bean output converter automatically!
    }
}
