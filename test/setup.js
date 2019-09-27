// Process .env variables
try {
  const env = require('@ifaxity/env');
  env.config({ path: `${__dirname}/.env` });
} catch {
  console.warn('Env file not found, file not loaded');
}
