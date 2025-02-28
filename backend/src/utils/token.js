const crypto = require('crypto');
const Token = require('../models/Token');

/**
 * Generate a random token
 * @returns {string} - Random token
 */
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a token in the database
 * @param {string} userId - User ID
 * @param {string} type - Token type ('password_reset' or 'email_verification')
 * @param {number} expiresInHours - Hours until token expiration
 * @returns {Promise<Object>} - Created token
 */
const createToken = async (userId, type, expiresInHours = 24) => {
  // Delete any existing tokens of this type for this user
  await Token.destroy({
    where: {
      userId,
      type
    }
  });

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  // Create new token
  const token = await Token.create({
    userId,
    token: generateRandomToken(),
    type,
    expiresAt
  });

  return token;
};

/**
 * Verify a token
 * @param {string} token - Token string
 * @param {string} type - Token type
 * @returns {Promise<Object|null>} - Token object if valid, null if invalid
 */
const verifyToken = async (token, type) => {
  const tokenRecord = await Token.findOne({
    where: {
      token,
      type
    }
  });

  if (!tokenRecord) {
    return null;
  }

  // Check if token is expired
  if (new Date() > new Date(tokenRecord.expiresAt)) {
    await tokenRecord.destroy();
    return null;
  }

  return tokenRecord;
};

/**
 * Delete a token
 * @param {string} tokenId - Token ID
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
const deleteToken = async (tokenId) => {
  const result = await Token.destroy({
    where: {
      id: tokenId
    }
  });

  return result > 0;
};

module.exports = {
  generateRandomToken,
  createToken,
  verifyToken,
  deleteToken
};
