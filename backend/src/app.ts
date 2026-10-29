import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { mediaRouter } from './routes/media.routes';
import { errorHandler } from './middlewares/errorHandler';

export const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'jrflix-backend' });
});

app.use('/api/media', mediaRouter);

app.use(errorHandler);

