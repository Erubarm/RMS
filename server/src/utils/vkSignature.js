const crypto = require('crypto');

function verifyVKLaunchParams(query, secretKey) {
  const params = new URLSearchParams(query);
  const sign = params.get('sign');
  if (!sign) return false;

  params.delete('sign');
  const sorted = [...params.entries()]
    .filter(([key]) => key.startsWith('vk_'))
    .sort(([a], [b]) => a.localeCompare(b));
  const queryString = new URLSearchParams(sorted).toString();
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(queryString)
    .digest('base64url');

  return hmac === sign;
}

function extractVKUserId(query) {
  const params = new URLSearchParams(query);
  return parseInt(params.get('vk_user_id'), 10);
}

module.exports = { verifyVKLaunchParams, extractVKUserId };
