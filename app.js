import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';

import syncDatabase from './config/syncDatabase.js';
import userRoute from './routes/userRoute.js';
import mapsRoute from './routes/mapsRoute.js';
import adminRoute from './routes/adminRoute.js';
import apiRoute from './routes/apiRoute.js';
import { removeExpiredUsers } from './services/handlerService.js';

dotenv.config();

const app = express();
app.use(express.json());

app
  .use(cors({ origin: '*' }))
  .use('/user', userRoute)
  .use('/api/v1/maps', mapsRoute)
  .use('/admin', adminRoute)
  .use('/api/v1/', apiRoute);

// Sincronizar banco de dados
syncDatabase();

// Cron job para remover usuários expirados diariamente à meia-noite
cron.schedule('0 0 * * *', () => {
  removeExpiredUsers();
  console.log('Remove Users JOB Executed.');
});

// Inicializar servidor
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
