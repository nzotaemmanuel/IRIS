import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbType = (process.env.DB_TYPE || 'LOCAL').toUpperCase();

let dbConfig: sql.config;

if (dbType === 'AZURE') {
  dbConfig = {
    user: process.env.DB_USER_AZURE || '',
    password: process.env.DB_PASS_AZURE || '',
    database: process.env.DB_NAME_AZURE || 'LASIMRA_IRIS',
    server: process.env.DB_SERVER_AZURE || '',
    port: parseInt(process.env.DB_PORT_AZURE || '1433', 10),
    pool: {
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: process.env.DB_ENCRYPT_AZURE === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERT_AZURE === 'true'
    }
  };
} else {
  // Default to LOCAL
  dbConfig = {
    user: process.env.DB_USER_LOCAL || process.env.DB_USER || '',
    password: process.env.DB_PASS_LOCAL || process.env.DB_PASS || '',
    database: process.env.DB_NAME_LOCAL || process.env.DB_NAME || 'LASIMRA_IRIS',
    server: process.env.DB_SERVER_LOCAL || process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT_LOCAL || process.env.DB_PORT || '1433', 10),
    pool: {
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: (process.env.DB_ENCRYPT_LOCAL || process.env.DB_ENCRYPT) === 'true',
      trustServerCertificate: (process.env.DB_TRUST_CERT_LOCAL || process.env.DB_TRUST_CERT) === 'true'
    }
  };
}

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log(`Connected to SQL Server (${dbType}): ${dbConfig.server}/${dbConfig.database}`);
    return pool;
  })
  .catch(err => {
    console.error(`Database Connection Failed (${dbType})! Bad Config: `, err);
    throw err;
  });

export { sql, poolPromise };

/**
 * Executes a query using the connection pool
 * @param query The SQL query string
 * @param params Optional object containing parameters for the query
 * @returns Result recordset
 */
export const executeQuery = async (query: string, params: Record<string, any> = {}) => {
  const pool = await poolPromise;
  const request = pool.request();
  
  // Add inputs based on parameter types
  Object.keys(params).forEach(key => {
    request.input(key, params[key]);
  });
  
  try {
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error(`Error executing query: ${query}`, err);
    throw err;
  }
};
