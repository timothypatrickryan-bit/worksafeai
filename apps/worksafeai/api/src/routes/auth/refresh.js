const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    const accessToken = jwt.sign(
      { userId: decoded.userId, companyId: decoded.companyId, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};
