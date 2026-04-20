INSERT INTO roles (name)
SELECT 'SALES_STAFF'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE UPPER(name) = 'SALES_STAFF');

INSERT INTO roles (name)
SELECT 'TECH_STAFF'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE UPPER(name) = 'TECH_STAFF');

INSERT INTO users (email, password, full_name, role_id, created_at, status, updated_at, phone)
SELECT 'sales@example.com', '$2a$10$axiNWb8X0Z6KovBfZg7aZ.h0YrydnUaSakKWoqbW3bjLJ2R/bDL4m', 'Sales Staff Demo', r.id, NOW(), 'ACTIVE', NOW(), '0900000003'
FROM roles r
WHERE UPPER(r.name) = 'SALES_STAFF'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'sales@example.com');

INSERT INTO users (email, password, full_name, role_id, created_at, status, updated_at, phone)
SELECT 'tech@example.com', '$2a$10$axiNWb8X0Z6KovBfZg7aZ.h0YrydnUaSakKWoqbW3bjLJ2R/bDL4m', 'Tech Staff Demo', r.id, NOW(), 'ACTIVE', NOW(), '0900000004'
FROM roles r
WHERE UPPER(r.name) = 'TECH_STAFF'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'tech@example.com');
