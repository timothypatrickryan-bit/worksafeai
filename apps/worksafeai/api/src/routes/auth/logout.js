module.exports = async (req, res) => {
  // Logout is typically handled client-side by removing tokens
  res.json({ message: 'Logged out successfully' });
};
