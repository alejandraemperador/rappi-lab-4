import express from 'express';
import { NODE_ENV, PORT } from './config';
import cors from 'cors';
import { errorsMiddleware } from './middlewares/errorsMiddleware';
import { router as authRouter } from './features/auth/auth.router';
import { router as storesRouter } from './features/stores/stores.router';
import { router as productsRouter } from './features/products/products.router';
import { router as ordersRouter } from './features/orders/orders.router';

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://rappi-lab-4-fronted.vercel.app'
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
  res.send('Hello, World!!!!!');
});

// Routes
app.use('/api/orders', ordersRouter)
app.use('/api/products', productsRouter);
app.use ('/api/stores', storesRouter);
app.use('/api/auth', authRouter);

// Error handling middleware
app.use(errorsMiddleware);

if (NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
  });
}

export default app;
