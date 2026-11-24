const db = require('../config/db');

const deleteForUser = (userId) =>
  db.query('DELETE FROM password_reset_tokens WHERE user_id = $1;', [userId]);

const createToken = async (userId, tokenHash, expiresAt) => {
  const { rows } = await db.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3) RETURNING id;`,
    [userId, tokenHash, expiresAt]
  );
  return rows[0];
};

const findValidToken = async (tokenHash) => {
  const { rows } = await db.query(
    `SELECT prt.id, prt.user_id, prt.expires_at, prt.used_at, u.email
     FROM password_reset_tokens prt
     JOIN users u ON u.id = prt.user_id
     WHERE prt.token_hash = $1;`,
    [tokenHash]
  );
  return rows[0];
};

const consumeToken = async (tokenId, passwordHash) => {
  const { rows } = await db.query(
    `WITH used AS (
       UPDATE password_reset_tokens
       SET used_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
       RETURNING user_id
     )
     UPDATE users SET password = $2
     FROM used
     WHERE users.id = used.user_id
     RETURNING users.id, users.email;`,
    [tokenId, passwordHash]
  );
  return rows[0];
};

module.exports = { deleteForUser, createToken, findValidToken, consumeToken };
