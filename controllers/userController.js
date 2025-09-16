const User = require('../models/User');

// Get user balance
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ balance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update user balance (add/subtract)
exports.updateBalance = async (req, res) => {
  const { amount } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.balance += Number(amount);
    await user.save();
    res.json({ balance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
