const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * 평문 비밀번호를 bcrypt 해시로 변환
 * @param {string} plain - 평문 비밀번호
 * @returns {Promise<string>} 해시된 비밀번호
 */
async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * 평문 비밀번호와 해시를 비교
 * @param {string} plain - 평문 비밀번호
 * @param {string} hash  - 저장된 해시
 * @returns {Promise<boolean>} 일치 여부
 */
async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, comparePassword };
