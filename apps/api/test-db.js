const { Pool } = require('pg');
const connectionString = "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=1&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&single_use_connections=true&socket_timeout=0";
const pool = new Pool({ connectionString });
console.log('Attempting to connect to:', connectionString);
pool.connect().then(client => {
  console.log('Connected successfully');
  client.release();
  pool.end();
}).catch(err => {
  console.error('Connection failed:', err);
  pool.end();
});
