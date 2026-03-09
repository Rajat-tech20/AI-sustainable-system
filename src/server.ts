import express from 'express';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes';
import impactRoutes from './routes/impactRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/products', productRoutes);
app.use('/api/impact', impactRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
