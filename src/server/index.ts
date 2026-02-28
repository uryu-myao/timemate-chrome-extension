import express from 'express';
import cors from 'cors';
import timezoneRoutes from './timezone';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/timezone', timezoneRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🟢 API Server is running at http://localhost:${PORT}`);
});
