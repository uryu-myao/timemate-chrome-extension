import express from 'express';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
const router = express.Router();

router.get('/timezone', async (_req: Request, res: Response) => {
  const apiKey = process.env.TIMEZONE_API_KEY;
  const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=zone&zone=Asia/Tokyo`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
  }
});

export default router;
