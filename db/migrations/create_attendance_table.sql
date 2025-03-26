-- Crear tabla de asistencia si no existe
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    entry_time DATETIME,
    exit_time DATETIME,
    lunch_start DATETIME,
    lunch_end DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Asegurarse de que todas las columnas existan
ALTER TABLE attendance
    ADD COLUMN IF NOT EXISTS entry_time DATETIME AFTER user_id,
    ADD COLUMN IF NOT EXISTS exit_time DATETIME AFTER entry_time,
    ADD COLUMN IF NOT EXISTS lunch_start DATETIME AFTER exit_time,
    ADD COLUMN IF NOT EXISTS lunch_end DATETIME AFTER lunch_start,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER lunch_end,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Asegurar que la clave foránea exista
ALTER TABLE attendance
    ADD CONSTRAINT IF NOT EXISTS fk_user_attendance
    FOREIGN KEY (user_id) REFERENCES users(id);
