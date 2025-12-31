import { chromium } from 'playwright';

(async () => {
  const context = await chromium.launchPersistentContext('./profile', {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = await context.newPage();

  console.log('Opening website...');
  await page.goto('https://samakal.com', { waitUntil: 'networkidle' });

  console.log(`
====================================
ACTION REQUIRED:
Solve Cloudflare manually in browser
Then close the browser window
====================================
`);
})();
