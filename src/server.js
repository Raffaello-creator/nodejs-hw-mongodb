import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { getContactsController } from './controllers/contacts.controller.js';
import { getContactByIdController } from './controllers/contacts.controller.js';

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(pino());
  app.use(express.json());

  app.get('/contacts', getContactsController);
  app.get('/contacts/:contactId', getContactByIdController);

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  return app;
};

if (process.env.NODE_ENV !== 'test') {
  const app = setupServer();
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
