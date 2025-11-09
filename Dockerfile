# Backend Dockerfile (Spring Boot)
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Ensure gradlew has execute permissions
RUN chmod +x gradlew

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon || return 0

# Copy source code
COPY src src

# Build the application (creating executable WAR that can run standalone)
RUN ./gradlew bootWar --no-daemon -x test

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built WAR from builder stage
COPY --from=builder /app/build/libs/*.war app.war

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.war"]
