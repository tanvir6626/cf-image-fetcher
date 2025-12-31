import { chromium } from 'playwright';

(async () => {
  const context = await chromium.launchPersistentContext('./profile', {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = await context.newPage();
  await page.goto('https://samakal.com', { waitUntil: 'networkidle' });

  console.log('Solve Cloudflare, then close browser');
})();
