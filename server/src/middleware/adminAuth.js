const jwt = require('jsonwebtoken');

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required', code: 401 });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token', code: 401 });
  }
}

module.exports = { adminAuthMiddleware };
