import express from 'express';
import timeRoutes from './routes/timeRoutes';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use('/api', timeRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
