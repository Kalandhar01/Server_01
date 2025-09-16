const puppeteer = require('puppeteer');

async function scrapeFlipkart(url) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  const productName = await page.$eval('span.B_NuCI', el => el.textContent.trim());
  const productImage = await page.$eval('img._396cs4', el => el.src);
  const currentPriceText = await page.$eval('div._30jeq3._16Jk6d', el => el.textContent.trim());
  const originalPriceText = await page.$eval('div._3I9_wc._2p6lqe', el => el.textContent.trim()).catch(() => null);
  const description = await page.$eval('div._1mXcCf', el => el.textContent.trim()).catch(() => '');
  await browser.close();
  const currentPrice = currentPriceText ? parseFloat(currentPriceText.replace(/[^0-9.]/g, '')) : null;
  const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^0-9.]/g, '')) : null;
  return { productName, productImage, currentPrice, originalPrice, description };
}

async function scrapeMeesho(url) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  const productName = await page.$eval('h1', el => el.textContent.trim());
  const productImage = await page.$eval('img', el => el.src);
  const currentPriceText = await page.$eval('span.pdp-price', el => el.textContent.trim()).catch(() => null);
  const originalPriceText = await page.$eval('span.pdp-cut-price', el => el.textContent.trim()).catch(() => null);
  const description = await page.$eval('div.pdp-product-description-content', el => el.textContent.trim()).catch(() => '');
  await browser.close();
  const currentPrice = currentPriceText ? parseFloat(currentPriceText.replace(/[^0-9.]/g, '')) : null;
  const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^0-9.]/g, '')) : null;
  return { productName, productImage, currentPrice, originalPrice, description };
}

module.exports = { scrapeFlipkart, scrapeMeesho };
