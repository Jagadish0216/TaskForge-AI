package com.taskforge.module.user.entity;

import com.taskforge.common.constant.UserRole;
import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, unique = true, nullable = false)
    private UserRole name;

    public Role() {}

    public Role(UserRole name) {
        this.name = name;
    }

    public Role(Long id, UserRole name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserRole getName() { return name; }
    public void setName(UserRole name) { this.name = name; }

    public static RoleBuilder builder() {
        return new RoleBuilder();
    }

    public static class RoleBuilder {
        private Long id;
        private UserRole name;

        public RoleBuilder id(Long id) { this.id = id; return this; }
        public RoleBuilder name(UserRole name) { this.name = name; return this; }

        public Role build() {
            return new Role(id, name);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Role role = (Role) o;
        return Objects.equals(id, role.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
