import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

interface OpenMeteoResultItem {
  name?: string;
  country?: string;
  admin1?: string;
  timezone?: string;
}

interface OpenMeteoSearchResponse {
  results?: OpenMeteoResultItem[];
}

interface WorldTimeResponse {
  datetime?: string;
  utc_offset?: string;
}

/**
 * GET /api/timezone/search?query=tokyo
 * 城市搜索 + 时区解析（Open-Meteo Geocoding, free/no key）
 */
router.get('/search', async (req, res) => {
  const query = req.query.query as string;

  if (!query) {
    res.status(400).json({ error: 'Missing query param' });
    return;
  }

  try {
    // Free API: https://geocoding-api.open-meteo.com/v1/search
    const searchRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query
      )}&count=8&language=en&format=json`
    );

    const searchData = (await searchRes.json()) as OpenMeteoSearchResponse;

    if (!Array.isArray(searchData.results)) {
      res.json([]);
      return;
    }

    const results = searchData.results
      .filter((item) => item.name && item.timezone)
      .map((item) => ({
        city: item.name,
        country: item.country ?? '',
        region: item.admin1 ?? '',
        timezone: item.timezone,
      }));

    res.json(results);
  } catch (err) {
    console.error('🔴 Open-Meteo search error:', err);
    res.status(500).json({
      error: 'Open-Meteo search error',
      detail: String(err),
    });
  }
});

/**
 * GET /api/timezone/time?zone=Asia/Tokyo
 * 根据 timezone 获取当前时间
 */
router.get('/time', async (req, res) => {
  const zone = req.query.zone as string;

  if (!zone) {
    res.status(400).json({ error: 'Missing zone param' });
    return;
  }

  try {
    const timeRes = await fetch(`http://worldtimeapi.org/api/timezone/${zone}`);
    const timeData = (await timeRes.json()) as WorldTimeResponse;

    res.json({
      datetime: timeData.datetime,
      offset: timeData.utc_offset,
    });
  } catch (err) {
    console.error('🔴 WorldTimeAPI error:', err);
    res.status(500).json({
      error: 'WorldTimeAPI failed',
      detail: String(err),
    });
  }
});

export default router;
