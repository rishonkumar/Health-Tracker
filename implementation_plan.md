# Health Tracker Spring Boot Application

Based on your provided architecture image and requirements, here is the proposed implementation plan for the Health Tracker application.

## Goal Description
Build a robust backend Spring Boot application that tracks user health metrics, specifically focusing on food intake and workouts. The system will use PostgreSQL for data persistence and integrate with an external AI API (Gemini/ChatGPT) to analyze food entries (from images or text) and automatically extract nutritional information (calories, protein, fiber, fat).

## Final Decisions ✅
| Decision | Choice |
|---|---|
| Java Version | Java 21 |
| AI Provider | ChatGPT (OpenAI) via **Spring AI** |
| API Key | Placeholder for now, wired in `application.properties` |
| Authentication | JWT deferred — `userId` passed in request body |
| Config | `application.properties` |

## Proposed Changes

### Project Initialization
- Create a Spring Boot (Maven) project using Spring Web, Spring Data JPA, PostgreSQL Driver, and Lombok.
- Configure `application.properties` (or `.yml`) for local PostgreSQL connectivity and AI API keys.

---

### Database Entities & Repositories

#### [NEW] `User.java`
Entity representing the user. Will contain fields like `id`, `username`, `email`.

#### [NEW] `FoodTracker.java`
Entity representing a food entry. Will contain fields like `id`, `userId` (ManyToOne mapping), `foodName`, `calories`, `protein`, `fiber`, `fat`, and a `timestamp`.

#### [NEW] `WorkoutTracker.java`
Entity representing a workout. Will contain fields like `id`, `userId` (ManyToOne mapping), `workoutType`, `duration`, `caloriesBurned`, and a `timestamp`.

#### [NEW] `UserRepository.java`, `FoodTrackerRepository.java`, `WorkoutTrackerRepository.java`
Spring Data JPA interfaces for database operations.

---

### Services

#### [NEW] `FoodService.java`
Core service for food tracking. This service will:
1. Accept manual food details or an image payload.
2. Communicate with the Gemini/ChatGPT API.
3. Parse the JSON response containing the macronutrients (calories, protein, fiber, fat).
4. Save the parsed `FoodTracker` entity to the database.

#### [NEW] `WorkoutService.java`
Service to handle logging and retrieving user workouts.

---

### Controllers

#### [NEW] `FoodController.java`
REST endpoints for logging food (`POST /api/food`) and retrieving food history (`GET /api/food/{userId}`).

#### [NEW] `WorkoutController.java`
REST endpoints for logging workouts (`POST /api/workouts`) and retrieving workout history.

## Verification Plan

### Automated Tests
- Write basic Spring Boot integration tests for context loading.
- Test repository layers with `@DataJpaTest` (using an H2 in-memory DB or Testcontainers).

### Manual Verification
- We will start the Spring Boot application locally.
- Use `curl` or Postman (or simple terminal commands) to test the `POST /api/food` endpoint.
- Verify that the API correctly calls the AI service and stores the expected nutritional data in PostgreSQL.
