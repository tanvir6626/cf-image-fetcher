import { chromium } from 'playwright';

const targetUrl = process.argv[2];

if (!targetUrl) {
  console.error('❌ Please provide a URL');
  console.error('Example: npm run browser https://samakal.com');
  process.exit(1);
}

(async () => {
  const context = await chromium.launchPersistentContext('./profile', {
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

  // Give Cloudflare time to issue cookies
  await page.waitForTimeout(15000);

  console.log(`
====================================
Cookies generated for:
${targetUrl}
====================================
  `);

  await context.close();
})();
