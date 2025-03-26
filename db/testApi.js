const axios = require('axios');

// Configuración de la API
const API_URL = 'http://localhost:4000/api';
const TEST_USER = {
  email: 'john.doe@example.com',
  password: 'password123'
};

// Función para obtener token
async function getToken() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    console.log(`Token obtenido: ${response.data.token}`);
    return response.data.token;
  } catch (error) {
    console.error('Error al obtener token:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Función para probar registro de entrada
async function testEntry(token) {
  try {
    const response = await axios.post(
      `${API_URL}/attendance`,
      { action: 'entry' },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('Entrada registrada exitosamente:', response.data);
  } catch (error) {
    console.error('Error en la prueba:', error.response?.data || error.message);
  }
}

// Función para probar registro de salida
async function testExit(token) {
  try {
    const response = await axios.post(
      `${API_URL}/attendance`,
      { action: 'exit' },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('Salida registrada exitosamente:', response.data);
  } catch (error) {
    console.error('Error en la prueba:', error.response?.data || error.message);
  }
}

// Función para probar inicio de almuerzo
async function testLunchStart(token) {
  try {
    const response = await axios.post(
      `${API_URL}/attendance`,
      { action: 'lunch_start' },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('Inicio de almuerzo registrado exitosamente:', response.data);
  } catch (error) {
    console.error('Error en la prueba:', error.response?.data || error.message);
  }
}

// Función para probar fin de almuerzo
async function testLunchEnd(token) {
  try {
    const response = await axios.post(
      `${API_URL}/attendance`,
      { action: 'lunch_end' },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('Fin de almuerzo registrado exitosamente:', response.data);
  } catch (error) {
    console.error('Error en la prueba:', error.response?.data || error.message);
  }
}

// Función para probar obtención de registros
async function testGetRecords(token) {
  try {
    const response = await axios.get(
      `${API_URL}/attendance/records`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('Registros obtenidos:', response.data);
  } catch (error) {
    console.error('Error al obtener registros:', error.response?.data || error.message);
  }
}

// Ejecutar pruebas
async function runTests() {
  const token = await getToken();
  
  console.log('\nProbando registro de entrada...');
  await testEntry(token);

  console.log('\nProbando inicio de almuerzo...');
  await testLunchStart(token);

  console.log('\nProbando fin de almuerzo...');
  await testLunchEnd(token);

  console.log('\nProbando registro de salida...');
  await testExit(token);

  console.log('\nProbando obtención de registros...');
  await testGetRecords(token);
}

runTests();
