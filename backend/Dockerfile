# Multi-stage build for Spring Boot (Java 17)
# Stage 1: Build application JAR using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and compile package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal runtime image using Eclipse Temurin JRE 17
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy compiled executable JAR from builder stage
COPY --from=builder /app/target/taskforge-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose default port (Render dynamically overrides PORT env var)
EXPOSE 8080

# Configure JVM memory limits for Render free tier (512MB RAM)
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
