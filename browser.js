import { chromium } from 'playwright';

(async () => {
  const context = await chromium.launchPersistentContext('./profile', {
    headless: true, // REQUIRED on servers
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await context.newPage();

  console.log('Opening website...');
  await page.goto('https://samakal.com', { waitUntil: 'networkidle' });

  console.log(`
====================================
Cloudflare cookies should now be saved
You can safely stop this process
====================================
  `);

  // Keep browser open briefly to ensure cookies flush
  await page.waitForTimeout(10000);
  await context.close();
})();
