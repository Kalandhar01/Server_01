const axios = require('axios');
const cheerio = require('cheerio');
const Product = require('../models/Product');
const crypto = require('crypto');

exports.scrapeProduct = async (req, res) => {
  const { productUrl } = req.body;

  if (!productUrl) {
    return res.status(400).json({ message: 'Product URL is required' });
  }

  // Basic URL validation
  try {
    new URL(productUrl);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid URL format' });
  }

  console.log(`Received product link: ${productUrl}`);
    const hash = crypto.createHash('sha256').update(productUrl).digest('hex');

  try {
    const { data } = await axios.get(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const $ = cheerio.load(data);

    let productDetails = {};

    const url = new URL(productUrl);
    const hostname = url.hostname;

    if (hostname.includes('amazon')) {
      productDetails = scrapeAmazon($);
    } else {
      return res.status(400).json({ message: 'Unsupported website for scraping.' });
    }

    const { productName, productImage, currentPrice, originalPrice, description } = productDetails;

    if (!productName || !currentPrice) {
      return res.status(404).json({ message: 'Could not scrape product details. Check URL or selectors.' });
    }

    // Store the product key (URL in this case) in the database
    let product = await Product.findOne({ hash: hash });

    if (product) {
      // Update existing product
      product.title = productName;
      product.currentPrice = currentPrice;
      product.originalPrice = originalPrice;
      product.imageUrls = [productImage].filter(Boolean);
      product.description = description;
      product.url = productUrl;
      product.hash = hash;
    } else {
      // Create new product
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

    console.log('Processed product data:', { productName, productImage, currentPrice, originalPrice, description });
    res.status(200).json({
      productName,
      productImage,
      currentPrice: currentPrice,
      originalPrice: originalPrice,
      description,
      message: 'Product scraped and stored successfully',
    });
  } catch (error) {
    console.error(`Error scraping product from ${productUrl}:`, error);
    if (error.code === 11000) {
      // Duplicate key error (E11000) for unique index
      return res.status(409).json({
        message: 'Product with this URL already exists or a hash collision occurred.',
        error: error.message,
      });
    }
    res.status(500).json({ message: 'Error scraping product', error: error.message });
  }
};


function scrapeAmazon($) {
  const productName = $('#productTitle').text().trim();
  console.log('Scraped productName:', productName);
  const productImage = $('#landingImage').attr('src');
  console.log('Scraped productImage:', productImage);
  const currentPriceText = $('.a-price-whole').first().text().trim() + $('.a-price-fraction').first().text().trim();
  console.log('Scraped currentPriceText:', currentPriceText);
  const originalPriceText = $('span.a-text-strike').first().text().trim();
  console.log('Scraped originalPriceText:', originalPriceText);


  const currentPrice = currentPriceText ? parseFloat(currentPriceText.replace(/[^0-9.]/g, '')) : null;
  console.log('Parsed currentPrice:', currentPrice);
  const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^0-9.]/g, '')) : null;
  console.log('Parsed originalPrice:', originalPrice);
  const description = $('#productDescription').text().trim();
  console.log('Scraped description:', description);


  return { productName, productImage, currentPrice, originalPrice, description };
}

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