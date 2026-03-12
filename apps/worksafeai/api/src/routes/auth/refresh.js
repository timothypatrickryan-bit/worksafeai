const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // CRITICAL FIX: Specify algorithm to prevent algorithm confusion attacks
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET, { 
      algorithms: ['HS256']
    });
    
    // Validate all required fields
    if (!decoded.userId || !decoded.companyId) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    const accessToken = jwt.sign(
      { 
        userId: decoded.userId, 
        companyId: decoded.companyId, 
        role: decoded.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error('❌ Refresh token error:', error.message);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};
