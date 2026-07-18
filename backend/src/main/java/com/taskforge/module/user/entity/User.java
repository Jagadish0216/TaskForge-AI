package com.taskforge.module.user.entity;

import com.taskforge.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Email
    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String password;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private boolean deleted = false;

    // Extended profile fields
    @Column(unique = true, length = 50)
    private String username;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(length = 20)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 50)
    private String country;

    @Column(length = 50)
    private String city;

    @Column(length = 10)
    private String language;

    @Column(length = 50)
    private String timezone;

    @Column(length = 50)
    private String department;

    @Column(length = 50)
    private String designation;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "experience_level", length = 20)
    private String experienceLevel;

    @Column(name = "ai_preferences", columnDefinition = "TEXT")
    private String aiPreferences;

    @Column(length = 20)
    private String theme;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    public User() {}

    public User(Long id, String email, String password, String firstName, String lastName, boolean enabled, boolean deleted, Set<Role> roles) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.enabled = enabled;
        this.deleted = deleted;
        this.roles = roles != null ? roles : new HashSet<>();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public String getAiPreferences() { return aiPreferences; }
    public void setAiPreferences(String aiPreferences) { this.aiPreferences = aiPreferences; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Long id;
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        private boolean enabled = true;
        private boolean deleted = false;
        private String username;
        private String phoneNumber;
        private String gender;
        private LocalDate dateOfBirth;
        private String country;
        private String city;
        private String language;
        private String timezone;
        private String department;
        private String designation;
        private String bio;
        private String skills;
        private String experienceLevel;
        private String aiPreferences;
        private String theme;
        private String avatarUrl;
        private Set<Role> roles = new HashSet<>();

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public UserBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public UserBuilder enabled(boolean enabled) { this.enabled = enabled; return this; }
        public UserBuilder deleted(boolean deleted) { this.deleted = deleted; return this; }
        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public UserBuilder gender(String gender) { this.gender = gender; return this; }
        public UserBuilder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public UserBuilder country(String country) { this.country = country; return this; }
        public UserBuilder city(String city) { this.city = city; return this; }
        public UserBuilder language(String language) { this.language = language; return this; }
        public UserBuilder timezone(String timezone) { this.timezone = timezone; return this; }
        public UserBuilder department(String department) { this.department = department; return this; }
        public UserBuilder designation(String designation) { this.designation = designation; return this; }
        public UserBuilder bio(String bio) { this.bio = bio; return this; }
        public UserBuilder skills(String skills) { this.skills = skills; return this; }
        public UserBuilder experienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; return this; }
        public UserBuilder aiPreferences(String aiPreferences) { this.aiPreferences = aiPreferences; return this; }
        public UserBuilder theme(String theme) { this.theme = theme; return this; }
        public UserBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public UserBuilder roles(Set<Role> roles) { this.roles = roles; return this; }

        public User build() {
            User user = new User(id, email, password, firstName, lastName, enabled, deleted, roles);
            user.setUsername(username);
            user.setPhoneNumber(phoneNumber);
            user.setGender(gender);
            user.setDateOfBirth(dateOfBirth);
            user.setCountry(country);
            user.setCity(city);
            user.setLanguage(language);
            user.setTimezone(timezone);
            user.setDepartment(department);
            user.setDesignation(designation);
            user.setBio(bio);
            user.setSkills(skills);
            user.setExperienceLevel(experienceLevel);
            user.setAiPreferences(aiPreferences);
            user.setTheme(theme);
            user.setAvatarUrl(avatarUrl);
            return user;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
