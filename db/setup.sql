 -- Crear tipo ENUM para roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Crear tipo ENUM para status
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');

-- Crear tabla users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Crear tabla schedules
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  lunch_start TIME,
  lunch_end TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Crear trigger para schedules
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Crear tabla attendance
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  lunch_start TIMESTAMP,
  lunch_end TIMESTAMP,
  status attendance_status DEFAULT 'present',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Crear trigger para attendance
CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar usuarios de prueba
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john.doe@example.com', '$2a$10$xKR8HhzaZpXAvx.ce0mYu.TCZyiV3nnJ6kEz0TYepaHxKTrHQZqGi', 'user'),
('Jane Smith', 'jane.smith@example.com', '$2a$10$xKR8HhzaZpXAvx.ce0mYu.TCZyiV3nnJ6kEz0TYepaHxKTrHQZqGi', 'user'),
('Admin User', 'admin@example.com', '$2a$10$xKR8HhzaZpXAvx.ce0mYu.TCZyiV3nnJ6kEz0TYepaHxKTrHQZqGi', 'admin');

-- Insertar horarios por defecto para los usuarios
INSERT INTO schedules (user_id, start_time, end_time)
SELECT id, '09:00:00', '18:00:00'
FROM users
WHERE role = 'user';
