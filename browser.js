import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const targetUrl = process.argv[2];

if (!targetUrl) {
  console.error('❌ Usage: npm run browser https://example.com');
  process.exit(1);
}

const PROFILE_DIR = './profile';
const STORAGE_FILE = path.join(PROFILE_DIR, 'storage_state.json');

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await context.newPage();

  console.log(`Opening ${targetUrl} ...`);

  await page.goto(targetUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Give Cloudflare time to set cookies
  await page.waitForTimeout(20000);

  // 🔴 THIS WAS MISSING
  const state = await context.storageState();
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(state, null, 2));

  console.log(`
====================================
Cookies SAVED for:
${targetUrl}
File: ${STORAGE_FILE}
====================================
`);

  await context.close();
})();
