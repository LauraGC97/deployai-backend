import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.routes';
import authRoutes from './routes/auth.routes';

const app  = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://proyecto.vercel.app'
  ]

}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Deploy AI Backend' });
});

app.listen(PORT, () => {
  console.log(`🚀 Deploy backend corriendo en http://localhost:${PORT}`);
});