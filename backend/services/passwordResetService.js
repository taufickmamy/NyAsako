const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const userModel = require('../models/userModel');
const passwordResetModel = require('../models/passwordResetModel');

const SALT_ROUNDS = 10;
const TOKEN_TTL_MS = 60 * 60 * 1000;

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createTransport = () => {
  if (!process.env.SMTP_HOST) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
};

const requestPasswordReset = async (email) => {
  const user = await userModel.findUserByEmail(email.trim().toLowerCase());
  if (!user) return { devLink: null };

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  await passwordResetModel.deleteForUser(user.id);
  await passwordResetModel.createToken(user.id, hashToken(token), expiresAt);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
  const transport = createTransport();

  if (transport) {
    await transport.sendMail({
      from: process.env.MAIL_FROM || '"NyAsako" <no-reply@nyasako.local>',
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe NyAsako',
      text: `Bonjour ${user.name},\n\nUtilisez ce lien pour réinitialiser votre mot de passe :\n${link}\n\nCe lien expire dans 1 heure.\n`,
      html: `<p>Bonjour ${user.name},</p><p><a href="${link}">Réinitialiser mon mot de passe</a></p><p>Ce lien expire dans 1 heure.</p>`,
    });
    return { devLink: null };
  }

  if (process.env.NODE_ENV === 'production') {
    throw httpError("Le service d'envoi d'e-mails n'est pas configuré.", 500);
  }

  console.log(`🔗 Lien de réinitialisation (développement) : ${link}`);
  return { devLink: link };
};

const resetPassword = async ({ token, email, password }) => {
  if (!token) throw httpError('Jeton de réinitialisation invalide.', 400);

  const record = await passwordResetModel.findValidToken(hashToken(token));
  const invalid =
    !record ||
    record.used_at ||
    new Date(record.expires_at).getTime() <= Date.now() ||
    (email && String(record.email).toLowerCase() !== String(email).toLowerCase());

  if (invalid) {
    throw httpError('Ce lien de réinitialisation est invalide ou a expiré.', 400);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const updated = await passwordResetModel.consumeToken(record.id, hashedPassword);
  if (!updated) {
    throw httpError('Ce lien de réinitialisation est invalide ou a expiré.', 400);
  }
  await passwordResetModel.deleteForUser(record.user_id);

  return { id: updated.id, email: updated.email };
};

module.exports = { requestPasswordReset, resetPassword };
