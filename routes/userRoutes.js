const express = require('express');
const { getBalance, updateBalance } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/balance', protect, getBalance);
router.post('/balance', protect, updateBalance);

// Profile route for frontend
router.get('/profile', protect, (req, res) => {
	res.json({
		_id: req.user._id,
		username: req.user.username,
		email: req.user.email,
	});
});

module.exports = router;
