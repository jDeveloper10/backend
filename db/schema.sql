-- Tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'empleado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de registros de asistencia
CREATE TABLE IF NOT EXISTS asistencias (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER REFERENCES empleados(id),
    fecha DATE NOT NULL,
    hora_entrada TIMESTAMP WITH TIME ZONE,
    hora_salida TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(20) DEFAULT 'presente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de control de botones
CREATE TABLE IF NOT EXISTS control_botones (
    id SERIAL PRIMARY KEY,
    estado BOOLEAN DEFAULT true,
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar estado inicial del control de botones
INSERT INTO control_botones (estado) VALUES (true) ON CONFLICT DO NOTHING;
