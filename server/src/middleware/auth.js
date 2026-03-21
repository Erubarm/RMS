const { verifyVKLaunchParams, extractVKUserId } = require('../utils/vkSignature');
const prisma = require('../prisma');

async function authMiddleware(req, res, next) {
  const launchParams = req.headers['x-vk-launch-params'];

  if (!launchParams) {
    return res.status(401).json({ error: 'Missing VK launch params', code: 401 });
  }

  const secretKey = process.env.VK_SECURE_KEY;
  if (!verifyVKLaunchParams(launchParams, secretKey)) {
    return res.status(403).json({ error: 'Invalid VK signature', code: 403 });
  }

  const vkUserId = extractVKUserId(launchParams);
  if (!vkUserId) {
    return res.status(400).json({ error: 'Invalid VK user ID', code: 400 });
  }

  let user = await prisma.user.findUnique({ where: { vkId: vkUserId } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        vkId: vkUserId,
        firstName: '',
        lastName: '',
      },
    });
  }

  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions', code: 403 });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
