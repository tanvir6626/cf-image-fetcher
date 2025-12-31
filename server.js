import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROFILE_DIR = path.join(__dirname, 'profile');
const STORAGE_FILE = path.join(PROFILE_DIR, 'storage_state.json');

/* ---------- Helpers ---------- */

function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function loadCookiesForDomain(domain) {
  if (!fs.existsSync(STORAGE_FILE)) return '';

  const state = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf-8'));
  if (!state.cookies) return '';

  const cookies = state.cookies.filter(c =>
    domain === c.domain.replace(/^\./, '') ||
    domain.endsWith(c.domain.replace(/^\./, ''))
  );

  return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

/* ---------- Health Check ---------- */

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

/* ---------- Image Fetch ---------- */

app.get('/image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).send('Missing url parameter');
  }

  const domain = getDomainFromUrl(imageUrl);
  if (!domain) {
    return res.status(400).send('Invalid URL');
  }

  const cookieHeader = loadCookiesForDomain(domain);
  if (!cookieHeader) {
    return res.status(503).send(
      `No cookies found for domain: ${domain}. Run npm run browser https://${domain}`
    );
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Referer': `https://${domain}/`,
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

/* ---------- Start ---------- */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
