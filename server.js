import express from 'express';
import axios from 'axios';
import fs from 'fs';

const app = express();
const PORT = 3000;

let cookieHeader = '';

function loadCookiesFromDisk() {
  try {
    const files = fs.readdirSync('./profile');
    if (!files.length) return false;

    // Playwright stores cookies in storage state
    const statePath = './profile/storage_state.json';
    if (!fs.existsSync(statePath)) return false;

    const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    cookieHeader = state.cookies
      .map(c => `${c.name}=${c.value}`)
      .join('; ');

    console.log('Cookies loaded from disk');
    return true;
  } catch {
    return false;
  }
}

// Load cookies IF they exist (do not crash if they don't)
loadCookiesFromDisk();

/* HEALTH CHECK — REQUIRED FOR COOLIFY */
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

/* IMAGE FETCH */
app.get('/image', async (req, res) => {
  if (!cookieHeader) {
    return res.status(503).send('Cookies not initialized');
  }

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
