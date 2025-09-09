import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const swaggerFile = path.resolve('docs/swagger.json');
let swaggerDocument = {};
try {
  swaggerDocument = JSON.parse(fs.readFileSync(swaggerFile, 'utf8'));
} catch (err) {
  console.error('Swagger JSON not found or invalid:', err);
}

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
