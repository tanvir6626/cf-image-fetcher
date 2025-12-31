import express from 'express';
import axios from 'axios';
import { chromium } from 'playwright';

const app = express();
const PORT = 3000;

let cookieHeader = '';

async function loadCookies() {
  const context = await chromium.launchPersistentContext('./profile', {
    headless: true
  });

  const cookies = await context.cookies();
  await context.close();

  cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  console.log('Cookies loaded');
}

await loadCookies();

app.get('/image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).send('Missing url parameter');
    }

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Referer': 'https://samakal.com/',
        'Cookie': cookieHeader
      }
    });

    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Failed to fetch image');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
