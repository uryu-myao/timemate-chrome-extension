import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

router.get('/timezone', async (req, res) => {
  const apiKey = process.env.TIMEZONE_API_KEY;
  const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=zone&zone=Asia/Tokyo`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch timezone data' });
  }
});

export default router;
