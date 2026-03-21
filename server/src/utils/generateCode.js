const crypto = require('crypto');

function generateBookingCode() {
  return 'RMI-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

module.exports = { generateBookingCode };
