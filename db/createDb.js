const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_7KkRFDotQT1X@ep-small-snowflake-a5re8byp-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

const createTables = async () => {
    try {
        // Leer el archivo SQL
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf8');
        
        // Ejecutar las queries
        await pool.query(schemaSQL);
        
        console.log('Base de datos creada exitosamente');
    } catch (error) {
        console.error('Error al crear la base de datos:', error);
    } finally {
        await pool.end();
    }
};

createTables();
