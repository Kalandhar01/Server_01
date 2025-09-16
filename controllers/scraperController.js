const puppeteer = require('puppeteer');
const Product = require('../models/Product');
const crypto = require('crypto');

async function scrapeAmazon(url) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#productTitle');
  const productName = await page.$eval('#productTitle', el => el.textContent.trim());
  const productImage = await page.$eval('#landingImage', el => el.src).catch(() => '');
  const currentPriceText = await page.$eval('.a-price-whole', el => el.textContent.trim()).catch(() => null);
  const fraction = await page.$eval('.a-price-fraction', el => el.textContent.trim()).catch(() => '');
  const originalPriceText = await page.$eval('span.a-text-strike', el => el.textContent.trim()).catch(() => null);
  const currentPrice = currentPriceText ? parseFloat((currentPriceText + fraction).replace(/[^0-9.]/g, '')) : null;
  const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^0-9.]/g, '')) : null;
  const description = await page.$eval('#productDescription', el => el.textContent.trim()).catch(() => '');
  await browser.close();
  return { productName, productImage, currentPrice, originalPrice, description };
}

async function scrapeFlipkart(url) {
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  try {
    await page.waitForSelector('span.B_NuCI', { timeout: 10000 });
    const productName = await page.$eval('span.B_NuCI', el => el.textContent.trim());
    const productImage = await page.$eval('img._396cs4', el => el.src).catch(() => '');
    const currentPriceText = await page.$eval('div._30jeq3._16Jk6d', el => el.textContent.trim()).catch(() => null);
    const originalPriceText = await page.$eval('div._3I9_wc._2p6lqe', el => el.textContent.trim()).catch(() => null);
    const currentPrice = currentPriceText ? parseFloat(currentPriceText.replace(/[^0-9.]/g, '')) : null;
    const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^0-9.]/g, '')) : null;
    const description = await page.$eval('div._1mXcCf', el => el.textContent.trim()).catch(() => '');
    await browser.close();
    return { productName, productImage, currentPrice, originalPrice, description };
  } catch (err) {
    const html = await page.content();
    console.error('Flipkart scraping error:', err);
    console.error('Flipkart page HTML:', html);
    await browser.close();
    throw err;
  }
}

async function scrapeMeesho(url) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('h1');
  const productName = await page.$eval('h1', el => el.textContent.trim());
  const productImage = await page.$eval('img', el => el.src).catch(() => '');
  const currentPriceText = await page.$eval('span.pdp-price', el => el.textContent.trim()).catch(() => null);
  const originalPriceText = await page.$eval('span.pdp-cut-price', el => el.textContent.trim()).catch(() => null);
  const currentPrice = currentPriceText ? parseFloat(currentPriceText.replace(/[^0-9.]/g, '')) : null;
  const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^0-9.]/g, '')) : null;
  const description = await page.$eval('div.pdp-product-description-content', el => el.textContent.trim()).catch(() => '');
  await browser.close();
  return { productName, productImage, currentPrice, originalPrice, description };
}

exports.scrapeProduct = async (req, res) => {
  const { productUrl } = req.body;
  if (!productUrl) {
    return res.status(400).json({ message: 'Product URL is required' });
  }
  try {
    const hash = crypto.createHash('sha256').update(productUrl).digest('hex');
    let productDetails = {};
    const url = new URL(productUrl);
    const hostname = url.hostname;
    if (hostname.includes('amazon')) {
      productDetails = await scrapeAmazon(productUrl);
    } else if (hostname.includes('flipkart')) {
      productDetails = await scrapeFlipkart(productUrl);
    } else if (hostname.includes('meesho')) {
      productDetails = await scrapeMeesho(productUrl);
    } else {
      return res.status(400).json({ message: 'Unsupported website for scraping.' });
    }
    const { productName, productImage, currentPrice, originalPrice, description } = productDetails;
    if (!productName || !currentPrice) {
      return res.status(404).json({ message: 'Could not scrape product details. Check URL or selectors.' });
    }
    let product = await Product.findOne({ hash: hash });
    if (product) {
      product.title = productName;
      product.currentPrice = currentPrice;
      product.originalPrice = originalPrice;
      product.imageUrls = [productImage].filter(Boolean);
      product.description = description;
      product.url = productUrl;
      product.hash = hash;
    } else {
      product = new Product({
        url: productUrl,
        hash: hash,
        title: productName,
        currentPrice: currentPrice,
        originalPrice: originalPrice,
        imageUrls: [productImage].filter(Boolean),
        description: description,
      });
    }
    await product.save();
    const { checkAndNotifyTargetPrice } = require('./notificationController');
    await checkAndNotifyTargetPrice(product);
    res.status(200).json({
      _id: product._id,
      productName,
      productImage,
      currentPrice,
      originalPrice,
      description,
      message: 'Product scraped and stored successfully',
    });
  } catch (error) {
    console.error(`Error scraping product from ${productUrl}:`, error);
    res.status(500).json({ message: 'Error scraping product', error: error.message });
  }
};

function scrapeFlipkart($) {
  let productName = $('span.B_NuCI').text().trim();
  if (!productName) productName = $('h1').first().text().trim();
  let productImage = $('img._396cs4').attr('src');
  if (!productImage) productImage = $('img').first().attr('src');
  let currentPriceText = $('div._30jeq3._16Jk6d').first().text().trim();
  if (!currentPriceText) currentPriceText = $('._30jeq3').first().text().trim();
  let originalPriceText = $('div._3I9_wc._2p6lqe').first().text().trim();
  if (!originalPriceText) originalPriceText = $('._3I9_wc').first().text().trim();
  const currentPrice = currentPriceText ? parseFloat(currentPriceText.replace(/[^0-9.]/g, '')) : null;
  const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^0-9.]/g, '')) : null;
  let description = $('div._1mXcCf').text().trim();
  if (!description) description = $('div').filter((i, el) => $(el).text().length > 100).first().text().trim();
  if (!productName || !currentPrice) {
    console.error('Flipkart scraping failed:', { productName, productImage, currentPriceText, originalPriceText, description });
  }
  return { productName, productImage, currentPrice, originalPrice, description };
}

function scrapeMeesho($) {
  let productName = $('h1').first().text().trim();
  if (!productName) productName = $('title').text().trim();
  let productImage = $('img').first().attr('src');
  let currentPriceText = $('span.pdp-price').first().text().trim();
  if (!currentPriceText) currentPriceText = $('span').filter((i, el) => $(el).text().includes('₹')).first().text().trim();
  let originalPriceText = $('span.pdp-cut-price').first().text().trim();
  const currentPrice = currentPriceText ? parseFloat(currentPriceText.replace(/[^0-9.]/g, '')) : null;
  const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^0-9.]/g, '')) : null;
  let description = $('div.pdp-product-description-content').text().trim();
  if (!description) description = $('meta[name="description"]').attr('content') || '';
  if (!productName || !currentPrice) {
    console.error('Meesho scraping failed:', { productName, productImage, currentPriceText, originalPriceText, description });
  }
  return { productName, productImage, currentPrice, originalPrice, description };
}