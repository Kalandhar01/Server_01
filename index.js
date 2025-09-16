require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Product = require('./models/Product');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Price Tracker Backend API');
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// API endpoint to get product details by ID
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);
const scraperRoutes = require('./routes/scraperRoutes');
app.use('/api/scrape', scraperRoutes);

const wishlistRoutes = require('./routes/wishlistRoutes');
app.use('/api/wishlist', wishlistRoutes);


const trackedProductRoutes = require('./routes/trackedProductRoutes');
app.use('/api/tracked-products', trackedProductRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});